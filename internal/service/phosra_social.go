package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

// PhosraSocialService fills Circle's "none" on social_chat_control and
// partial gaps on social monitoring, DM restrictions, and chat filtering.
type PhosraSocialService struct {
	socialPolicies repository.SocialPolicyRepository
}

func NewPhosraSocialService(socialPolicies repository.SocialPolicyRepository) *PhosraSocialService {
	return &PhosraSocialService{socialPolicies: socialPolicies}
}

func (s *PhosraSocialService) HandledCategories() []domain.RuleCategory {
	return []domain.RuleCategory{
		domain.RuleSocialChatControl,
		domain.RuleSocialContacts,
		domain.RuleSocialMultiplayer,
		domain.RuleDMRestriction,
	}
}

func (s *PhosraSocialService) EnforceRules(ctx context.Context, childID, _ uuid.UUID, rules []domain.PolicyRule) (*provider.EnforcementResult, error) {
	applied := 0
	details := make(map[string]any)

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}
		policy := &domain.SocialPolicy{
			ChildID:    childID,
			PlatformID: "phosra",
			PolicyType: string(rule.Category),
			Config:     rule.Config,
			Active:     true,
		}
		if err := s.socialPolicies.Upsert(ctx, policy); err != nil {
			return nil, err
		}
		applied++
		details[string(rule.Category)] = map[string]any{
			"status":  "applied",
			"handler": "phosra_social",
		}
	}

	return &provider.EnforcementResult{
		RulesApplied: applied,
		Details:      details,
		Message:      "Phosra Social Service: social controls configured",
	}, nil
}
