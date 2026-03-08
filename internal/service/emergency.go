package service

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

const (
	emergencyPolicyName     = "__emergency_lockdown"
	emergencyPolicyPriority = 9999
	routinePolicyPrefix     = "__routine_"
	routinePolicyPriority   = 5000
)

// EmergencyPauseResponse is returned by EmergencyPause.
type EmergencyPauseResponse struct {
	Status            string `json:"status"`
	PoliciesActivated int    `json:"policiesActivated"`
	PlatformsEnforced int    `json:"platformsEnforced"`
}

// EmergencyResumeResponse is returned by EmergencyResume.
type EmergencyResumeResponse struct {
	Status string `json:"status"`
}

// RoutineActivateResponse is returned by ActivateRoutine.
type RoutineActivateResponse struct {
	Status      string `json:"status"`
	RoutineName string `json:"routineName"`
	PolicyID    string `json:"policyId"`
}

// RoutineDeactivateResponse is returned by DeactivateRoutine.
type RoutineDeactivateResponse struct {
	Status      string `json:"status"`
	RoutineName string `json:"routineName"`
}

// EmergencyPause creates and activates an emergency lockdown policy that blocks everything.
func (s *EnforcementService) EmergencyPause(ctx context.Context, userID, childID uuid.UUID) (*EmergencyPauseResponse, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkParentRole(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}

	// Check if emergency policy already exists
	policies, err := s.policies.ListByChild(ctx, childID)
	if err != nil {
		return nil, fmt.Errorf("list policies: %w", err)
	}
	for _, p := range policies {
		if p.Name == emergencyPolicyName && p.Status == domain.PolicyActive {
			// Already active — return current state
			return &EmergencyPauseResponse{
				Status:            "paused",
				PoliciesActivated: 1,
				PlatformsEnforced: 0,
			}, nil
		}
	}

	// Create emergency lockdown policy
	now := time.Now()
	policy := &domain.ChildPolicy{
		ID:        uuid.New(),
		ChildID:   childID,
		Name:      emergencyPolicyName,
		Status:    domain.PolicyActive,
		Priority:  emergencyPolicyPriority,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := s.policies.Create(ctx, policy); err != nil {
		return nil, fmt.Errorf("create emergency policy: %w", err)
	}

	// Add lockdown rules: block everything
	rules := []domain.PolicyRule{
		{
			ID: uuid.New(), PolicyID: policy.ID, Category: domain.RuleWebFilterLevel, Enabled: true,
			Config: jsonBytes(map[string]any{"level": "strict"}), CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: uuid.New(), PolicyID: policy.ID, Category: domain.RuleTimeDailyLimit, Enabled: true,
			Config: jsonBytes(map[string]any{"daily_minutes": 0}), CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: uuid.New(), PolicyID: policy.ID, Category: domain.RuleContentAllowlistMode, Enabled: true,
			Config: jsonBytes(map[string]any{"allowlist_mode": true, "allowed_titles": []string{}}), CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: uuid.New(), PolicyID: policy.ID, Category: domain.RuleTimeDowntime, Enabled: true,
			Config: jsonBytes(map[string]any{"enabled": true, "always_on": true}), CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: uuid.New(), PolicyID: policy.ID, Category: domain.RuleSocialChatControl, Enabled: true,
			Config: jsonBytes(map[string]any{"mode": "none"}), CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: uuid.New(), PolicyID: policy.ID, Category: domain.RulePurchaseBlockIAP, Enabled: true,
			Config: jsonBytes(map[string]any{"block_iap": true}), CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: uuid.New(), PolicyID: policy.ID, Category: domain.RuleNotificationCurfew, Enabled: true,
			Config: jsonBytes(map[string]any{"start": "00:00", "end": "23:59"}), CreatedAt: now, UpdatedAt: now,
		},
	}
	if err := s.rules.BulkUpsert(ctx, policy.ID, rules); err != nil {
		return nil, fmt.Errorf("create emergency rules: %w", err)
	}

	// Trigger enforcement to all platforms
	platformsEnforced := 0
	links, err := s.complianceLinks.ListByFamily(ctx, child.FamilyID)
	if err == nil {
		for _, link := range links {
			if link.Status == "verified" {
				platformsEnforced++
			}
		}
	}

	// Fan out enforcement in background
	if platformsEnforced > 0 {
		go func() {
			_, _ = s.TriggerEnforcement(context.Background(), userID, childID, "emergency", nil)
		}()
	}

	return &EmergencyPauseResponse{
		Status:            "paused",
		PoliciesActivated: 1,
		PlatformsEnforced: platformsEnforced,
	}, nil
}

// EmergencyResume deactivates the emergency lockdown policy and restores normal state.
func (s *EnforcementService) EmergencyResume(ctx context.Context, userID, childID uuid.UUID) (*EmergencyResumeResponse, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkParentRole(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}

	// Find and delete the emergency policy
	policies, err := s.policies.ListByChild(ctx, childID)
	if err != nil {
		return nil, fmt.Errorf("list policies: %w", err)
	}

	found := false
	for _, p := range policies {
		if p.Name == emergencyPolicyName {
			if err := s.policies.Delete(ctx, p.ID); err != nil {
				return nil, fmt.Errorf("delete emergency policy: %w", err)
			}
			found = true
		}
	}

	if !found {
		return &EmergencyResumeResponse{Status: "resumed"}, nil
	}

	// Re-trigger enforcement with normal policies
	go func() {
		_, _ = s.TriggerEnforcement(context.Background(), userID, childID, "emergency_resume", nil)
	}()

	return &EmergencyResumeResponse{Status: "resumed"}, nil
}

// ActivateRoutine creates and activates a routine-specific policy overlay.
func (s *EnforcementService) ActivateRoutine(ctx context.Context, userID, childID uuid.UUID, routineName string) (*RoutineActivateResponse, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkParentRole(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}

	rules, err := routineRules(routineName)
	if err != nil {
		return nil, err
	}

	policyName := routinePolicyPrefix + routineName

	// Check if this routine is already active
	policies, err := s.policies.ListByChild(ctx, childID)
	if err != nil {
		return nil, fmt.Errorf("list policies: %w", err)
	}
	for _, p := range policies {
		if p.Name == policyName && p.Status == domain.PolicyActive {
			return &RoutineActivateResponse{
				Status:      "activated",
				RoutineName: routineName,
				PolicyID:    p.ID.String(),
			}, nil
		}
	}

	// Create routine policy overlay
	now := time.Now()
	policy := &domain.ChildPolicy{
		ID:        uuid.New(),
		ChildID:   childID,
		Name:      policyName,
		Status:    domain.PolicyActive,
		Priority:  routinePolicyPriority,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := s.policies.Create(ctx, policy); err != nil {
		return nil, fmt.Errorf("create routine policy: %w", err)
	}

	// Stamp rules with the policy ID
	for i := range rules {
		rules[i].PolicyID = policy.ID
		rules[i].ID = uuid.New()
		rules[i].CreatedAt = now
		rules[i].UpdatedAt = now
	}
	if err := s.rules.BulkUpsert(ctx, policy.ID, rules); err != nil {
		return nil, fmt.Errorf("create routine rules: %w", err)
	}

	// Trigger enforcement in background
	go func() {
		_, _ = s.TriggerEnforcement(context.Background(), userID, childID, "routine_"+routineName, nil)
	}()

	return &RoutineActivateResponse{
		Status:      "activated",
		RoutineName: routineName,
		PolicyID:    policy.ID.String(),
	}, nil
}

// DeactivateRoutine removes a routine policy overlay and restores previous state.
func (s *EnforcementService) DeactivateRoutine(ctx context.Context, userID, childID uuid.UUID, routineName string) (*RoutineDeactivateResponse, error) {
	child, err := s.children.GetByID(ctx, childID)
	if err != nil || child == nil {
		return nil, ErrChildNotFound
	}
	if err := s.checkParentRole(ctx, child.FamilyID, userID); err != nil {
		return nil, err
	}

	if !isValidRoutine(routineName) {
		return nil, fmt.Errorf("unknown routine: %s", routineName)
	}

	policyName := routinePolicyPrefix + routineName

	// Find and delete the routine policy
	policies, err := s.policies.ListByChild(ctx, childID)
	if err != nil {
		return nil, fmt.Errorf("list policies: %w", err)
	}

	for _, p := range policies {
		if p.Name == policyName {
			if err := s.policies.Delete(ctx, p.ID); err != nil {
				return nil, fmt.Errorf("delete routine policy: %w", err)
			}
		}
	}

	// Re-trigger enforcement with base policies
	go func() {
		_, _ = s.TriggerEnforcement(context.Background(), userID, childID, "routine_deactivate", nil)
	}()

	return &RoutineDeactivateResponse{
		Status:      "deactivated",
		RoutineName: routineName,
	}, nil
}

// checkParentRole verifies the user is an owner or parent in the child's family.
func (s *EnforcementService) checkParentRole(ctx context.Context, familyID, userID uuid.UUID) error {
	member, err := s.members.GetRole(ctx, familyID, userID)
	if err != nil || member == nil {
		return ErrNotFamilyMember
	}
	if member.Role != domain.RoleOwner && member.Role != domain.RoleParent {
		return ErrInsufficientRole
	}
	return nil
}

// isValidRoutine checks if the routine name is one of the supported routines.
func isValidRoutine(name string) bool {
	switch name {
	case "bedtime", "homework", "weekend", "lockdown":
		return true
	}
	return false
}

// routineRules returns the predefined rules for a given routine.
func routineRules(routineName string) ([]domain.PolicyRule, error) {
	switch routineName {
	case "bedtime":
		return []domain.PolicyRule{
			{Category: domain.RuleTimeDowntime, Enabled: true, Config: jsonBytes(map[string]any{"enabled": true, "always_on": true})},
			{Category: domain.RuleNotificationCurfew, Enabled: true, Config: jsonBytes(map[string]any{"start": "00:00", "end": "23:59"})},
			{Category: domain.RuleAlgoFeedControl, Enabled: true, Config: jsonBytes(map[string]any{"mode": "chronological"})},
		}, nil

	case "homework":
		return []domain.PolicyRule{
			{Category: domain.RuleContentBlockTitle, Enabled: true, Config: jsonBytes(map[string]any{
				"blocked_titles": []string{"YouTube", "TikTok", "Instagram", "Snapchat", "Netflix", "Roblox", "Fortnite"},
			})},
			{Category: domain.RuleTimePerAppLimit, Enabled: true, Config: jsonBytes(map[string]any{
				"non_educational_minutes": 0,
			})},
			{Category: domain.RuleAlgoFeedControl, Enabled: true, Config: jsonBytes(map[string]any{"mode": "chronological"})},
			{Category: domain.RuleAddictiveDesignControl, Enabled: true, Config: jsonBytes(map[string]any{
				"disable_infinite_scroll": true,
				"disable_autoplay":        true,
				"disable_streaks":         true,
				"disable_like_counts":     true,
				"disable_daily_rewards":   true,
			})},
		}, nil

	case "weekend":
		return []domain.PolicyRule{
			{Category: domain.RuleTimeDailyLimit, Enabled: true, Config: jsonBytes(map[string]any{"daily_minutes": 300})},
			{Category: domain.RuleContentRating, Enabled: true, Config: jsonBytes(map[string]any{
				"max_ratings": map[string]string{
					"mpaa": "PG-13",
					"esrb": "T",
					"tv":   "TV-PG",
				},
			})},
			{Category: domain.RuleTimeScheduledHours, Enabled: true, Config: jsonBytes(map[string]any{
				"schedule": map[string]any{
					"weekday": map[string]any{"start": "08:00", "end": "23:00"},
					"weekend": map[string]any{"start": "08:00", "end": "23:00"},
				},
			})},
		}, nil

	case "lockdown":
		return []domain.PolicyRule{
			{Category: domain.RuleTimeDailyLimit, Enabled: true, Config: jsonBytes(map[string]any{"daily_minutes": 0})},
			{Category: domain.RuleTimeDowntime, Enabled: true, Config: jsonBytes(map[string]any{"enabled": true, "always_on": true})},
			{Category: domain.RuleContentAllowlistMode, Enabled: true, Config: jsonBytes(map[string]any{"allowlist_mode": true, "allowed_titles": []string{}})},
			{Category: domain.RuleWebFilterLevel, Enabled: true, Config: jsonBytes(map[string]any{"level": "strict"})},
			{Category: domain.RuleSocialChatControl, Enabled: true, Config: jsonBytes(map[string]any{"mode": "none"})},
			{Category: domain.RuleNotificationCurfew, Enabled: true, Config: jsonBytes(map[string]any{"start": "00:00", "end": "23:59"})},
		}, nil

	default:
		return nil, fmt.Errorf("unknown routine: %s", routineName)
	}
}

