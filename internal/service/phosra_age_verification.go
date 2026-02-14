package service

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

// PhosraAgeVerificationService manages age gates, parental consent gates,
// and social media minimum age enforcement — filling Norton Family's "none"
// on social_media_min_age and partial gaps across many providers.
type PhosraAgeVerificationService struct {
	ageRecords repository.AgeVerificationRepository
	children   repository.ChildRepository
}

func NewPhosraAgeVerificationService(ageRecords repository.AgeVerificationRepository, children repository.ChildRepository) *PhosraAgeVerificationService {
	return &PhosraAgeVerificationService{ageRecords: ageRecords, children: children}
}

func (s *PhosraAgeVerificationService) HandledCategories() []domain.RuleCategory {
	return []domain.RuleCategory{
		domain.RuleAgeGate,
		domain.RuleParentalConsentGate,
		domain.RuleSocialMediaMinAge,
	}
}

func (s *PhosraAgeVerificationService) EnforceRules(ctx context.Context, childID, _ uuid.UUID, rules []domain.PolicyRule) (*provider.EnforcementResult, error) {
	applied := 0
	details := make(map[string]any)

	child, err := s.children.GetByID(ctx, childID)
	if err != nil {
		return nil, err
	}
	childAge := child.Age()

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}

		now := time.Now()
		rec := &domain.AgeVerificationRecord{
			ChildID:          childID,
			VerificationType: string(rule.Category),
			PlatformID:       "phosra",
			Verified:         true,
			VerifiedAt:       &now,
			Config:           rule.Config,
		}
		if err := s.ageRecords.Upsert(ctx, rec); err != nil {
			return nil, err
		}
		applied++

		detail := map[string]any{"status": "applied", "child_age": childAge}
		var cfg map[string]any
		if json.Unmarshal(rule.Config, &cfg) == nil {
			for k, v := range cfg {
				detail[k] = v
			}
		}
		details[string(rule.Category)] = detail
	}

	return &provider.EnforcementResult{
		RulesApplied: applied,
		Details:      details,
		Message:      "Phosra Age Verification Service: gates configured",
	}, nil
}
