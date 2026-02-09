package provider

import (
	"context"

	"github.com/guardiangate/api/internal/domain"
)

// Capability represents a feature a platform supports.
type Capability string

const (
	CapContentRating    Capability = "content_rating"
	CapTimeLimit        Capability = "time_limit"
	CapScheduledHours   Capability = "scheduled_hours"
	CapPurchaseControl  Capability = "purchase_control"
	CapWebFiltering     Capability = "web_filtering"
	CapSafeSearch       Capability = "safe_search"
	CapAppControl       Capability = "app_control"
	CapSocialControl    Capability = "social_control"
	CapLocationTracking Capability = "location_tracking"
	CapActivityMonitor  Capability = "activity_monitoring"
	CapCustomBlocklist  Capability = "custom_blocklist"
	CapCustomAllowlist  Capability = "custom_allowlist"

	// Expanded capabilities (2025 legislation support)
	CapPrivacyControl     Capability = "privacy_control"
	CapAlgorithmicSafety  Capability = "algorithmic_safety"
	CapNotificationControl Capability = "notification_control"
	CapAdDataControl      Capability = "ad_data_control"
	CapAgeVerification    Capability = "age_verification"
	CapComplianceReporting Capability = "compliance_reporting"
)

// PlatformInfo describes a platform adapter.
type PlatformInfo struct {
	ID          string                  `json:"id"`
	Name        string                  `json:"name"`
	Category    domain.PlatformCategory `json:"category"`
	Tier        domain.ComplianceLevel  `json:"tier"`
	Description string                  `json:"description"`
	AuthType    string                  `json:"auth_type"`
	SetupURL    string                  `json:"setup_url,omitempty"`
	DocsURL     string                  `json:"docs_url,omitempty"`
}

// AuthConfig holds platform credentials.
type AuthConfig struct {
	EncryptedCreds string            `json:"encrypted_creds"`
	APIKey         string            `json:"api_key,omitempty"`
	AccessToken    string            `json:"access_token,omitempty"`
	RefreshToken   string            `json:"refresh_token,omitempty"`
	ExtraParams    map[string]string `json:"extra_params,omitempty"`
}

// EnforcementRequest contains everything needed to enforce a policy on a platform.
type EnforcementRequest struct {
	Rules      []domain.PolicyRule `json:"rules"`
	AuthConfig AuthConfig          `json:"auth_config"`
	ChildName  string              `json:"child_name,omitempty"`
	ChildAge   int                 `json:"child_age,omitempty"`
}

// EnforcementResult reports the outcome of a policy enforcement operation.
type EnforcementResult struct {
	RulesApplied int            `json:"rules_applied"`
	RulesSkipped int            `json:"rules_skipped"`
	RulesFailed  int            `json:"rules_failed"`
	Details      map[string]any `json:"details,omitempty"`
	Message      string         `json:"message,omitempty"`
	// ManualSteps contains human-readable instructions for pending-compliance platforms
	ManualSteps []string `json:"manual_steps,omitempty"`
}

// Adapter is the core interface all platforms implement.
type Adapter interface {
	Info() PlatformInfo
	Capabilities() []Capability
	ValidateAuth(ctx context.Context, auth AuthConfig) error
	EnforcePolicy(ctx context.Context, req EnforcementRequest) (*EnforcementResult, error)
	GetCurrentConfig(ctx context.Context, auth AuthConfig) (map[string]any, error)
	RevokePolicy(ctx context.Context, auth AuthConfig) error
	SupportsWebhooks() bool
	RegisterWebhook(ctx context.Context, auth AuthConfig, callbackURL string) error
}

// OAuthAdapter extends Adapter for platforms using OAuth2.
type OAuthAdapter interface {
	Adapter
	AuthorizeURL(state string, redirectURI string) string
	ExchangeCode(ctx context.Context, code string, redirectURI string) (*AuthConfig, error)
	RefreshAccessToken(ctx context.Context, auth AuthConfig) (*AuthConfig, error)
}
