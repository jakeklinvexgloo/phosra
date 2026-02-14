package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

// PhosraAnalyticsService aggregates monitoring data across providers into
// unified reports — filling gaps for providers with partial monitoring support.
type PhosraAnalyticsService struct {
	activityLogs repository.ActivityLogRepository
}

func NewPhosraAnalyticsService(activityLogs repository.ActivityLogRepository) *PhosraAnalyticsService {
	return &PhosraAnalyticsService{activityLogs: activityLogs}
}

func (s *PhosraAnalyticsService) HandledCategories() []domain.RuleCategory {
	return []domain.RuleCategory{
		domain.RuleMonitoringActivity,
		domain.RuleMonitoringAlerts,
		domain.RuleScreenTimeReport,
	}
}

func (s *PhosraAnalyticsService) EnforceRules(ctx context.Context, childID, _ uuid.UUID, rules []domain.PolicyRule) (*provider.EnforcementResult, error) {
	applied := 0
	details := make(map[string]any)

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}
		// Phosra enables its analytics pipeline for this child — the actual data
		// ingestion happens via activity log endpoints and provider webhooks.
		applied++
		details[string(rule.Category)] = map[string]any{
			"status":  "applied",
			"handler": "phosra_analytics",
		}
	}

	return &provider.EnforcementResult{
		RulesApplied: applied,
		Details:      details,
		Message:      "Phosra Analytics Service: monitoring pipelines configured",
	}, nil
}
