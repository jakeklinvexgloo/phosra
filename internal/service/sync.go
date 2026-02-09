package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

var (
	ErrEnforcementJobNotFound  = errors.New("enforcement job not found")
	ErrComplianceLinkNotFound  = errors.New("compliance link not found")
	ErrNoActivePolicy          = errors.New("no active policy found")
)

type EnforcementService struct {
	enforcementJobs    repository.EnforcementJobRepository
	enforcementResults repository.EnforcementResultRepository
	complianceLinks    repository.ComplianceLinkRepository
	policies           repository.PolicyRepository
	rules              repository.PolicyRuleRepository
	children           repository.ChildRepository
	members            repository.FamilyMemberRepository
	registry           *provider.Registry
}

func NewEnforcementService(
	enforcementJobs repository.EnforcementJobRepository,
	enforcementResults repository.EnforcementResultRepository,
	complianceLinks repository.ComplianceLinkRepository,
	policies repository.PolicyRepository,
	rules repository.PolicyRuleRepository,
	children repository.ChildRepository,
	members repository.FamilyMemberRepository,
	registry *provider.Registry,
) *EnforcementService {
	return &EnforcementService{
		enforcementJobs:    enforcementJobs,
		enforcementResults: enforcementResults,
		complianceLinks:    complianceLinks,
		policies:           policies,
		rules:              rules,
		children:           children,
		members:            members,
		registry:           registry,
	}
}

func (s *EnforcementService) TriggerEnforcement(ctx context.Context, userID, childID uuid.UUID, triggerType string) (*domain.EnforcementJob, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkMembership(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}

	// Find active policy
	policies, err := s.policies.ListByChild(ctx, childID)
	if err != nil {
		return nil, err
	}
	var activePolicy *domain.ChildPolicy
	for i := range policies {
		if policies[i].Status == domain.PolicyActive {
			activePolicy = &policies[i]
			break
		}
	}
	if activePolicy == nil {
		return nil, ErrNoActivePolicy
	}

	now := time.Now()
	job := &domain.EnforcementJob{
		ID:          uuid.New(),
		ChildID:     childID,
		PolicyID:    activePolicy.ID,
		TriggerType: triggerType,
		Status:      domain.EnforcementRunning,
		StartedAt:   &now,
		CreatedAt:   now,
	}
	if err := s.enforcementJobs.Create(ctx, job); err != nil {
		return nil, fmt.Errorf("create enforcement job: %w", err)
	}

	// Get rules
	rules, err := s.rules.ListByPolicy(ctx, activePolicy.ID)
	if err != nil {
		return nil, err
	}

	// Get compliance links
	links, err := s.complianceLinks.ListByFamily(ctx, child.FamilyID)
	if err != nil {
		return nil, err
	}

	// Fan out to all verified platforms
	go s.executeEnforcementFanOut(context.Background(), job, rules, links, child.Name, child.Age())

	return job, nil
}

func (s *EnforcementService) executeEnforcementFanOut(ctx context.Context, job *domain.EnforcementJob, rules []domain.PolicyRule, links []domain.ComplianceLink, childName string, childAge int) {
	var hasFailure, hasSuccess bool

	for _, link := range links {
		if link.Status != "verified" {
			continue
		}

		adapter, ok := s.registry.Get(link.PlatformID)
		if !ok {
			continue
		}

		now := time.Now()
		result := &domain.EnforcementResult{
			ID:               uuid.New(),
			EnforcementJobID: job.ID,
			ComplianceLinkID: link.ID,
			PlatformID:       link.PlatformID,
			Status:           domain.EnforcementRunning,
			StartedAt:        &now,
		}
		_ = s.enforcementResults.Create(ctx, result)

		enfReq := provider.EnforcementRequest{
			Rules:      rules,
			AuthConfig: provider.AuthConfig{EncryptedCreds: link.EncryptedCreds},
			ChildName:  childName,
			ChildAge:   childAge,
		}

		enfResult, err := adapter.EnforcePolicy(ctx, enfReq)
		completedAt := time.Now()
		result.CompletedAt = &completedAt

		if err != nil {
			hasFailure = true
			errMsg := err.Error()
			result.Status = domain.EnforcementFailed
			result.ErrorMessage = &errMsg
		} else {
			hasSuccess = true
			result.Status = domain.EnforcementCompleted
			result.RulesApplied = enfResult.RulesApplied
			result.RulesSkipped = enfResult.RulesSkipped
			result.RulesFailed = enfResult.RulesFailed
			if enfResult.Details != nil {
				detailsJSON, _ := json.Marshal(enfResult.Details)
				result.Details = detailsJSON
			}
			if enfResult.RulesFailed > 0 {
				result.Status = domain.EnforcementPartial
				hasFailure = true
			}
		}

		_ = s.enforcementResults.Update(ctx, result)

		// Update compliance link enforcement status
		link.LastEnforcementAt = &completedAt
		link.LastEnforcementStatus = string(result.Status)
		_ = s.complianceLinks.Update(ctx, &link)
	}

	// Update job status
	completedAt := time.Now()
	job.CompletedAt = &completedAt
	switch {
	case hasSuccess && !hasFailure:
		job.Status = domain.EnforcementCompleted
	case hasSuccess && hasFailure:
		job.Status = domain.EnforcementPartial
	case hasFailure:
		job.Status = domain.EnforcementFailed
	default:
		job.Status = domain.EnforcementCompleted
	}
	_ = s.enforcementJobs.Update(ctx, job)
}

func (s *EnforcementService) TriggerLinkEnforcement(ctx context.Context, userID, linkID uuid.UUID) (*domain.EnforcementJob, error) {
	link, err := s.complianceLinks.GetByID(ctx, linkID)
	if err != nil || link == nil {
		return nil, ErrComplianceLinkNotFound
	}
	// Find children in the family and enforce them all
	children, err := s.children.ListByFamily(ctx, link.FamilyID)
	if err != nil {
		return nil, err
	}
	if len(children) == 0 {
		return nil, ErrChildNotFound
	}
	// Enforce the first child as representative (full enforcement would iterate all)
	return s.TriggerEnforcement(ctx, userID, children[0].ID, "manual")
}

func (s *EnforcementService) GetJob(ctx context.Context, userID, jobID uuid.UUID) (*domain.EnforcementJob, error) {
	return s.enforcementJobs.GetByID(ctx, jobID)
}

func (s *EnforcementService) GetJobResults(ctx context.Context, userID, jobID uuid.UUID) ([]domain.EnforcementResult, error) {
	return s.enforcementResults.ListByJob(ctx, jobID)
}

func (s *EnforcementService) ListJobsByChild(ctx context.Context, userID, childID uuid.UUID, limit int) ([]domain.EnforcementJob, error) {
	return s.enforcementJobs.ListByChild(ctx, childID, limit)
}

func (s *EnforcementService) RetryJob(ctx context.Context, userID, jobID uuid.UUID) (*domain.EnforcementJob, error) {
	oldJob, err := s.enforcementJobs.GetByID(ctx, jobID)
	if err != nil || oldJob == nil {
		return nil, ErrEnforcementJobNotFound
	}
	return s.TriggerEnforcement(ctx, userID, oldJob.ChildID, "manual")
}

func (s *EnforcementService) checkMembership(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	return nil
}
