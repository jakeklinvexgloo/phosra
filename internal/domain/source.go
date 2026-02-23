package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ── Sources API (Parental Control Integrations) ─────────────────

// SourceTier defines the integration tier for a parental control source.
type SourceTier string

const (
	SourceTierManaged SourceTier = "managed"
	SourceTierGuided  SourceTier = "guided"
)

// SourceStatus indicates the connection state of a source.
type SourceStatus string

const (
	SourceStatusPending      SourceStatus = "pending"
	SourceStatusConnected    SourceStatus = "connected"
	SourceStatusSyncing      SourceStatus = "syncing"
	SourceStatusError        SourceStatus = "error"
	SourceStatusDisconnected SourceStatus = "disconnected"
)

// SyncMode defines how a sync job operates.
type SyncMode string

const (
	SyncModeFull        SyncMode = "full"
	SyncModeIncremental SyncMode = "incremental"
	SyncModeSingleRule  SyncMode = "single_rule"
)

// SyncTriggerType defines what initiated a sync job.
type SyncTriggerType string

const (
	SyncTriggerManual       SyncTriggerType = "manual"
	SyncTriggerAuto         SyncTriggerType = "auto"
	SyncTriggerWebhook      SyncTriggerType = "webhook"
	SyncTriggerPolicyChange SyncTriggerType = "policy_change"
)

// SyncJobStatus tracks the state of a sync job.
type SyncJobStatus string

const (
	SyncJobPending   SyncJobStatus = "pending"
	SyncJobRunning   SyncJobStatus = "running"
	SyncJobCompleted SyncJobStatus = "completed"
	SyncJobFailed    SyncJobStatus = "failed"
	SyncJobPartial   SyncJobStatus = "partial"
)

// SyncResultStatus tracks the outcome of syncing a single rule.
type SyncResultStatus string

const (
	SyncResultPushed      SyncResultStatus = "pushed"
	SyncResultSkipped     SyncResultStatus = "skipped"
	SyncResultFailed      SyncResultStatus = "failed"
	SyncResultUnsupported SyncResultStatus = "unsupported"
)

// SupportLevel indicates how well a source supports a rule category.
type SupportLevel string

const (
	SupportFull    SupportLevel = "full"
	SupportPartial SupportLevel = "partial"
	SupportNone    SupportLevel = "none"
)

// ReadWriteMode defines the sync direction for a capability.
type ReadWriteMode string

const (
	RWPushOnly      ReadWriteMode = "push_only"
	RWPullOnly      ReadWriteMode = "pull_only"
	RWBidirectional ReadWriteMode = "bidirectional"
)

// Known source slugs for parental control integrations.
const (
	SourceBark             = "bark"
	SourceQustodio         = "qustodio"
	SourceSecurly          = "securly"
	SourceAppleScreenTime  = "apple-screen-time"
	SourceGoogleFamilyLink = "google-family-link"
	SourceNetNanny         = "net-nanny"
	SourceKidslox          = "kidslox"
	SourceOurPact          = "ourpact"
	SourceMMGuardian       = "mmguardian"
	SourceMobicip          = "mobicip"
)

// Source represents a parental control source connection for a child.
type Source struct {
	ID             uuid.UUID       `json:"id"`
	ChildID        uuid.UUID       `json:"child_id"`
	FamilyID       uuid.UUID       `json:"family_id"`
	SourceSlug     string          `json:"source_slug"`
	DisplayName    string          `json:"display_name"`
	APITier        SourceTier      `json:"api_tier"`
	Credentials    string          `json:"-"` // AES-256-GCM encrypted; never expose in JSON
	Status         SourceStatus    `json:"status"`
	AutoSync       bool            `json:"auto_sync"`
	Capabilities   json.RawMessage `json:"capabilities"`
	Config         json.RawMessage `json:"config"`
	LastSyncAt     *time.Time      `json:"last_sync_at,omitempty"`
	LastSyncStatus *string         `json:"last_sync_status,omitempty"`
	SyncVersion    int             `json:"sync_version"`
	ErrorMessage   *string         `json:"error_message,omitempty"`
	WebhookSecret  *string         `json:"-"` // never expose in JSON
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

// SourceSyncJob represents a single sync operation for a source.
type SourceSyncJob struct {
	ID           uuid.UUID       `json:"id"`
	SourceID     uuid.UUID       `json:"source_id"`
	SyncMode     SyncMode        `json:"sync_mode"`
	TriggerType  SyncTriggerType `json:"trigger_type"`
	Status       SyncJobStatus   `json:"status"`
	RulesPushed  int             `json:"rules_pushed"`
	RulesSkipped int             `json:"rules_skipped"`
	RulesFailed  int             `json:"rules_failed"`
	ErrorMessage *string         `json:"error_message,omitempty"`
	StartedAt    *time.Time      `json:"started_at,omitempty"`
	CompletedAt  *time.Time      `json:"completed_at,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
}

// SourceSyncResult stores the result of syncing a single rule within a job.
type SourceSyncResult struct {
	ID             uuid.UUID        `json:"id"`
	JobID          uuid.UUID        `json:"job_id"`
	SourceID       uuid.UUID        `json:"source_id"`
	RuleCategory   string           `json:"rule_category"`
	Status         SyncResultStatus `json:"status"`
	SourceValue    json.RawMessage  `json:"source_value,omitempty"`
	SourceResponse json.RawMessage  `json:"source_response,omitempty"`
	ErrorMessage   *string          `json:"error_message,omitempty"`
	CreatedAt      time.Time        `json:"created_at"`
}

// SourceCapability describes what a source supports for a given rule category.
type SourceCapability struct {
	ID           uuid.UUID    `json:"id"`
	SourceSlug   string       `json:"source_slug"`
	RuleCategory string       `json:"rule_category"`
	SupportLevel SupportLevel `json:"support_level"`
	ReadWrite    ReadWriteMode `json:"read_write"`
	Notes        *string      `json:"notes,omitempty"`
}

// SourceInboundEvent records an event received from a source (for drift detection).
type SourceInboundEvent struct {
	ID          uuid.UUID       `json:"id"`
	SourceID    uuid.UUID       `json:"source_id"`
	EventType   string          `json:"event_type"`
	Payload     json.RawMessage `json:"payload"`
	Processed   bool            `json:"processed"`
	ProcessedAt *time.Time      `json:"processed_at,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
}
