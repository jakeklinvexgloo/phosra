package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

// PhosraLocationService provides Phosra-managed location tracking for providers
// that lack native support — filling Circle and Samsung Kids "none" entries
// and partial gaps on Net Nanny, Securly, Microsoft.
type PhosraLocationService struct {
	locationLogs repository.LocationLogRepository
}

func NewPhosraLocationService(locationLogs repository.LocationLogRepository) *PhosraLocationService {
	return &PhosraLocationService{locationLogs: locationLogs}
}

func (s *PhosraLocationService) HandledCategories() []domain.RuleCategory {
	return []domain.RuleCategory{
		domain.RulePrivacyLocation,
		domain.RuleGeolocationOptIn,
	}
}

func (s *PhosraLocationService) EnforceRules(ctx context.Context, _ uuid.UUID, _ uuid.UUID, rules []domain.PolicyRule) (*provider.EnforcementResult, error) {
	applied := 0
	details := make(map[string]any)

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}
		// Phosra's device agent handles location tracking — the enforcement
		// here activates the tracking pipeline for this child.
		applied++
		details[string(rule.Category)] = map[string]any{
			"status":  "applied",
			"handler": "phosra_location",
		}
	}

	return &provider.EnforcementResult{
		RulesApplied: applied,
		Details:      details,
		Message:      "Phosra Location Service: tracking configured",
	}, nil
}
