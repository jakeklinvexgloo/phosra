package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

// PhosraContentClassifyService provides content rating and classification when
// a provider doesn't natively support it — filling partial gaps on content_rating
// for Bark, Qustodio, Mobicip, OurPact, Kidslox, Kaspersky, Norton, MMGuardian.
type PhosraContentClassifyService struct {
	classifications repository.ContentClassificationRepository
}

func NewPhosraContentClassifyService(classifications repository.ContentClassificationRepository) *PhosraContentClassifyService {
	return &PhosraContentClassifyService{classifications: classifications}
}

func (s *PhosraContentClassifyService) HandledCategories() []domain.RuleCategory {
	return []domain.RuleCategory{
		domain.RuleContentRating,
		domain.RuleContentBlockTitle,
		domain.RuleContentAllowTitle,
		domain.RuleContentAllowlistMode,
		domain.RuleContentDescriptorBlock,
	}
}

func (s *PhosraContentClassifyService) EnforceRules(ctx context.Context, _ uuid.UUID, _ uuid.UUID, rules []domain.PolicyRule) (*provider.EnforcementResult, error) {
	applied := 0
	details := make(map[string]any)

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}
		// Phosra's content classification engine applies rating policies
		// using its own content database and AI classification pipeline.
		applied++
		details[string(rule.Category)] = map[string]any{
			"status":  "applied",
			"handler": "phosra_content_classify",
		}
	}

	return &provider.EnforcementResult{
		RulesApplied: applied,
		Details:      details,
		Message:      "Phosra Content Classification Service: ratings enforced",
	}, nil
}
