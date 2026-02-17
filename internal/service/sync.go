package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/engine"
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
	compositeEngine    *engine.CompositeEngine
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
	compositeEngine *engine.CompositeEngine,
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
		compositeEngine:    compositeEngine,
	}
}

func (s *EnforcementService) TriggerEnforcement(ctx context.Context, userID, childID uuid.UUID, triggerType string, platformIDs []string) (*domain.EnforcementJob, error) {
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

	// Fan out to all verified platforms (with composite engine for overflow rules)
	go s.executeEnforcementFanOut(context.Background(), job, rules, links, child.FamilyID, child.Name, child.Age(), platformIDs)

	return job, nil
}

func (s *EnforcementService) executeEnforcementFanOut(ctx context.Context, job *domain.EnforcementJob, rules []domain.PolicyRule, links []domain.ComplianceLink, familyID uuid.UUID, childName string, childAge int, platformIDs []string) {
	var hasFailure, hasSuccess bool

	for _, link := range links {
		if link.Status != "verified" {
			continue
		}
		// Skip platforms not in the requested filter (if specified)
		if len(platformIDs) > 0 && !containsString(platformIDs, link.PlatformID) {
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

		// Use composite engine to route rules between native adapter and Phosra services
		routing := s.compositeEngine.RouteRules(adapter, rules)

		// 1. Native enforcement — send only the rules the adapter can handle
		var nativeResult *provider.EnforcementResult
		var nativeErr error
		if len(routing.NativeRules) > 0 {
			enfReq := provider.EnforcementRequest{
				Rules:      routing.NativeRules,
				AuthConfig: provider.AuthConfig{EncryptedCreds: link.EncryptedCreds},
				ChildName:  childName,
				ChildAge:   childAge,
			}
			nativeResult, nativeErr = adapter.EnforcePolicy(ctx, enfReq)
		}

		// 2. Phosra service enforcement — handle overflow rules
		var phosraResult *provider.EnforcementResult
		var phosraErr error
		if len(routing.PhosraRules) > 0 {
			phosraResult, phosraErr = s.compositeEngine.EnforcePhosraRules(ctx, job.ChildID, familyID, routing)
		}

		// 3. Merge results
		completedAt := time.Now()
		result.CompletedAt = &completedAt

		if nativeErr != nil {
			hasFailure = true
			errMsg := nativeErr.Error()
			result.Status = domain.EnforcementFailed
			result.ErrorMessage = &errMsg
		} else {
			hasSuccess = true
			result.Status = domain.EnforcementCompleted

			// Merge native + phosra results
			mergedDetails := make(map[string]any)
			totalApplied := 0
			totalSkipped := 0
			totalFailed := 0

			if nativeResult != nil {
				totalApplied += nativeResult.RulesApplied
				totalSkipped += nativeResult.RulesSkipped
				totalFailed += nativeResult.RulesFailed
				for k, v := range nativeResult.Details {
					mergedDetails[k] = v
				}
			}

			if phosraResult != nil && phosraErr == nil {
				totalApplied += phosraResult.RulesApplied
				totalFailed += phosraResult.RulesFailed
				for k, v := range phosraResult.Details {
					mergedDetails[k] = v
				}
			} else if phosraErr != nil {
				// Phosra service error — count overflow rules as failed
				for _, phosraRules := range routing.PhosraRules {
					totalFailed += len(phosraRules)
				}
			}

			result.RulesApplied = totalApplied
			result.RulesSkipped = totalSkipped
			result.RulesFailed = totalFailed
			if len(mergedDetails) > 0 {
				detailsJSON, _ := json.Marshal(mergedDetails)
				result.Details = detailsJSON
			}
			if totalFailed > 0 {
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
	return s.TriggerEnforcement(ctx, userID, children[0].ID, "manual", nil)
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
	return s.TriggerEnforcement(ctx, userID, oldJob.ChildID, "manual", nil)
}

func containsString(slice []string, s string) bool {
	for _, v := range slice {
		if v == s {
			return true
		}
	}
	return false
}

func (s *EnforcementService) checkMembership(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	return nil
}
