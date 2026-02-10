package stubs

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/provider"
)

// StubAdapter represents a provider that doesn't have a public API.
// Returns realistic simulated enforcement results showing which rules
// were applied per-platform, making the playground demo compelling.
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
	return nil
}

func (s *StubAdapter) EnforcePolicy(_ context.Context, req provider.EnforcementRequest) (*provider.EnforcementResult, error) {
	applied := 0
	skipped := 0
	details := make(map[string]any)

	for _, rule := range req.Rules {
		if !rule.Enabled {
			skipped++
			continue
		}
		supported := false
		for _, cap := range s.capabilities {
			if matchesCapability(rule.Category, cap) {
				supported = true
				break
			}
		}
		if supported {
			applied++
			details[string(rule.Category)] = buildRuleDetail(rule)
		} else {
			skipped++
		}
	}

	childName := req.ChildName
	if childName == "" {
		childName = "Child"
	}
	profileName := fmt.Sprintf("%s's %s Profile", childName, s.info.Name)
	details["profile_name"] = profileName

	return &provider.EnforcementResult{
		RulesApplied: applied,
		RulesSkipped: skipped,
		RulesFailed:  0,
		Details:      details,
		Message:      fmt.Sprintf("%s: %d rules applied to %s.", s.info.Name, applied, profileName),
		ManualSteps:  s.manualSteps,
	}, nil
}

// buildRuleDetail extracts a human-readable detail for an applied rule.
func buildRuleDetail(rule domain.PolicyRule) map[string]any {
	detail := map[string]any{"status": "applied"}

	var config map[string]any
	if err := json.Unmarshal(rule.Config, &config); err != nil {
		return detail
	}

	switch rule.Category {
	case domain.RuleContentRating:
		if ratings, ok := config["max_ratings"].(map[string]any); ok {
			detail["max_ratings"] = ratings
			if mpaa, ok := ratings["mpaa"].(string); ok {
				detail["max_rating"] = mpaa
				detail["blocked_above"] = ratingsAbove("mpaa", mpaa)
			}
		}
	case domain.RuleTimeDailyLimit:
		if mins, ok := config["daily_minutes"].(float64); ok {
			detail["limit_minutes"] = int(mins)
			detail["limit_display"] = fmt.Sprintf("%dh %dm", int(mins)/60, int(mins)%60)
		}
	case domain.RuleTimeScheduledHours:
		if sched, ok := config["schedule"].(map[string]any); ok {
			detail["schedule"] = sched
		}
	case domain.RuleWebFilterLevel:
		if level, ok := config["level"].(string); ok {
			detail["filter_level"] = level
		}
	case domain.RuleWebSafeSearch:
		detail["safe_search"] = "enforced"
	case domain.RulePurchaseBlockIAP:
		detail["in_app_purchases"] = "blocked"
	case domain.RulePurchaseApproval:
		detail["purchase_approval"] = "required"
	case domain.RuleSocialChatControl:
		if mode, ok := config["mode"].(string); ok {
			detail["chat_mode"] = mode
		}
	case domain.RuleSocialMultiplayer:
		if mode, ok := config["mode"].(string); ok {
			detail["multiplayer"] = mode
		}
	case domain.RuleAlgoFeedControl:
		if mode, ok := config["feed_mode"].(string); ok {
			detail["feed_mode"] = mode
		}
	case domain.RuleAddictiveDesignControl:
		if disabled, ok := config["disabled_features"].([]any); ok {
			detail["disabled_features"] = disabled
		}
	case domain.RuleTargetedAdBlock:
		detail["targeted_ads"] = "blocked"
	case domain.RuleMonitoringActivity:
		detail["activity_logging"] = "enabled"
	case domain.RuleMonitoringAlerts:
		detail["alerts"] = "enabled"
	case domain.RuleScreenTimeReport:
		detail["screen_time_reports"] = "enabled"
	case domain.RuleNotificationCurfew:
		if start, ok := config["start"].(string); ok {
			detail["curfew_start"] = start
		}
		if end, ok := config["end"].(string); ok {
			detail["curfew_end"] = end
		}
	case domain.RuleUsageTimerNotification:
		if interval, ok := config["interval_minutes"].(float64); ok {
			detail["timer_interval_minutes"] = int(interval)
		}
	case domain.RuleParentalEventNotification:
		detail["parent_notifications"] = "enabled"
	case domain.RulePrivacyProfileVisibility:
		if mode, ok := config["visibility"].(string); ok {
			detail["profile_visibility"] = mode
		} else {
			detail["profile_visibility"] = "private"
		}
	case domain.RulePrivacyDataSharing:
		detail["data_sharing"] = "restricted"
	case domain.RulePrivacyAccountCreation:
		detail["account_creation"] = "requires_approval"
	case domain.RuleDataDeletionRequest:
		detail["data_deletion"] = "enabled"
	case domain.RuleGeolocationOptIn:
		detail["geolocation"] = "opt-in only"
	case domain.RuleContentAllowlistMode:
		detail["allowlist_mode"] = "enabled"
	case domain.RuleContentDescriptorBlock:
		if descriptors, ok := config["blocked_descriptors"].([]any); ok {
			detail["blocked_descriptors"] = descriptors
		}
	case domain.RuleDMRestriction:
		if mode, ok := config["mode"].(string); ok {
			detail["dm_mode"] = mode
		}
	case domain.RuleAgeGate:
		if minAge, ok := config["min_age"].(float64); ok {
			detail["minimum_age"] = int(minAge)
		}
	case domain.RuleParentalConsentGate:
		detail["parental_consent"] = "required"
	case domain.RuleSocialMediaMinAge:
		detail["social_media_min_age"] = "enforced"
	case domain.RuleCommercialDataBan:
		detail["commercial_data_use"] = "banned"
	case domain.RuleAlgorithmicAudit:
		detail["algorithmic_audit"] = "enabled"
	case domain.RuleCSAMReporting:
		detail["csam_reporting"] = "enabled"
	case domain.RuleLibraryFilterCompliance:
		detail["library_filter"] = "compliant"
	case domain.RuleAIMinorInteraction:
		detail["ai_interaction_safeguards"] = "enabled"
	case domain.RuleImageRightsMinor:
		detail["minor_image_rights"] = "protected"
	}

	return detail
}

// ratingsAbove returns the ratings above the given rating for display.
func ratingsAbove(system, rating string) []string {
	mpaaOrder := []string{"G", "PG", "PG-13", "R", "NC-17"}
	if system == "mpaa" {
		found := false
		var above []string
		for _, r := range mpaaOrder {
			if found {
				above = append(above, r)
			}
			if r == rating {
				found = true
			}
		}
		return above
	}
	return nil
}

func matchesCapability(category domain.RuleCategory, cap provider.Capability) bool {
	mapping := map[provider.Capability][]domain.RuleCategory{
		// Content
		provider.CapContentRating: {
			domain.RuleContentRating, domain.RuleContentBlockTitle,
			domain.RuleContentAllowTitle, domain.RuleContentAllowlistMode,
			domain.RuleContentDescriptorBlock,
		},
		// Time
		provider.CapTimeLimit:      {domain.RuleTimeDailyLimit, domain.RuleTimePerAppLimit},
		provider.CapScheduledHours: {domain.RuleTimeScheduledHours, domain.RuleTimeDowntime},
		// Purchase
		provider.CapPurchaseControl: {domain.RulePurchaseApproval, domain.RulePurchaseSpendingCap, domain.RulePurchaseBlockIAP},
		// Web
		provider.CapWebFiltering: {
			domain.RuleWebFilterLevel, domain.RuleWebCategoryBlock,
			domain.RuleWebCustomAllowlist, domain.RuleWebCustomBlocklist,
		},
		provider.CapSafeSearch:      {domain.RuleWebSafeSearch},
		provider.CapCustomBlocklist: {domain.RuleWebCustomBlocklist},
		provider.CapCustomAllowlist: {domain.RuleWebCustomAllowlist},
		// Social
		provider.CapSocialControl: {
			domain.RuleSocialContacts, domain.RuleSocialChatControl,
			domain.RuleSocialMultiplayer, domain.RuleDMRestriction,
		},
		// Location & monitoring
		provider.CapLocationTracking: {domain.RulePrivacyLocation, domain.RuleGeolocationOptIn},
		provider.CapActivityMonitor:  {domain.RuleMonitoringActivity, domain.RuleMonitoringAlerts, domain.RuleScreenTimeReport},
		// Privacy
		provider.CapPrivacyControl: {
			domain.RulePrivacyProfileVisibility, domain.RulePrivacyDataSharing,
			domain.RulePrivacyAccountCreation, domain.RuleDataDeletionRequest,
		},
		// Algorithmic safety (KOSA, CA SB 976, EU DSA)
		provider.CapAlgorithmicSafety: {
			domain.RuleAlgoFeedControl, domain.RuleAddictiveDesignControl,
			domain.RuleAlgorithmicAudit,
		},
		// Notification control (VA SB 854, NY SAFE for Kids)
		provider.CapNotificationControl: {
			domain.RuleNotificationCurfew, domain.RuleUsageTimerNotification,
			domain.RuleParentalEventNotification,
		},
		// Advertising & data (COPPA 2.0, EU DSA, India DPDPA)
		provider.CapAdDataControl: {
			domain.RuleTargetedAdBlock, domain.RuleCommercialDataBan,
		},
		// Age verification & access control
		provider.CapAgeVerification: {
			domain.RuleAgeGate, domain.RuleParentalConsentGate,
			domain.RuleSocialMediaMinAge,
		},
		// Compliance reporting (CSAM, CIPA, EU AI Act)
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
		[]provider.Capability{
			provider.CapContentRating, provider.CapTimeLimit,
			provider.CapAlgorithmicSafety, provider.CapPrivacyControl,
			provider.CapAdDataControl, provider.CapAgeVerification,
			provider.CapNotificationControl,
		},
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
		[]provider.Capability{
			provider.CapContentRating, provider.CapTimeLimit,
			provider.CapAlgorithmicSafety, provider.CapPrivacyControl,
			provider.CapAdDataControl, provider.CapAgeVerification,
			provider.CapNotificationControl,
		},
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
		[]provider.Capability{
			provider.CapContentRating, provider.CapPurchaseControl,
			provider.CapAlgorithmicSafety, provider.CapPrivacyControl,
			provider.CapAdDataControl, provider.CapAgeVerification,
		},
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
		[]provider.Capability{
			provider.CapContentRating, provider.CapSafeSearch, provider.CapTimeLimit,
			provider.CapAlgorithmicSafety, provider.CapSocialControl,
			provider.CapPrivacyControl, provider.CapAdDataControl,
			provider.CapAgeVerification, provider.CapNotificationControl,
			provider.CapComplianceReporting,
		},
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
		[]provider.Capability{
			provider.CapContentRating, provider.CapAlgorithmicSafety,
			provider.CapPrivacyControl, provider.CapAdDataControl,
			provider.CapAgeVerification,
		},
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
		[]provider.Capability{
			provider.CapContentRating, provider.CapAlgorithmicSafety,
			provider.CapPrivacyControl, provider.CapAdDataControl,
			provider.CapAgeVerification,
		},
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
		[]provider.Capability{
			provider.CapContentRating, provider.CapTimeLimit,
			provider.CapScheduledHours, provider.CapPurchaseControl,
			provider.CapSocialControl, provider.CapActivityMonitor,
			provider.CapPrivacyControl, provider.CapNotificationControl,
			provider.CapAgeVerification, provider.CapComplianceReporting,
		},
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
		[]provider.Capability{
			provider.CapContentRating, provider.CapTimeLimit,
			provider.CapPurchaseControl, provider.CapSocialControl,
			provider.CapActivityMonitor, provider.CapPrivacyControl,
			provider.CapNotificationControl, provider.CapAgeVerification,
		},
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
		[]provider.Capability{
			provider.CapContentRating, provider.CapTimeLimit,
			provider.CapSocialControl, provider.CapActivityMonitor,
			provider.CapPrivacyControl, provider.CapNotificationControl,
			provider.CapAgeVerification,
		},
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
		[]provider.Capability{
			provider.CapContentRating, provider.CapPrivacyControl,
			provider.CapAgeVerification,
		},
		[]string{
			"1. Go to Roku Settings > Parental controls",
			"2. Enable parental controls and set a PIN",
			"3. Set content rating preferences for movies and TV shows",
			"4. Block specific channels from the channel store",
		},
	)
}

func NewParamountPlus() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "paramount_plus", Name: "Paramount+", Category: domain.PlatformCategoryStreaming, Tier: domain.ComplianceLevelPending, Description: "Paramount+ streaming parental controls", AuthType: "manual"},
		[]provider.Capability{
			provider.CapContentRating, provider.CapAlgorithmicSafety,
			provider.CapPrivacyControl, provider.CapAdDataControl,
			provider.CapAgeVerification,
		},
		[]string{
			"1. Open Paramount+ and go to Settings > Parental Controls",
			"2. Enable the Kids profile for the child",
			"3. Set content rating restrictions to match the recommended level",
			"4. Enable PIN protection on the main profile",
		},
	)
}

func NewYouTubeTV() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "youtube_tv", Name: "YouTube TV", Category: domain.PlatformCategoryStreaming, Tier: domain.ComplianceLevelPending, Description: "YouTube TV live streaming parental controls", AuthType: "manual"},
		[]provider.Capability{
			provider.CapContentRating, provider.CapTimeLimit,
			provider.CapAlgorithmicSafety, provider.CapPrivacyControl,
			provider.CapAdDataControl, provider.CapAgeVerification,
		},
		[]string{
			"1. Open YouTube TV and go to Settings > Filter",
			"2. Enable 'Filter' to hide content rated TV-MA and R",
			"3. Configure Google Family Link for additional controls",
			"4. Set up restricted profiles for children",
		},
	)
}

func NewPeacock() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "peacock", Name: "Peacock", Category: domain.PlatformCategoryStreaming, Tier: domain.ComplianceLevelPending, Description: "Peacock streaming parental controls", AuthType: "manual"},
		[]provider.Capability{
			provider.CapContentRating, provider.CapAlgorithmicSafety,
			provider.CapPrivacyControl, provider.CapAdDataControl,
			provider.CapAgeVerification,
		},
		[]string{
			"1. Open Peacock and go to Account > Parental Controls",
			"2. Create a Kids profile for the child",
			"3. Set content maturity rating to the recommended level",
			"4. Enable PIN lock on adult profiles",
		},
	)
}

func NewFireTablet() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "fire_tablet", Name: "Amazon Fire Tablet", Category: domain.PlatformCategoryDevice, Tier: domain.ComplianceLevelPending, Description: "Amazon Fire Tablet Kids parental controls", AuthType: "manual"},
		[]provider.Capability{
			provider.CapContentRating, provider.CapTimeLimit,
			provider.CapScheduledHours, provider.CapPurchaseControl,
			provider.CapWebFiltering, provider.CapSafeSearch,
			provider.CapSocialControl, provider.CapLocationTracking,
			provider.CapActivityMonitor, provider.CapPrivacyControl,
			provider.CapNotificationControl, provider.CapAgeVerification,
		},
		[]string{
			"1. Open Settings > Parental Controls on the Fire Tablet",
			"2. Set up Amazon Kids+ profile with age-appropriate content",
			"3. Configure daily screen time goals and bedtime",
			"4. Set web browser restrictions and enable safe search",
			"5. Configure app and purchase restrictions",
			"6. Enable 'Learn First' to require educational goals before free time",
		},
	)
}

func NewAppleWatch() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "apple_watch", Name: "Apple Watch", Category: domain.PlatformCategoryDevice, Tier: domain.ComplianceLevelPending, Description: "Apple Watch parental controls via Family Setup", AuthType: "manual"},
		[]provider.Capability{
			provider.CapTimeLimit, provider.CapScheduledHours,
			provider.CapLocationTracking, provider.CapNotificationControl,
			provider.CapActivityMonitor, provider.CapPrivacyControl,
		},
		[]string{
			"1. Open the Watch app on the parent's iPhone",
			"2. Go to My Watch > Family > Set Up Apple Watch for a Family Member",
			"3. Configure Schooltime mode to limit apps during school hours",
			"4. Set up location sharing via Find My",
			"5. Configure allowed contacts and communication limits",
			"6. Enable Downtime schedules for notification curfew",
		},
	)
}

func NewFireTV() *StubAdapter {
	return newStub(
		provider.PlatformInfo{ID: "fire_tv", Name: "Amazon Fire TV Stick", Category: domain.PlatformCategoryDevice, Tier: domain.ComplianceLevelPending, Description: "Amazon Fire TV parental controls", AuthType: "manual"},
		[]provider.Capability{
			provider.CapContentRating, provider.CapTimeLimit,
			provider.CapPurchaseControl, provider.CapPrivacyControl,
			provider.CapAgeVerification,
		},
		[]string{
			"1. Open Settings > Preferences > Parental Controls on Fire TV",
			"2. Enable parental controls and set a PIN",
			"3. Set content rating restrictions for Prime Video",
			"4. Restrict app launches and purchases",
			"5. Configure viewing restrictions by content type",
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
	register(NewParamountPlus())
	register(NewYouTubeTV())
	register(NewPeacock())
	register(NewFireTablet())
	register(NewAppleWatch())
	register(NewFireTV())
}
