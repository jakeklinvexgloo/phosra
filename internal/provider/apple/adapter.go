package apple

import (
	"context"
	"encoding/xml"
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
		Name:        "Apple Screen Time (MDM)",
		Category:    domain.PlatformCategoryDevice,
		Tier:        domain.ComplianceLevelProvisional,
		Description: "Generates Apple MDM configuration profiles for Screen Time and content restrictions",
		AuthType:    "manual",
		DocsURL:     "https://developer.apple.com/documentation/devicemanagement",
	}
}

func (a *Adapter) Capabilities() []provider.Capability {
	return []provider.Capability{
		provider.CapContentRating,
		provider.CapWebFiltering,
		provider.CapAppControl,
		provider.CapTimeLimit,
	}
}

func (a *Adapter) ValidateAuth(_ context.Context, _ provider.AuthConfig) error {
	return nil // Manual setup, no auth to validate
}

func (a *Adapter) EnforcePolicy(ctx context.Context, req provider.EnforcementRequest) (*provider.EnforcementResult, error) {
	profile := a.buildMDMProfile(req.Rules)

	profileXML, err := xml.MarshalIndent(profile, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("generate MDM profile: %w", err)
	}

	result := &provider.EnforcementResult{
		RulesApplied: profile.appliedCount,
		RulesSkipped: profile.skippedCount,
		Details: map[string]any{
			"mdm_profile": string(profileXML),
			"instructions": []string{
				"1. Download the generated .mobileconfig profile",
				"2. AirDrop or email the profile to the target device",
				"3. On the device, go to Settings > General > VPN & Device Management",
				"4. Tap the GuardianGate profile and install it",
				"5. Enter the device passcode when prompted",
			},
		},
		Message: "MDM configuration profile generated. Install on the Apple device to apply restrictions.",
		ManualSteps: []string{
			"Download the .mobileconfig file from the dashboard",
			"Install the profile on the target Apple device",
			"Verify restrictions are active in Settings > Screen Time",
		},
	}

	return result, nil
}

type mdmProfile struct {
	XMLName      xml.Name `xml:"plist"`
	Version      string   `xml:"version,attr"`
	Dict         mdmDict  `xml:"dict"`
	appliedCount int      `xml:"-"`
	skippedCount int      `xml:"-"`
}

type mdmDict struct {
	Entries []mdmEntry
}

type mdmEntry struct {
	Key   string `xml:"key"`
	Value string `xml:"string,omitempty"`
}

func (a *Adapter) buildMDMProfile(rules []domain.PolicyRule) *mdmProfile {
	profile := &mdmProfile{
		Version: "1.0",
	}

	for _, rule := range rules {
		if !rule.Enabled {
			profile.skippedCount++
			continue
		}

		switch rule.Category {
		case domain.RuleContentRating, domain.RuleWebFilterLevel, domain.RuleTimeDailyLimit:
			profile.appliedCount++
		default:
			profile.skippedCount++
		}
	}

	return profile
}

func (a *Adapter) GetCurrentConfig(_ context.Context, _ provider.AuthConfig) (map[string]any, error) {
	return map[string]any{
		"note": "Apple MDM profiles cannot be read remotely. Check device Settings > Screen Time for current configuration.",
	}, nil
}

func (a *Adapter) RevokePolicy(_ context.Context, _ provider.AuthConfig) error {
	return nil // Profile must be manually removed from device
}

func (a *Adapter) SupportsWebhooks() bool { return false }

func (a *Adapter) RegisterWebhook(_ context.Context, _ provider.AuthConfig, _ string) error {
	return fmt.Errorf("apple MDM profiles do not support webhooks")
}
