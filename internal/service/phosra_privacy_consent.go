package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

// PhosraPrivacyConsentService manages data sharing controls, data deletion
// requests, commercial data bans, and geolocation opt-in — filling Norton
// Family's "none" on privacy_data_sharing and partial gaps across providers.
type PhosraPrivacyConsentService struct {
	privacyRequests repository.PrivacyRequestRepository
}

func NewPhosraPrivacyConsentService(privacyRequests repository.PrivacyRequestRepository) *PhosraPrivacyConsentService {
	return &PhosraPrivacyConsentService{privacyRequests: privacyRequests}
}

func (s *PhosraPrivacyConsentService) HandledCategories() []domain.RuleCategory {
	return []domain.RuleCategory{
		domain.RulePrivacyDataSharing,
		domain.RuleDataDeletionRequest,
		domain.RuleCommercialDataBan,
		domain.RuleGeolocationOptIn,
	}
}

func (s *PhosraPrivacyConsentService) EnforceRules(ctx context.Context, childID, familyID uuid.UUID, rules []domain.PolicyRule) (*provider.EnforcementResult, error) {
	applied := 0
	details := make(map[string]any)

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}

		now := time.Now()
		req := &domain.PrivacyRequest{
			ChildID:     childID,
			FamilyID:    familyID,
			RequestType: string(rule.Category),
			PlatformID:  "all",
			Status:      "active",
			Config:      rule.Config,
			SubmittedAt: &now,
		}
		if err := s.privacyRequests.Create(ctx, req); err != nil {
			return nil, err
		}
		applied++
		details[string(rule.Category)] = map[string]any{
			"status":  "applied",
			"handler": "phosra_privacy_consent",
		}
	}

	return &provider.EnforcementResult{
		RulesApplied: applied,
		Details:      details,
		Message:      "Phosra Privacy & Consent Service: policies enforced",
	}, nil
}
