package apple

import (
	"context"
	"fmt"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
)

type Adapter struct{}

func New() *Adapter {
	return &Adapter{}
}

func (a *Adapter) Info() provider.PlatformInfo {
	return provider.PlatformInfo{
		ID:          "apple",
		Name:        "Apple Screen Time",
		Category:    domain.PlatformCategoryDevice,
		Tier:        domain.ComplianceLevelCompliant,
		Description: "On-device enforcement via Phosra iOS app using Apple FamilyControls, ManagedSettings, and DeviceActivity frameworks",
		AuthType:    "device_sync",
		DocsURL:     "https://developer.apple.com/documentation/familycontrols",
	}
}

func (a *Adapter) Capabilities() []provider.Capability {
	return []provider.Capability{
		provider.CapContentRating,
		provider.CapWebFiltering,
		provider.CapAppControl,
		provider.CapTimeLimit,
		provider.CapScheduledHours,
		provider.CapPurchaseControl,
		provider.CapActivityMonitor,
		provider.CapNotificationControl,
		provider.CapPrivacyControl,
		provider.CapSocialControl,
		provider.CapSafeSearch,
		provider.CapCustomBlocklist,
		provider.CapCustomAllowlist,
	}
}

func (a *Adapter) ValidateAuth(_ context.Context, _ provider.AuthConfig) error {
	return nil // Device sync uses device API keys, validated separately
}

func (a *Adapter) EnforcePolicy(_ context.Context, req provider.EnforcementRequest) (*provider.EnforcementResult, error) {
	// Apple devices enforce locally via the Phosra iOS app.
	// This adapter does not push anything remotely. Instead, it counts
	// applicable rules and reports them as "applied" (meaning the policy
	// document is ready for the device to fetch).
	applied := 0
	skipped := 0
	ruleDetails := make(map[string]any)

	for _, rule := range req.Rules {
		if !rule.Enabled {
			skipped++
			continue
		}
		applied++
		ruleDetails[string(rule.Category)] = "queued_for_device_sync"
	}

	return &provider.EnforcementResult{
		RulesApplied: applied,
		RulesSkipped: skipped,
		Details: map[string]any{
			"delivery_method": "device_sync",
			"rules":           ruleDetails,
			"note":            "Rules are available via GET /api/v1/device/policy. The iOS app fetches and enforces locally.",
		},
		Message: fmt.Sprintf("%d rules queued for device sync. The Phosra iOS app will apply them on next policy refresh.", applied),
	}, nil
}

func (a *Adapter) GetCurrentConfig(_ context.Context, _ provider.AuthConfig) (map[string]any, error) {
	return map[string]any{
		"note":            "Apple device configuration is managed locally by the Phosra iOS app.",
		"delivery_method": "device_sync",
	}, nil
}

func (a *Adapter) RevokePolicy(_ context.Context, _ provider.AuthConfig) error {
	return nil // Revocation is handled by the iOS app when it receives an empty/paused policy
}

func (a *Adapter) SupportsWebhooks() bool { return true }

func (a *Adapter) RegisterWebhook(_ context.Context, _ provider.AuthConfig, _ string) error {
	// Webhook delivery for policy.updated events is handled by the core webhook
	// infrastructure. Device-specific push (APNs) is handled separately.
	return nil
}
