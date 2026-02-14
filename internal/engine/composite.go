package engine

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
)

// PhosraService is the interface all Phosra service layer services implement.
type PhosraService interface {
	HandledCategories() []domain.RuleCategory
	EnforceRules(ctx context.Context, childID, familyID uuid.UUID, rules []domain.PolicyRule) (*provider.EnforcementResult, error)
}

// RuleRouting splits rules between the native provider and Phosra services.
type RuleRouting struct {
	NativeRules []domain.PolicyRule
	// PhosraRules maps service name → rules that Phosra handles for this adapter
	PhosraRules map[string][]domain.PolicyRule
}

// CompositeEngine routes each rule to the best handler: the native provider
// adapter when it supports the rule, or the appropriate Phosra service when
// the provider can't handle it natively.
type CompositeEngine struct {
	services       map[string]PhosraService
	categoryToSvc  map[domain.RuleCategory]string
}

// NewCompositeEngine creates the engine with all 9 Phosra services.
// Parameters are PhosraService interfaces to avoid import cycles with the service package.
func NewCompositeEngine(
	notification PhosraService,
	analytics PhosraService,
	ageVerify PhosraService,
	contentClassify PhosraService,
	privacyConsent PhosraService,
	complianceAttest PhosraService,
	social PhosraService,
	location PhosraService,
	purchase PhosraService,
) *CompositeEngine {
	e := &CompositeEngine{
		services:      make(map[string]PhosraService),
		categoryToSvc: make(map[domain.RuleCategory]string),
	}

	// Register all services
	svcs := map[string]PhosraService{
		"notification":      notification,
		"analytics":         analytics,
		"age_verification":  ageVerify,
		"content_classify":  contentClassify,
		"privacy_consent":   privacyConsent,
		"compliance_attest": complianceAttest,
		"social":            social,
		"location":          location,
		"purchase":          purchase,
	}

	for name, svc := range svcs {
		e.services[name] = svc
		for _, cat := range svc.HandledCategories() {
			e.categoryToSvc[cat] = name
		}
	}

	return e
}

// RouteRules splits rules between native provider and Phosra services.
// For each enabled rule, it checks if the adapter's capabilities cover it.
// If yes → NativeRules. If no → routes to the appropriate Phosra service.
func (e *CompositeEngine) RouteRules(adapter provider.Adapter, rules []domain.PolicyRule) *RuleRouting {
	routing := &RuleRouting{
		PhosraRules: make(map[string][]domain.PolicyRule),
	}

	adapterCaps := adapter.Capabilities()

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}

		// Check if the adapter natively supports this rule
		nativelySupported := false
		for _, cap := range adapterCaps {
			if matchesCapability(rule.Category, cap) {
				nativelySupported = true
				break
			}
		}

		if nativelySupported {
			routing.NativeRules = append(routing.NativeRules, rule)
		} else {
			// Route to the appropriate Phosra service
			svcName, ok := e.categoryToSvc[rule.Category]
			if ok {
				routing.PhosraRules[svcName] = append(routing.PhosraRules[svcName], rule)
			}
			// If no service handles it, the rule is silently skipped
		}
	}

	return routing
}

// EnforcePhosraRules runs all Phosra-managed rules and merges results.
func (e *CompositeEngine) EnforcePhosraRules(ctx context.Context, childID, familyID uuid.UUID, routing *RuleRouting) (*provider.EnforcementResult, error) {
	totalApplied := 0
	totalFailed := 0
	mergedDetails := make(map[string]any)

	for svcName, rules := range routing.PhosraRules {
		svc, ok := e.services[svcName]
		if !ok {
			totalFailed += len(rules)
			continue
		}

		result, err := svc.EnforceRules(ctx, childID, familyID, rules)
		if err != nil {
			totalFailed += len(rules)
			mergedDetails[fmt.Sprintf("phosra_%s_error", svcName)] = err.Error()
			continue
		}

		totalApplied += result.RulesApplied
		totalFailed += result.RulesFailed
		for k, v := range result.Details {
			mergedDetails[k] = v
		}
	}

	return &provider.EnforcementResult{
		RulesApplied: totalApplied,
		RulesFailed:  totalFailed,
		Details:      mergedDetails,
		Message:      fmt.Sprintf("Phosra services: %d rules applied", totalApplied),
	}, nil
}

// matchesCapability checks if a rule category is supported by a given capability.
// This mirrors the logic in stubs/stubs.go matchesCapability().
func matchesCapability(category domain.RuleCategory, cap provider.Capability) bool {
	mapping := map[provider.Capability][]domain.RuleCategory{
		provider.CapContentRating: {
			domain.RuleContentRating, domain.RuleContentBlockTitle,
			domain.RuleContentAllowTitle, domain.RuleContentAllowlistMode,
			domain.RuleContentDescriptorBlock,
		},
		provider.CapTimeLimit:      {domain.RuleTimeDailyLimit, domain.RuleTimePerAppLimit},
		provider.CapScheduledHours: {domain.RuleTimeScheduledHours, domain.RuleTimeDowntime},
		provider.CapPurchaseControl: {domain.RulePurchaseApproval, domain.RulePurchaseSpendingCap, domain.RulePurchaseBlockIAP},
		provider.CapWebFiltering: {
			domain.RuleWebFilterLevel, domain.RuleWebCategoryBlock,
			domain.RuleWebCustomAllowlist, domain.RuleWebCustomBlocklist,
		},
		provider.CapSafeSearch:      {domain.RuleWebSafeSearch},
		provider.CapCustomBlocklist: {domain.RuleWebCustomBlocklist},
		provider.CapCustomAllowlist: {domain.RuleWebCustomAllowlist},
		provider.CapSocialControl: {
			domain.RuleSocialContacts, domain.RuleSocialChatControl,
			domain.RuleSocialMultiplayer, domain.RuleDMRestriction,
		},
		provider.CapLocationTracking: {domain.RulePrivacyLocation, domain.RuleGeolocationOptIn},
		provider.CapActivityMonitor:  {domain.RuleMonitoringActivity, domain.RuleMonitoringAlerts, domain.RuleScreenTimeReport},
		provider.CapPrivacyControl: {
			domain.RulePrivacyProfileVisibility, domain.RulePrivacyDataSharing,
			domain.RulePrivacyAccountCreation, domain.RuleDataDeletionRequest,
		},
		provider.CapAlgorithmicSafety: {
			domain.RuleAlgoFeedControl, domain.RuleAddictiveDesignControl,
			domain.RuleAlgorithmicAudit,
		},
		provider.CapNotificationControl: {
			domain.RuleNotificationCurfew, domain.RuleUsageTimerNotification,
			domain.RuleParentalEventNotification,
		},
		provider.CapAdDataControl: {
			domain.RuleTargetedAdBlock, domain.RuleCommercialDataBan,
		},
		provider.CapAgeVerification: {
			domain.RuleAgeGate, domain.RuleParentalConsentGate,
			domain.RuleSocialMediaMinAge,
		},
		provider.CapComplianceReporting: {
			domain.RuleCSAMReporting, domain.RuleLibraryFilterCompliance,
			domain.RuleAIMinorInteraction, domain.RuleImageRightsMinor,
		},
	}
	cats, ok := mapping[cap]
	if !ok {
		return false
	}
	for _, c := range cats {
		if c == category {
			return true
		}
	}
	return false
}
