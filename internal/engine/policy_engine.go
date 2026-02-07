package engine

import (
	"encoding/json"
	"sort"

	"github.com/guardiangate/api/internal/domain"
)

// ResolvedPolicy is the merged result of multiple policies after conflict resolution.
type ResolvedPolicy struct {
	Rules map[domain.RuleCategory]domain.PolicyRule `json:"rules"`
}

// ResolvePolicies merges multiple policies, with higher priority taking precedence.
// For conflicting rules, the more restrictive setting wins.
func ResolvePolicies(policies []domain.ChildPolicy, rulesByPolicy map[string][]domain.PolicyRule) *ResolvedPolicy {
	// Sort by priority descending (higher priority = takes precedence)
	sort.Slice(policies, func(i, j int) bool {
		return policies[i].Priority > policies[j].Priority
	})

	resolved := &ResolvedPolicy{
		Rules: make(map[domain.RuleCategory]domain.PolicyRule),
	}

	for _, policy := range policies {
		if policy.Status != domain.PolicyActive {
			continue
		}

		rules, ok := rulesByPolicy[policy.ID.String()]
		if !ok {
			continue
		}

		for _, rule := range rules {
			if !rule.Enabled {
				continue
			}

			existing, exists := resolved.Rules[rule.Category]
			if !exists {
				resolved.Rules[rule.Category] = rule
				continue
			}

			// Conflict resolution: use the more restrictive rule
			merged := resolveConflict(existing, rule)
			resolved.Rules[rule.Category] = merged
		}
	}

	return resolved
}

// resolveConflict picks the more restrictive of two rules.
func resolveConflict(a, b domain.PolicyRule) domain.PolicyRule {
	switch a.Category {
	case domain.RuleTimeDailyLimit:
		return pickLowerInt(a, b, "daily_minutes")
	case domain.RuleWebFilterLevel:
		return pickStricterFilter(a, b)
	case domain.RuleContentRating:
		return a // Higher priority wins for content ratings
	case domain.RulePurchaseBlockIAP:
		return pickMoreRestrictiveBool(a, b, "block_iap")
	case domain.RuleUsageTimerNotification:
		return pickLowerInt(a, b, "interval_minutes")
	case domain.RuleNotificationCurfew:
		return pickEarlierCurfew(a, b)
	case domain.RuleTargetedAdBlock:
		return pickMoreRestrictiveBool(a, b, "block_targeted_ads")
	case domain.RuleDataDeletionRequest, domain.RuleAgeGate:
		return pickMoreRestrictiveBool(a, b, "enabled")
	case domain.RuleGeolocationOptIn:
		// More restrictive = geolocation NOT allowed
		if !extractBool(a.Config, "geolocation_allowed") {
			return a
		}
		return b
	case domain.RuleDMRestriction:
		return pickStricterDM(a, b)
	case domain.RuleAddictiveDesignControl:
		return pickMoreDisabled(a, b)
	case domain.RuleAlgoFeedControl:
		// "chronological" is more restrictive than "algorithmic"
		if extractString(a.Config, "mode") == "chronological" {
			return a
		}
		return b
	default:
		return a // Higher priority wins by default
	}
}

func pickEarlierCurfew(a, b domain.PolicyRule) domain.PolicyRule {
	// Earlier start time = more restrictive (e.g., 20:00 > 22:00)
	startA := extractString(a.Config, "start")
	startB := extractString(b.Config, "start")
	if startA < startB {
		return a
	}
	return b
}

func pickStricterDM(a, b domain.PolicyRule) domain.PolicyRule {
	levels := map[string]int{"none": 3, "contacts_only": 2, "everyone": 1}
	la := levels[extractString(a.Config, "mode")]
	lb := levels[extractString(b.Config, "mode")]
	if la >= lb {
		return a
	}
	return b
}

func pickMoreDisabled(a, b domain.PolicyRule) domain.PolicyRule {
	// Count how many features are disabled — more disabled = more restrictive
	countDisabled := func(config json.RawMessage) int {
		var m map[string]any
		if err := json.Unmarshal(config, &m); err != nil {
			return 0
		}
		count := 0
		for _, v := range m {
			if b, ok := v.(bool); ok && b {
				count++
			}
		}
		return count
	}
	if countDisabled(a.Config) >= countDisabled(b.Config) {
		return a
	}
	return b
}

func pickLowerInt(a, b domain.PolicyRule, key string) domain.PolicyRule {
	va := extractInt(a.Config, key)
	vb := extractInt(b.Config, key)
	if vb < va {
		return b
	}
	return a
}

func pickStricterFilter(a, b domain.PolicyRule) domain.PolicyRule {
	levels := map[string]int{"strict": 3, "moderate": 2, "light": 1}
	la := levels[extractString(a.Config, "level")]
	lb := levels[extractString(b.Config, "level")]
	if lb > la {
		return b
	}
	return a
}

func pickMoreRestrictiveBool(a, b domain.PolicyRule, key string) domain.PolicyRule {
	if extractBool(b.Config, key) {
		return b
	}
	return a
}

func extractInt(config json.RawMessage, key string) int {
	var m map[string]any
	if err := json.Unmarshal(config, &m); err != nil {
		return 0
	}
	if v, ok := m[key].(float64); ok {
		return int(v)
	}
	return 0
}

func extractString(config json.RawMessage, key string) string {
	var m map[string]any
	if err := json.Unmarshal(config, &m); err != nil {
		return ""
	}
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func extractBool(config json.RawMessage, key string) bool {
	var m map[string]any
	if err := json.Unmarshal(config, &m); err != nil {
		return false
	}
	if v, ok := m[key].(bool); ok {
		return v
	}
	return false
}
