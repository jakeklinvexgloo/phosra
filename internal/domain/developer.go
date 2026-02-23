package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ── Developer Portal ─────────────────────────────────────────────

// DeveloperTier defines the subscription tier for a developer org.
type DeveloperTier string

const (
	DeveloperTierFree       DeveloperTier = "free"
	DeveloperTierGrowth     DeveloperTier = "growth"
	DeveloperTierEnterprise DeveloperTier = "enterprise"
)

// DeveloperRole defines a member's role within a developer org.
type DeveloperRole string

const (
	DeveloperRoleOwner  DeveloperRole = "owner"
	DeveloperRoleAdmin  DeveloperRole = "admin"
	DeveloperRoleMember DeveloperRole = "member"
)

// DeveloperEnv defines the API key environment.
type DeveloperEnv string

const (
	DeveloperEnvLive DeveloperEnv = "live"
	DeveloperEnvTest DeveloperEnv = "test"
)

// API scopes for developer keys.
const (
	ScopeReadFamilies     = "read:families"
	ScopeWriteFamilies    = "write:families"
	ScopeReadPolicies     = "read:policies"
	ScopeWritePolicies    = "write:policies"
	ScopeReadEnforcement  = "read:enforcement"
	ScopeWriteEnforcement = "write:enforcement"
	ScopeReadRatings      = "read:ratings"
	ScopeReadPlatforms    = "read:platforms"
	ScopeWriteCompliance  = "write:compliance"
	ScopeDeviceManage     = "device:manage"
	ScopeWebhookManage    = "webhook:manage"
)

// AllScopes contains every defined API scope.
var AllScopes = []string{
	ScopeReadFamilies,
	ScopeWriteFamilies,
	ScopeReadPolicies,
	ScopeWritePolicies,
	ScopeReadEnforcement,
	ScopeWriteEnforcement,
	ScopeReadRatings,
	ScopeReadPlatforms,
	ScopeWriteCompliance,
	ScopeDeviceManage,
	ScopeWebhookManage,
}

// KeyEventType defines the type of key lifecycle event.
type KeyEventType string

const (
	KeyEventCreated       KeyEventType = "created"
	KeyEventRegenerated   KeyEventType = "regenerated"
	KeyEventRevoked       KeyEventType = "revoked"
	KeyEventScopesChanged KeyEventType = "scopes_changed"
	KeyEventExpired       KeyEventType = "expired"
)

// DeveloperOrg represents a developer organization.
type DeveloperOrg struct {
	ID           uuid.UUID     `json:"id"`
	Name         string        `json:"name"`
	Slug         string        `json:"slug"`
	Description  string        `json:"description"`
	WebsiteURL   string        `json:"website_url"`
	LogoURL      string        `json:"logo_url"`
	OwnerUserID  uuid.UUID     `json:"owner_user_id"`
	Tier         DeveloperTier `json:"tier"`
	RateLimitRPM int           `json:"rate_limit_rpm"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
}

// DeveloperOrgMember links a user to a developer org with a role.
type DeveloperOrgMember struct {
	ID        uuid.UUID     `json:"id"`
	OrgID     uuid.UUID     `json:"org_id"`
	UserID    uuid.UUID     `json:"user_id"`
	Role      DeveloperRole `json:"role"`
	CreatedAt time.Time     `json:"created_at"`
}

// DeveloperAPIKey represents an API key issued to a developer org.
type DeveloperAPIKey struct {
	ID          uuid.UUID    `json:"id"`
	OrgID       uuid.UUID    `json:"org_id"`
	Name        string       `json:"name"`
	KeyPrefix   string       `json:"key_prefix"`
	KeyHash     string       `json:"-"` // never expose in JSON
	Environment DeveloperEnv `json:"environment"`
	Scopes      []string     `json:"scopes"`
	LastUsedAt  *time.Time   `json:"last_used_at,omitempty"`
	LastUsedIP  *string      `json:"last_used_ip,omitempty"`
	ExpiresAt   *time.Time   `json:"expires_at,omitempty"`
	RevokedAt   *time.Time   `json:"revoked_at,omitempty"`
	CreatedBy   uuid.UUID    `json:"created_by"`
	CreatedAt   time.Time    `json:"created_at"`
}

// DeveloperAPIUsage tracks hourly API usage rollups per key and endpoint.
type DeveloperAPIUsage struct {
	ID            uuid.UUID `json:"id"`
	KeyID         uuid.UUID `json:"key_id"`
	OrgID         uuid.UUID `json:"org_id"`
	Hour          time.Time `json:"hour"`
	Endpoint      string    `json:"endpoint"`
	Status2xx     int       `json:"status_2xx"`
	Status4xx     int       `json:"status_4xx"`
	Status5xx     int       `json:"status_5xx"`
	TotalRequests int       `json:"total_requests"`
}

// DeveloperKeyEvent records a key lifecycle event for audit purposes.
type DeveloperKeyEvent struct {
	ID          uuid.UUID       `json:"id"`
	KeyID       uuid.UUID       `json:"key_id"`
	EventType   KeyEventType    `json:"event_type"`
	ActorUserID *uuid.UUID      `json:"actor_user_id,omitempty"`
	Metadata    json.RawMessage `json:"metadata"`
	CreatedAt   time.Time       `json:"created_at"`
}
