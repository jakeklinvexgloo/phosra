package service

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
	"github.com/guardiangate/api/internal/repository"
)

// PhosraNotificationService manages notification curfews, usage timers,
// and parental event notifications — filling gaps for providers like Bark,
// Net Nanny, and OurPact that lack native notification control.
type PhosraNotificationService struct {
	schedules repository.NotificationScheduleRepository
}

func NewPhosraNotificationService(schedules repository.NotificationScheduleRepository) *PhosraNotificationService {
	return &PhosraNotificationService{schedules: schedules}
}

// HandledCategories returns the rule categories this service manages.
func (s *PhosraNotificationService) HandledCategories() []domain.RuleCategory {
	return []domain.RuleCategory{
		domain.RuleNotificationCurfew,
		domain.RuleUsageTimerNotification,
		domain.RuleParentalEventNotification,
	}
}

// EnforceRules stores/updates notification schedules for the given child and returns results.
func (s *PhosraNotificationService) EnforceRules(ctx context.Context, childID, familyID uuid.UUID, rules []domain.PolicyRule) (*provider.EnforcementResult, error) {
	applied := 0
	details := make(map[string]any)

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}
		schedule := &domain.NotificationSchedule{
			ChildID:      childID,
			FamilyID:     familyID,
			RuleCategory: rule.Category,
			Config:       rule.Config,
			Active:       true,
		}
		if err := s.schedules.Upsert(ctx, schedule); err != nil {
			return nil, err
		}
		applied++
		details[string(rule.Category)] = parseRuleConfig(rule)
	}

	return &provider.EnforcementResult{
		RulesApplied: applied,
		Details:      details,
		Message:      "Phosra Notification Service: schedules configured",
	}, nil
}

func parseRuleConfig(rule domain.PolicyRule) map[string]any {
	var m map[string]any
	if err := json.Unmarshal(rule.Config, &m); err != nil {
		return map[string]any{"status": "applied"}
	}
	m["status"] = "applied"
	return m
}
