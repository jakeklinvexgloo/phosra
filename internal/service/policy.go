package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/repository"
)

var (
	ErrPolicyNotFound = errors.New("policy not found")
	ErrRuleNotFound   = errors.New("policy rule not found")
)

type PolicyService struct {
	policies repository.PolicyRepository
	rules    repository.PolicyRuleRepository
	children repository.ChildRepository
	members  repository.FamilyMemberRepository
	ratings  repository.RatingRepository
}

func NewPolicyService(
	policies repository.PolicyRepository,
	rules repository.PolicyRuleRepository,
	children repository.ChildRepository,
	members repository.FamilyMemberRepository,
	ratings repository.RatingRepository,
) *PolicyService {
	return &PolicyService{
		policies: policies,
		rules:    rules,
		children: children,
		members:  members,
		ratings:  ratings,
	}
}

func (s *PolicyService) Create(ctx context.Context, userID, childID uuid.UUID, name string) (*domain.ChildPolicy, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkParentRole(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}

	policy := &domain.ChildPolicy{
		ID:        uuid.New(),
		ChildID:   childID,
		Name:      name,
		Status:    domain.PolicyDraft,
		Priority:  0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.policies.Create(ctx, policy); err != nil {
		return nil, fmt.Errorf("create policy: %w", err)
	}
	return policy, nil
}

func (s *PolicyService) GetByID(ctx context.Context, userID, policyID uuid.UUID) (*domain.ChildPolicy, error) {
	policy, err := s.policies.GetByID(ctx, policyID)
	if err != nil || policy == nil {
		return nil, ErrPolicyNotFound
	}
	child, err := s.children.GetByID(ctx, policy.ChildID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkMembership(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}
	return policy, nil
}

func (s *PolicyService) Update(ctx context.Context, userID, policyID uuid.UUID, name string, priority int) (*domain.ChildPolicy, error) {
	policy, err := s.GetByID(ctx, userID, policyID)
	if err != nil {
		return nil, err
	}
	policy.Name = name
	policy.Priority = priority
	policy.UpdatedAt = time.Now()
	if err := s.policies.Update(ctx, policy); err != nil {
		return nil, fmt.Errorf("update policy: %w", err)
	}
	return policy, nil
}

func (s *PolicyService) Delete(ctx context.Context, userID, policyID uuid.UUID) error {
	policy, err := s.GetByID(ctx, userID, policyID)
	if err != nil {
		return err
	}
	child, _ := s.children.GetByID(ctx, policy.ChildID)
	if child == nil {
		return ErrChildNotFound
	}
	if err := s.checkParentRole(ctx, child.FamilyID, userID); err != nil {
		return err
	}
	return s.policies.Delete(ctx, policyID)
}

func (s *PolicyService) ListByChild(ctx context.Context, userID, childID uuid.UUID) ([]domain.ChildPolicy, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkMembership(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}
	return s.policies.ListByChild(ctx, childID)
}

func (s *PolicyService) Activate(ctx context.Context, userID, policyID uuid.UUID) (*domain.ChildPolicy, error) {
	return s.setStatus(ctx, userID, policyID, domain.PolicyActive)
}

func (s *PolicyService) Pause(ctx context.Context, userID, policyID uuid.UUID) (*domain.ChildPolicy, error) {
	return s.setStatus(ctx, userID, policyID, domain.PolicyPaused)
}

func (s *PolicyService) setStatus(ctx context.Context, userID, policyID uuid.UUID, status domain.PolicyStatus) (*domain.ChildPolicy, error) {
	policy, err := s.GetByID(ctx, userID, policyID)
	if err != nil {
		return nil, err
	}
	child, _ := s.children.GetByID(ctx, policy.ChildID)
	if child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkParentRole(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}
	policy.Status = status
	policy.UpdatedAt = time.Now()
	if err := s.policies.Update(ctx, policy); err != nil {
		return nil, err
	}
	return policy, nil
}

// GenerateFromAge creates default rules based on the child's age.
func (s *PolicyService) GenerateFromAge(ctx context.Context, userID, policyID uuid.UUID) ([]domain.PolicyRule, error) {
	policy, err := s.GetByID(ctx, userID, policyID)
	if err != nil {
		return nil, err
	}

	child, err := s.children.GetByID(ctx, policy.ChildID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}

	age := child.Age()
	mappings, err := s.ratings.GetRatingsForAge(ctx, age)
	if err != nil {
		return nil, fmt.Errorf("get ratings for age: %w", err)
	}

	// Build rating config from age mappings
	ratingConfig := make(map[string]string)
	for _, m := range mappings {
		rating, err := s.ratings.GetRatingByID(ctx, m.RatingID)
		if err != nil || rating == nil {
			continue
		}
		ratingConfig[m.SystemID] = rating.Code
	}
	ratingJSON, _ := json.Marshal(map[string]any{"max_ratings": ratingConfig})

	// Generate age-appropriate rules
	rules := s.generateAgeRules(age, policyID, ratingJSON)

	if err := s.rules.BulkUpsert(ctx, policyID, rules); err != nil {
		return nil, fmt.Errorf("bulk upsert rules: %w", err)
	}

	return s.rules.ListByPolicy(ctx, policyID)
}

func (s *PolicyService) generateAgeRules(age int, policyID uuid.UUID, ratingJSON []byte) []domain.PolicyRule {
	now := time.Now()
	rules := []domain.PolicyRule{
		{ID: uuid.New(), PolicyID: policyID, Category: domain.RuleContentRating, Enabled: true, Config: ratingJSON, CreatedAt: now, UpdatedAt: now},
		{ID: uuid.New(), PolicyID: policyID, Category: domain.RuleWebSafeSearch, Enabled: true, Config: jsonBytes(map[string]any{"enabled": true}), CreatedAt: now, UpdatedAt: now},
		{ID: uuid.New(), PolicyID: policyID, Category: domain.RuleMonitoringActivity, Enabled: true, Config: jsonBytes(map[string]any{"enabled": true}), CreatedAt: now, UpdatedAt: now},
	}

	// Time limits based on age
	var dailyMinutes int
	switch {
	case age <= 6:
		dailyMinutes = 60
	case age <= 9:
		dailyMinutes = 90
	case age <= 12:
		dailyMinutes = 120
	case age <= 16:
		dailyMinutes = 180
	default:
		dailyMinutes = 240
	}
	rules = append(rules, domain.PolicyRule{
		ID: uuid.New(), PolicyID: policyID, Category: domain.RuleTimeDailyLimit, Enabled: true,
		Config: jsonBytes(map[string]any{"daily_minutes": dailyMinutes}), CreatedAt: now, UpdatedAt: now,
	})

	// Scheduled hours - bedtime
	var bedtimeHour int
	switch {
	case age <= 6:
		bedtimeHour = 19
	case age <= 9:
		bedtimeHour = 20
	case age <= 12:
		bedtimeHour = 21
	case age <= 16:
		bedtimeHour = 22
	default:
		bedtimeHour = 23
	}
	rules = append(rules, domain.PolicyRule{
		ID: uuid.New(), PolicyID: policyID, Category: domain.RuleTimeScheduledHours, Enabled: true,
		Config: jsonBytes(map[string]any{
			"schedule": map[string]any{
				"weekday": map[string]any{"start": "07:00", "end": fmt.Sprintf("%d:00", bedtimeHour)},
				"weekend": map[string]any{"start": "08:00", "end": fmt.Sprintf("%d:00", bedtimeHour+1)},
			},
		}), CreatedAt: now, UpdatedAt: now,
	})

	// Purchase controls
	if age < 18 {
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RulePurchaseApproval, Enabled: true,
			Config: jsonBytes(map[string]any{"require_approval": true}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RulePurchaseBlockIAP, Enabled: age < 13,
			Config: jsonBytes(map[string]any{"block_iap": age < 13}), CreatedAt: now, UpdatedAt: now,
		})
	}

	// Web filtering
	var filterLevel string
	switch {
	case age <= 9:
		filterLevel = "strict"
	case age <= 12:
		filterLevel = "moderate"
	default:
		filterLevel = "light"
	}
	rules = append(rules, domain.PolicyRule{
		ID: uuid.New(), PolicyID: policyID, Category: domain.RuleWebFilterLevel, Enabled: true,
		Config: jsonBytes(map[string]any{"level": filterLevel}), CreatedAt: now, UpdatedAt: now,
	})

	// Social controls for younger children
	if age < 13 {
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleSocialChatControl, Enabled: true,
			Config: jsonBytes(map[string]any{"mode": "friends_only"}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RulePrivacyAccountCreation, Enabled: true,
			Config: jsonBytes(map[string]any{"require_approval": true}), CreatedAt: now, UpdatedAt: now,
		})
	}

	// Privacy
	rules = append(rules, domain.PolicyRule{
		ID: uuid.New(), PolicyID: policyID, Category: domain.RulePrivacyProfileVisibility, Enabled: true,
		Config: jsonBytes(map[string]any{"visibility": "private"}), CreatedAt: now, UpdatedAt: now,
	})

	// --- Legislation-driven rules ---

	// All ages: algo_feed_control=chronological, targeted_ad_block=on, geolocation_opt_in=off, data_deletion_request=enabled
	rules = append(rules, domain.PolicyRule{
		ID: uuid.New(), PolicyID: policyID, Category: domain.RuleAlgoFeedControl, Enabled: true,
		Config: jsonBytes(map[string]any{"mode": "chronological"}), CreatedAt: now, UpdatedAt: now,
	})
	rules = append(rules, domain.PolicyRule{
		ID: uuid.New(), PolicyID: policyID, Category: domain.RuleTargetedAdBlock, Enabled: true,
		Config: jsonBytes(map[string]any{"block_targeted_ads": true}), CreatedAt: now, UpdatedAt: now,
	})
	rules = append(rules, domain.PolicyRule{
		ID: uuid.New(), PolicyID: policyID, Category: domain.RuleGeolocationOptIn, Enabled: true,
		Config: jsonBytes(map[string]any{"geolocation_allowed": false}), CreatedAt: now, UpdatedAt: now,
	})
	rules = append(rules, domain.PolicyRule{
		ID: uuid.New(), PolicyID: policyID, Category: domain.RuleDataDeletionRequest, Enabled: true,
		Config: jsonBytes(map[string]any{"enabled": true}), CreatedAt: now, UpdatedAt: now,
	})

	// Age-gated rules
	switch {
	case age < 13:
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleAgeGate, Enabled: true,
			Config: jsonBytes(map[string]any{"enabled": true, "min_age": 13}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleDMRestriction, Enabled: true,
			Config: jsonBytes(map[string]any{"mode": "none"}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleAddictiveDesignControl, Enabled: true,
			Config: jsonBytes(map[string]any{
				"disable_infinite_scroll": true,
				"disable_autoplay":        true,
				"disable_streaks":         true,
				"disable_like_counts":     true,
				"disable_daily_rewards":   true,
			}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleNotificationCurfew, Enabled: true,
			Config: jsonBytes(map[string]any{"start": "20:00", "end": "07:00"}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleUsageTimerNotification, Enabled: true,
			Config: jsonBytes(map[string]any{"interval_minutes": 15}), CreatedAt: now, UpdatedAt: now,
		})
	case age <= 16:
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleAgeGate, Enabled: false,
			Config: jsonBytes(map[string]any{"enabled": false}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleDMRestriction, Enabled: true,
			Config: jsonBytes(map[string]any{"mode": "contacts_only"}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleAddictiveDesignControl, Enabled: true,
			Config: jsonBytes(map[string]any{
				"disable_infinite_scroll": true,
				"disable_autoplay":        true,
				"disable_streaks":         false,
				"disable_like_counts":     false,
				"disable_daily_rewards":   false,
			}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleNotificationCurfew, Enabled: true,
			Config: jsonBytes(map[string]any{"start": "22:00", "end": "06:00"}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleUsageTimerNotification, Enabled: true,
			Config: jsonBytes(map[string]any{"interval_minutes": 30}), CreatedAt: now, UpdatedAt: now,
		})
	default: // 17+
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleAgeGate, Enabled: false,
			Config: jsonBytes(map[string]any{"enabled": false}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleDMRestriction, Enabled: false,
			Config: jsonBytes(map[string]any{"mode": "everyone"}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleAddictiveDesignControl, Enabled: false,
			Config: jsonBytes(map[string]any{
				"disable_infinite_scroll": false,
				"disable_autoplay":        false,
				"disable_streaks":         false,
				"disable_like_counts":     false,
				"disable_daily_rewards":   false,
			}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleNotificationCurfew, Enabled: true,
			Config: jsonBytes(map[string]any{"start": "00:00", "end": "06:00"}), CreatedAt: now, UpdatedAt: now,
		})
		rules = append(rules, domain.PolicyRule{
			ID: uuid.New(), PolicyID: policyID, Category: domain.RuleUsageTimerNotification, Enabled: true,
			Config: jsonBytes(map[string]any{"interval_minutes": 60}), CreatedAt: now, UpdatedAt: now,
		})
	}

	return rules
}

func jsonBytes(v any) json.RawMessage {
	b, _ := json.Marshal(v)
	return b
}

// Rule CRUD
func (s *PolicyService) CreateRule(ctx context.Context, userID, policyID uuid.UUID, category domain.RuleCategory, enabled bool, config json.RawMessage) (*domain.PolicyRule, error) {
	if _, err := s.GetByID(ctx, userID, policyID); err != nil {
		return nil, err
	}
	rule := &domain.PolicyRule{
		ID:        uuid.New(),
		PolicyID:  policyID,
		Category:  category,
		Enabled:   enabled,
		Config:    config,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.rules.Create(ctx, rule); err != nil {
		return nil, fmt.Errorf("create rule: %w", err)
	}
	return rule, nil
}

func (s *PolicyService) UpdateRule(ctx context.Context, userID, ruleID uuid.UUID, enabled bool, config json.RawMessage) (*domain.PolicyRule, error) {
	rule, err := s.rules.GetByID(ctx, ruleID)
	if err != nil || rule == nil {
		return nil, ErrRuleNotFound
	}
	if _, err := s.GetByID(ctx, userID, rule.PolicyID); err != nil {
		return nil, err
	}
	rule.Enabled = enabled
	rule.Config = config
	rule.UpdatedAt = time.Now()
	if err := s.rules.Update(ctx, rule); err != nil {
		return nil, err
	}
	return rule, nil
}

func (s *PolicyService) DeleteRule(ctx context.Context, userID, ruleID uuid.UUID) error {
	rule, err := s.rules.GetByID(ctx, ruleID)
	if err != nil || rule == nil {
		return ErrRuleNotFound
	}
	if _, err := s.GetByID(ctx, userID, rule.PolicyID); err != nil {
		return err
	}
	return s.rules.Delete(ctx, ruleID)
}

func (s *PolicyService) ListRules(ctx context.Context, userID, policyID uuid.UUID) ([]domain.PolicyRule, error) {
	if _, err := s.GetByID(ctx, userID, policyID); err != nil {
		return nil, err
	}
	return s.rules.ListByPolicy(ctx, policyID)
}

func (s *PolicyService) BulkUpsertRules(ctx context.Context, userID, policyID uuid.UUID, rules []domain.PolicyRule) ([]domain.PolicyRule, error) {
	if _, err := s.GetByID(ctx, userID, policyID); err != nil {
		return nil, err
	}
	if err := s.rules.BulkUpsert(ctx, policyID, rules); err != nil {
		return nil, err
	}
	return s.rules.ListByPolicy(ctx, policyID)
}

func (s *PolicyService) checkMembership(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	return nil
}

func (s *PolicyService) checkParentRole(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	if member.Role != domain.RoleOwner && member.Role != domain.RoleParent {
		return ErrInsufficientRole
	}
	return nil
}
