package service

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

// PhosraComplianceAttestService manages CSAM reporting, library filter
// compliance, algorithmic audit, AI minor interaction, and image rights.
// This is Phosra's managed compliance layer for all providers.
type PhosraComplianceAttestService struct {
	attestations repository.ComplianceAttestationRepository
}

func NewPhosraComplianceAttestService(attestations repository.ComplianceAttestationRepository) *PhosraComplianceAttestService {
	return &PhosraComplianceAttestService{attestations: attestations}
}

func (s *PhosraComplianceAttestService) HandledCategories() []domain.RuleCategory {
	return []domain.RuleCategory{
		domain.RuleCSAMReporting,
		domain.RuleLibraryFilterCompliance,
		domain.RuleAIMinorInteraction,
		domain.RuleImageRightsMinor,
		domain.RuleAlgorithmicAudit,
	}
}

func (s *PhosraComplianceAttestService) EnforceRules(ctx context.Context, _ uuid.UUID, familyID uuid.UUID, rules []domain.PolicyRule) (*provider.EnforcementResult, error) {
	applied := 0
	details := make(map[string]any)

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}

		att := &domain.ComplianceAttestation{
			FamilyID:     familyID,
			RuleCategory: rule.Category,
			PlatformID:   "phosra",
			Status:       "attested",
			Evidence:     json.RawMessage(`{"source":"phosra_engine","auto_attested":true}`),
		}
		if err := s.attestations.Upsert(ctx, att); err != nil {
			return nil, err
		}
		applied++
		details[string(rule.Category)] = map[string]any{
			"status":  "applied",
			"handler": "phosra_compliance_attest",
		}
	}

	return &provider.EnforcementResult{
		RulesApplied: applied,
		Details:      details,
		Message:      "Phosra Compliance Attestation Service: compliance recorded",
	}, nil
}
