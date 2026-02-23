package source

import (
	"context"
	"time"

	"github.com/guardiangate/api/internal/domain"
)

// SourceInfo describes a parental control source app (e.g., Bark, Qustodio).
type SourceInfo struct {
	Slug        string `json:"slug"`
	DisplayName string `json:"display_name"`
	APITier     string `json:"api_tier"`  // "managed" or "guided"
	AuthType    string `json:"auth_type"` // "api_key", "oauth2", "none"
	Website     string `json:"website"`
	Description string `json:"description"`
}

// SourceCapability describes what a source supports for a given rule category.
type SourceCapability struct {
	Category     domain.RuleCategory `json:"category"`
	SupportLevel string              `json:"support_level"` // "full", "partial", "none"
	ReadWrite    string              `json:"read_write"`    // "push_only", "pull_only", "bidirectional"
	Notes        string              `json:"notes,omitempty"`
}

// SyncRequest contains everything needed to push rules to a source.
type SyncRequest struct {
	Rules      []domain.PolicyRule    `json:"rules"`
	ChildName  string                 `json:"child_name,omitempty"`
	ChildAge   int                    `json:"child_age,omitempty"`
	AuthConfig map[string]interface{} `json:"auth_config"`
}

// SyncRuleResult is the per-rule outcome of pushing a single rule to a source.
type SyncRuleResult struct {
	Category       domain.RuleCategory `json:"category"`
	Status         string              `json:"status"` // "pushed", "skipped", "failed", "unsupported"
	SourceValue    interface{}         `json:"source_value,omitempty"`
	SourceResponse interface{}         `json:"source_response,omitempty"`
	ErrorMessage   string              `json:"error_message,omitempty"`
}

// SyncResult is the overall sync outcome after pushing rules to a source.
type SyncResult struct {
	RulesPushed  int              `json:"rules_pushed"`
	RulesSkipped int              `json:"rules_skipped"`
	RulesFailed  int              `json:"rules_failed"`
	Results      []SyncRuleResult `json:"results"`
	Message      string           `json:"message,omitempty"`
}

// PullResult is the outcome of pulling current state from a source.
type PullResult struct {
	Rules   []PulledRule `json:"rules"`
	Message string       `json:"message,omitempty"`
}

// PulledRule is a rule as read from the source's current configuration.
type PulledRule struct {
	Category    domain.RuleCategory `json:"category"`
	Enabled     bool                `json:"enabled"`
	Value       interface{}         `json:"value,omitempty"`
	LastChanged *time.Time          `json:"last_changed,omitempty"`
}

// GuidedStep is a manual setup instruction for guided-tier sources.
type GuidedStep struct {
	StepNumber  int    `json:"step_number"`
	Title       string `json:"title"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url,omitempty"`
	DeepLink    string `json:"deep_link,omitempty"`
}

// SourceAdapter is the interface all source integrations must implement.
// Unlike provider.Adapter which enforces rules ON platforms, SourceAdapter
// pushes rules TO 3rd-party parental control apps.
type SourceAdapter interface {
	// Info returns metadata about this source.
	Info() SourceInfo

	// Capabilities returns what rule categories this source supports.
	Capabilities() []SourceCapability

	// ValidateCredentials checks if the provided credentials are valid.
	ValidateCredentials(ctx context.Context, auth map[string]interface{}) error

	// SyncRules pushes a set of policy rules to the source.
	SyncRules(ctx context.Context, req SyncRequest) (*SyncResult, error)

	// PushRule pushes a single rule to the source.
	PushRule(ctx context.Context, auth map[string]interface{}, category domain.RuleCategory, value interface{}) (*SyncRuleResult, error)

	// PullCurrentState reads the current rule state from the source (managed tier only).
	PullCurrentState(ctx context.Context, auth map[string]interface{}) (*PullResult, error)

	// GetGuidedSteps returns manual setup instructions (guided tier only).
	GetGuidedSteps(ctx context.Context, category string) ([]GuidedStep, error)

	// SupportsInboundWebhooks returns whether the source can send webhooks to Phosra.
	SupportsInboundWebhooks() bool

	// RegisterInboundWebhook registers a Phosra callback URL with the source.
	RegisterInboundWebhook(ctx context.Context, auth map[string]interface{}, callbackURL string) error
}
