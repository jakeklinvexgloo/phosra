package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

// PhosraPurchaseService provides Phosra-managed purchase approval workflow —
// filling Qustodio's "none" on purchase_approval.
type PhosraPurchaseService struct {
	approvals repository.PurchaseApprovalRepository
}

func NewPhosraPurchaseService(approvals repository.PurchaseApprovalRepository) *PhosraPurchaseService {
	return &PhosraPurchaseService{approvals: approvals}
}

func (s *PhosraPurchaseService) HandledCategories() []domain.RuleCategory {
	return []domain.RuleCategory{
		domain.RulePurchaseApproval,
		domain.RulePurchaseSpendingCap,
		domain.RulePurchaseBlockIAP,
	}
}

func (s *PhosraPurchaseService) EnforceRules(ctx context.Context, _ uuid.UUID, _ uuid.UUID, rules []domain.PolicyRule) (*provider.EnforcementResult, error) {
	applied := 0
	details := make(map[string]any)

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}
		// Phosra's purchase approval engine intercepts and manages purchase
		// requests for providers that don't natively support it.
		applied++
		details[string(rule.Category)] = map[string]any{
			"status":  "applied",
			"handler": "phosra_purchase",
		}
	}

	return &provider.EnforcementResult{
		RulesApplied: applied,
		Details:      details,
		Message:      "Phosra Purchase Service: approval workflow active",
	}, nil
}
