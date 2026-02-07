package stubs

import (
	"context"
	"fmt"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
)

// StubAdapter represents a provider that doesn't have a public API.
// It provides manual instructions for configuring parental controls.
type StubAdapter struct {
	info         provider.PlatformInfo
	capabilities []provider.Capability
	manualSteps  []string
}

func newStub(info provider.PlatformInfo, caps []provider.Capability, steps []string) *StubAdapter {
	return &StubAdapter{info: info, capabilities: caps, manualSteps: steps}
}

func (s *StubAdapter) Info() provider.PlatformInfo         { return s.info }
func (s *StubAdapter) Capabilities() []provider.Capability { return s.capabilities }

func (s *StubAdapter) ValidateAuth(_ context.Context, _ provider.AuthConfig) error {
	return nil // Manual setup
}

func (s *StubAdapter) EnforcePolicy(_ context.Context, req provider.EnforcementRequest) (*provider.EnforcementResult, error) {
	applied := 0
	skipped := 0
	for _, rule := range req.Rules {
		if !rule.Enabled {
			skipped++
			continue
		}
		// Check if this stub supports the rule category
		supported := false
		for _, cap := range s.capabilities {
			if matchesCapability(rule.Category, cap) {
				supported = true
				break
			}
		}
		if supported {
			applied++
		} else {
			skipped++
		}
	}

	return &provider.EnforcementResult{
		RulesApplied: 0,
		RulesSkipped: skipped + applied,
		Details: map[string]any{
			"platform":      s.info.Name,
			"tier":          "pending",
			"manual_steps":  s.manualSteps,
			"rules_pending": applied,
		},
		Message:     fmt.Sprintf("%s has not yet achieved compliance. Follow the manual steps to configure safety controls.", s.info.Name),
		ManualSteps: s.manualSteps,
	}, nil
}

func matchesCapability(category domain.RuleCategory, cap provider.Capability) bool {
	mapping := map[provider.Capability][]domain.RuleCategory{
		provider.CapContentRating:   {domain.RuleContentRating, domain.RuleContentBlockTitle, domain.RuleContentAllowTitle},
		provider.CapTimeLimit:       {domain.RuleTimeDailyLimit, domain.RuleTimePerAppLimit},
		provider.CapScheduledHours:  {domain.RuleTimeScheduledHours, domain.RuleTimeDowntime},
		provider.CapPurchaseControl: {domain.RulePurchaseApproval, domain.RulePurchaseSpendingCap, domain.RulePurchaseBlockIAP},
		provider.CapWebFiltering:    {domain.RuleWebFilterLevel, domain.RuleWebCategoryBlock},
		provider.CapSafeSearch:      {domain.RuleWebSafeSearch},
		provider.CapSocialControl:   {domain.RuleSocialContacts, domain.RuleSocialChatControl, domain.RuleSocialMultiplayer},
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

func (s *StubAdapter) GetCurrentConfig(_ context.Context, _ provider.AuthConfig) (map[string]any, error) {
	return map[string]any{
		"note":         fmt.Sprintf("%s configuration must be checked manually in the app/device settings.", s.info.Name),
		"manual_steps": s.manualSteps,
	}, nil
}

func (s *StubAdapter) RevokePolicy(_ context.Context, _ provider.AuthConfig) error { return nil }
func (s *StubAdapter) SupportsWebhooks() bool                                      { return false }
func (s *StubAdapter) RegisterWebhook(_ context.Context, _ provider.AuthConfig, _ string) error {
	return fmt.Errorf("%s does not support webhooks", s.info.Name)
}

// Factory functions for each stub provider

func NewNetflix() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "netflix", Name: "Netflix", Category: domain.PlatformCategoryStreaming, Tier: domain.ComplianceLevelPending, Description: "Netflix streaming parental controls", AuthType: "manual"},
		[]provider.Capability{provider.CapContentRating},
		[]string{
			"1. Open Netflix and go to Account > Profiles & Parental Controls",
			"2. Select the child's profile",
			"3. Click 'Viewing Restrictions' and set the maturity rating",
			"4. Click 'Profile Lock' to require a PIN for the parent profile",
			"5. Enable 'Kids Experience' for younger children",
		},
	)
}

func NewDisneyPlus() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "disney_plus", Name: "Disney+", Category: domain.PlatformCategoryStreaming, Tier: domain.ComplianceLevelPending, Description: "Disney+ parental controls", AuthType: "manual"},
		[]provider.Capability{provider.CapContentRating},
		[]string{
			"1. Open Disney+ and go to your profile > Edit Profiles",
			"2. Select the child's profile",
			"3. Toggle 'Kids Profile' for content rated TV-7FV and below",
			"4. Set Content Rating to match the recommended level",
			"5. Enable profile PIN to prevent profile switching",
		},
	)
}

func NewPrimeVideo() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "prime_video", Name: "Amazon Prime Video", Category: domain.PlatformCategoryStreaming, Tier: domain.ComplianceLevelPending, Description: "Prime Video parental controls", AuthType: "manual"},
		[]provider.Capability{provider.CapContentRating, provider.CapPurchaseControl},
		[]string{
			"1. Open Prime Video > Settings > Parental Controls",
			"2. Set a PIN for purchases and restricted content",
			"3. Set Viewing Restrictions to the recommended rating level",
			"4. Enable purchase restrictions under Amazon account settings",
		},
	)
}

func NewYouTube() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "youtube", Name: "YouTube / YouTube Kids", Category: domain.PlatformCategoryStreaming, Tier: domain.ComplianceLevelPending, Description: "YouTube content controls", AuthType: "manual"},
		[]provider.Capability{provider.CapContentRating, provider.CapSafeSearch},
		[]string{
			"1. Go to YouTube Settings > General > Restricted Mode and enable it",
			"2. For children under 13, use YouTube Kids instead",
			"3. In YouTube Kids, set the content level (Preschool, Younger, Older)",
			"4. Configure Google Family Link for additional YouTube controls",
			"5. Disable search in YouTube Kids for younger children",
		},
	)
}

func NewHulu() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "hulu", Name: "Hulu", Category: domain.PlatformCategoryStreaming, Tier: domain.ComplianceLevelPending, Description: "Hulu parental controls", AuthType: "manual"},
		[]provider.Capability{provider.CapContentRating},
		[]string{
			"1. Go to Hulu Account > Profiles > Kids Profile",
			"2. Enable Kids Mode for the child's profile",
			"3. Set age-appropriate content restrictions",
		},
	)
}

func NewMax() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "max", Name: "Max (HBO)", Category: domain.PlatformCategoryStreaming, Tier: domain.ComplianceLevelPending, Description: "Max parental controls", AuthType: "manual"},
		[]provider.Capability{provider.CapContentRating},
		[]string{
			"1. Open Max > Profile > Edit > Parental Controls",
			"2. Create a Kids profile for the child",
			"3. Set the maturity rating to match the recommended level",
			"4. Set a PIN lock on adult profiles",
		},
	)
}

func NewXbox() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "xbox", Name: "Xbox", Category: domain.PlatformCategoryGaming, Tier: domain.ComplianceLevelPending, Description: "Xbox parental controls", AuthType: "manual"},
		[]provider.Capability{provider.CapContentRating, provider.CapTimeLimit, provider.CapScheduledHours, provider.CapPurchaseControl, provider.CapSocialControl},
		[]string{
			"1. Go to Xbox Settings > Account > Family settings",
			"2. Add the child's Microsoft account to your family group",
			"3. Set Content & apps restrictions with the appropriate age rating",
			"4. Configure Screen time schedule and daily limits",
			"5. Set 'Ask a parent' for purchases",
			"6. Configure Privacy & online safety for multiplayer and chat",
		},
	)
}

func NewPlayStation() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "playstation", Name: "PlayStation", Category: domain.PlatformCategoryGaming, Tier: domain.ComplianceLevelPending, Description: "PlayStation parental controls", AuthType: "manual"},
		[]provider.Capability{provider.CapContentRating, provider.CapTimeLimit, provider.CapPurchaseControl, provider.CapSocialControl},
		[]string{
			"1. Go to PS Settings > Family Management > Parental Controls",
			"2. Create a child account under your family manager account",
			"3. Set age-level restriction for games, apps, and Blu-ray/DVD",
			"4. Set monthly spending limit",
			"5. Configure play time restrictions and notifications",
			"6. Restrict communication and user-generated content",
		},
	)
}

func NewNintendo() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "nintendo", Name: "Nintendo", Category: domain.PlatformCategoryGaming, Tier: domain.ComplianceLevelPending, Description: "Nintendo Switch parental controls", AuthType: "manual"},
		[]provider.Capability{provider.CapContentRating, provider.CapTimeLimit, provider.CapSocialControl},
		[]string{
			"1. Download the Nintendo Switch Parental Controls app on your phone",
			"2. Link the app to your child's Nintendo Switch console",
			"3. Set the restriction level (Child, Pre-Teen, or Teen)",
			"4. Set daily play time limits and bedtime alarm",
			"5. Restrict communication features as needed",
			"6. Enable 'Suspend Software' to auto-pause games at time limit",
		},
	)
}

func NewRoku() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "roku", Name: "Roku", Category: domain.PlatformCategoryStreaming, Tier: domain.ComplianceLevelPending, Description: "Roku device parental controls", AuthType: "manual"},
		[]provider.Capability{provider.CapContentRating},
		[]string{
			"1. Go to Roku Settings > Parental controls",
			"2. Enable parental controls and set a PIN",
			"3. Set content rating preferences for movies and TV shows",
			"4. Block specific channels from the channel store",
		},
	)
}

// RegisterAll registers all stub adapters in the given registry.
func RegisterAll(register func(provider.Adapter)) {
	register(NewNetflix())
	register(NewDisneyPlus())
	register(NewPrimeVideo())
	register(NewYouTube())
	register(NewHulu())
	register(NewMax())
	register(NewXbox())
	register(NewPlayStation())
	register(NewNintendo())
	register(NewRoku())
}
