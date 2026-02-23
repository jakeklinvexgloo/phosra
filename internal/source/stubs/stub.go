package stubs

import (
	"context"
	"errors"
	"fmt"

	"github.com/guardiangate/api/internal/domain"
	"github.com/guardiangate/api/internal/source"
)

// ErrGuidedOnly is returned when a managed-tier operation is called on a guided-tier source.
var ErrGuidedOnly = errors.New("this source is guided-only; use GetGuidedSteps for setup instructions")

// StubAdapter is a generic source adapter for parental control apps that don't
// have API integrations. It returns guided setup instructions instead of making
// API calls, following the same stub pattern as internal/provider/stubs.
type StubAdapter struct {
	info source.SourceInfo
}

// NewStubAdapter creates a guided-tier stub adapter for a source without an API.
func NewStubAdapter(slug, displayName, website, description string) source.SourceAdapter {
	return &StubAdapter{
		info: source.SourceInfo{
			Slug:        slug,
			DisplayName: displayName,
			APITier:     "guided",
			AuthType:    "none",
			Website:     website,
			Description: description,
		},
	}
}

func (s *StubAdapter) Info() source.SourceInfo { return s.info }

// Capabilities returns empty capabilities — guided-tier sources have no programmatic support.
func (s *StubAdapter) Capabilities() []source.SourceCapability {
	return []source.SourceCapability{}
}

func (s *StubAdapter) ValidateCredentials(_ context.Context, _ map[string]interface{}) error {
	return ErrGuidedOnly
}

func (s *StubAdapter) SyncRules(_ context.Context, _ source.SyncRequest) (*source.SyncResult, error) {
	return nil, ErrGuidedOnly
}

func (s *StubAdapter) PushRule(_ context.Context, _ map[string]interface{}, _ domain.RuleCategory, _ interface{}) (*source.SyncRuleResult, error) {
	return nil, ErrGuidedOnly
}

func (s *StubAdapter) PullCurrentState(_ context.Context, _ map[string]interface{}) (*source.PullResult, error) {
	return nil, ErrGuidedOnly
}

// GetGuidedSteps returns manual setup instructions for the given source.
// The category parameter can be used to return category-specific steps; for
// now, all guided stubs return generic setup instructions.
func (s *StubAdapter) GetGuidedSteps(_ context.Context, category string) ([]source.GuidedStep, error) {
	steps := []source.GuidedStep{
		{
			StepNumber:  1,
			Title:       fmt.Sprintf("Open %s", s.info.DisplayName),
			Description: fmt.Sprintf("Open the %s app on your device or visit %s in your browser.", s.info.DisplayName, s.info.Website),
			DeepLink:    s.info.Website,
		},
		{
			StepNumber:  2,
			Title:       "Navigate to Parental Controls",
			Description: fmt.Sprintf("In %s, go to Settings or the Parental Controls section.", s.info.DisplayName),
		},
		{
			StepNumber:  3,
			Title:       "Configure Rules",
			Description: fmt.Sprintf("Manually apply the recommended Phosra policy rules in %s's settings.", s.info.DisplayName),
		},
		{
			StepNumber:  4,
			Title:       "Verify Configuration",
			Description: "Once configured, return to Phosra and mark this source as set up.",
		},
	}

	if category != "" {
		steps[2].Description = fmt.Sprintf("Locate the '%s' setting in %s and configure it to match the Phosra policy recommendation.", category, s.info.DisplayName)
	}

	return steps, nil
}

func (s *StubAdapter) SupportsInboundWebhooks() bool { return false }

func (s *StubAdapter) RegisterInboundWebhook(_ context.Context, _ map[string]interface{}, _ string) error {
	return fmt.Errorf("%s does not support webhooks", s.info.DisplayName)
}

// RegisterAll registers all known parental control source stubs into the registry.
// As real adapters are implemented, move the corresponding source from here to its
// own package (e.g., internal/source/bark/) and register it directly.
func RegisterAll(registry *source.Registry) {
	registry.Register(NewStubAdapter(
		domain.SourceBark, "Bark", "https://www.bark.us",
		"AI-driven content monitoring for texts, email, and social media",
	))
	registry.Register(NewStubAdapter(
		domain.SourceQustodio, "Qustodio", "https://www.qustodio.com",
		"Cross-platform parental controls with web filtering and screen time",
	))
	registry.Register(NewStubAdapter(
		domain.SourceSecurly, "Securly", "https://www.securly.com",
		"School and home web filtering and student safety",
	))
	registry.Register(NewStubAdapter(
		domain.SourceAppleScreenTime, "Apple Screen Time", "https://support.apple.com/en-us/HT208982",
		"Built-in parental controls for iOS and macOS devices",
	))
	registry.Register(NewStubAdapter(
		domain.SourceGoogleFamilyLink, "Google Family Link", "https://families.google.com/familylink/",
		"Parental controls for Android devices and Google services",
	))
	registry.Register(NewStubAdapter(
		domain.SourceNetNanny, "Net Nanny", "https://www.netnanny.com",
		"Web filtering and screen time management for families",
	))
	registry.Register(NewStubAdapter(
		domain.SourceKidslox, "Kidslox", "https://kidslox.com",
		"Cross-platform parental controls with app blocking and screen time",
	))
	registry.Register(NewStubAdapter(
		domain.SourceOurPact, "OurPact", "https://ourpact.com",
		"Screen time scheduling and app/website blocking",
	))
	registry.Register(NewStubAdapter(
		domain.SourceMMGuardian, "MMGuardian", "https://www.mmguardian.com",
		"Phone monitoring and parental controls for Android and iOS",
	))
	registry.Register(NewStubAdapter(
		domain.SourceMobicip, "Mobicip", "https://www.mobicip.com",
		"Internet filter and parental controls for families and schools",
	))
}
