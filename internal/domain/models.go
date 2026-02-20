package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// User represents an authenticated account.
type User struct {
	ID             uuid.UUID  `json:"id"`
	ExternalAuthID string     `json:"external_auth_id,omitempty"`
	Email          string     `json:"email"`
	PasswordHash   string     `json:"-"`
	Name           string     `json:"name"`
	IsAdmin        bool       `json:"is_admin"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	DeletedAt      *time.Time `json:"deleted_at,omitempty"`
}

// RefreshToken stores issued refresh tokens for session management.
type RefreshToken struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	TokenHash string    `json:"-"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
	Revoked   bool      `json:"revoked"`
}

// Family represents a family group.
type Family struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// FamilyRole defines a member's role in a family.
type FamilyRole string

const (
	RoleOwner    FamilyRole = "owner"
	RoleParent   FamilyRole = "parent"
	RoleGuardian FamilyRole = "guardian"
)

// FamilyMember links a user to a family with a role.
type FamilyMember struct {
	ID       uuid.UUID  `json:"id"`
	FamilyID uuid.UUID  `json:"family_id"`
	UserID   uuid.UUID  `json:"user_id"`
	Role     FamilyRole `json:"role"`
	JoinedAt time.Time  `json:"joined_at"`
}

// Child represents a child within a family.
type Child struct {
	ID        uuid.UUID `json:"id"`
	FamilyID  uuid.UUID `json:"family_id"`
	Name      string    `json:"name"`
	BirthDate time.Time `json:"birth_date"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Age calculates the child's current age in years.
func (c *Child) Age() int {
	now := time.Now()
	age := now.Year() - c.BirthDate.Year()
	if now.YearDay() < c.BirthDate.YearDay() {
		age--
	}
	return age
}

// RatingSystem represents a content rating system (MPAA, ESRB, etc.).
type RatingSystem struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Country     string `json:"country"`
	MediaType   string `json:"media_type"` // movie, tv, game, web
	Description string `json:"description"`
}

// Rating represents a single rating within a system (e.g., PG-13 in MPAA).
type Rating struct {
	ID             uuid.UUID `json:"id"`
	SystemID       string    `json:"system_id"`
	Code           string    `json:"code"`
	Name           string    `json:"name"`
	Description    string    `json:"description"`
	MinAge         int       `json:"min_age"`
	DisplayOrder   int       `json:"display_order"`
	RestrictiveIdx int       `json:"restrictive_idx"` // higher = more restrictive
}

// RatingEquivalence maps ratings across systems.
type RatingEquivalence struct {
	ID        uuid.UUID `json:"id"`
	RatingA   uuid.UUID `json:"rating_a"`
	RatingB   uuid.UUID `json:"rating_b"`
	Strength  float64   `json:"strength"` // 0-1, how equivalent
}

// ContentDescriptor represents content descriptors (violence, language, etc.).
type ContentDescriptor struct {
	ID       uuid.UUID `json:"id"`
	SystemID string    `json:"system_id"`
	Code     string    `json:"code"`
	Name     string    `json:"name"`
	Category string    `json:"category"`
}

// AgeRatingMap maps age ranges to appropriate ratings per system.
type AgeRatingMap struct {
	ID       uuid.UUID `json:"id"`
	MinAge   int       `json:"min_age"`
	MaxAge   int       `json:"max_age"`
	SystemID string    `json:"system_id"`
	RatingID uuid.UUID `json:"rating_id"`
}

// PolicyStatus indicates whether a policy is active or paused.
type PolicyStatus string

const (
	PolicyActive PolicyStatus = "active"
	PolicyPaused PolicyStatus = "paused"
	PolicyDraft  PolicyStatus = "draft"
)

// ChildPolicy represents a set of parental control rules for a child.
type ChildPolicy struct {
	ID        uuid.UUID    `json:"id"`
	ChildID   uuid.UUID    `json:"child_id"`
	Name      string       `json:"name"`
	Status    PolicyStatus `json:"status"`
	Priority  int          `json:"priority"`
	Version   int          `json:"version"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

// RuleCategory enumerates all 40 rule types.
type RuleCategory string

const (
	// Content rules
	RuleContentRating         RuleCategory = "content_rating"
	RuleContentBlockTitle     RuleCategory = "content_block_title"
	RuleContentAllowTitle     RuleCategory = "content_allow_title"
	RuleContentAllowlistMode  RuleCategory = "content_allowlist_mode"
	RuleContentDescriptorBlock RuleCategory = "content_descriptor_block"

	// Time rules
	RuleTimeDailyLimit    RuleCategory = "time_daily_limit"
	RuleTimeScheduledHours RuleCategory = "time_scheduled_hours"
	RuleTimePerAppLimit   RuleCategory = "time_per_app_limit"
	RuleTimeDowntime      RuleCategory = "time_downtime"

	// Purchase rules
	RulePurchaseApproval   RuleCategory = "purchase_approval"
	RulePurchaseSpendingCap RuleCategory = "purchase_spending_cap"
	RulePurchaseBlockIAP   RuleCategory = "purchase_block_iap"

	// Social rules
	RuleSocialContacts    RuleCategory = "social_contacts"
	RuleSocialChatControl RuleCategory = "social_chat_control"
	RuleSocialMultiplayer RuleCategory = "social_multiplayer"

	// Web rules
	RuleWebSafeSearch       RuleCategory = "web_safesearch"
	RuleWebCategoryBlock    RuleCategory = "web_category_block"
	RuleWebCustomAllowlist  RuleCategory = "web_custom_allowlist"
	RuleWebCustomBlocklist  RuleCategory = "web_custom_blocklist"
	RuleWebFilterLevel      RuleCategory = "web_filter_level"

	// Privacy rules
	RulePrivacyLocation          RuleCategory = "privacy_location"
	RulePrivacyProfileVisibility RuleCategory = "privacy_profile_visibility"
	RulePrivacyDataSharing       RuleCategory = "privacy_data_sharing"
	RulePrivacyAccountCreation   RuleCategory = "privacy_account_creation"

	// Monitoring rules
	RuleMonitoringActivity RuleCategory = "monitoring_activity"
	RuleMonitoringAlerts   RuleCategory = "monitoring_alerts"

	// Algorithmic Safety rules (KOSA, KOSMA, CA SB 976, EU DSA)
	RuleAlgoFeedControl         RuleCategory = "algo_feed_control"
	RuleAddictiveDesignControl  RuleCategory = "addictive_design_control"

	// Notification rules (VA SB 854, NY SAFE for Kids, MN HF 2, TN HB 1891)
	RuleNotificationCurfew      RuleCategory = "notification_curfew"
	RuleUsageTimerNotification  RuleCategory = "usage_timer_notification"

	// Advertising & Data rules (COPPA 2.0, EU DSA, India DPDPA, CT SB 3, MD Kids Code)
	RuleTargetedAdBlock         RuleCategory = "targeted_ad_block"
	RuleDMRestriction           RuleCategory = "dm_restriction"
	RuleAgeGate                 RuleCategory = "age_gate"
	RuleDataDeletionRequest     RuleCategory = "data_deletion_request"
	RuleGeolocationOptIn        RuleCategory = "geolocation_opt_in"

	// Compliance expansion rules
	RuleCSAMReporting           RuleCategory = "csam_reporting"
	RuleLibraryFilterCompliance RuleCategory = "library_filter_compliance"
	RuleAIMinorInteraction      RuleCategory = "ai_minor_interaction"
	RuleSocialMediaMinAge       RuleCategory = "social_media_min_age"
	RuleImageRightsMinor        RuleCategory = "image_rights_minor"

	// Legislation-driven expansion (2025)
	RuleParentalConsentGate       RuleCategory = "parental_consent_gate"
	RuleParentalEventNotification RuleCategory = "parental_event_notification"
	RuleScreenTimeReport          RuleCategory = "screen_time_report"
	RuleCommercialDataBan         RuleCategory = "commercial_data_ban"
	RuleAlgorithmicAudit          RuleCategory = "algorithmic_audit"
)

// AllRuleCategories returns all 45 rule categories.
func AllRuleCategories() []RuleCategory {
	return []RuleCategory{
		RuleContentRating, RuleContentBlockTitle, RuleContentAllowTitle,
		RuleContentAllowlistMode, RuleContentDescriptorBlock,
		RuleTimeDailyLimit, RuleTimeScheduledHours, RuleTimePerAppLimit, RuleTimeDowntime,
		RulePurchaseApproval, RulePurchaseSpendingCap, RulePurchaseBlockIAP,
		RuleSocialContacts, RuleSocialChatControl, RuleSocialMultiplayer,
		RuleWebSafeSearch, RuleWebCategoryBlock, RuleWebCustomAllowlist,
		RuleWebCustomBlocklist, RuleWebFilterLevel,
		RulePrivacyLocation, RulePrivacyProfileVisibility, RulePrivacyDataSharing,
		RulePrivacyAccountCreation,
		RuleMonitoringActivity, RuleMonitoringAlerts,
		RuleAlgoFeedControl, RuleAddictiveDesignControl,
		RuleNotificationCurfew, RuleUsageTimerNotification,
		RuleTargetedAdBlock, RuleDMRestriction, RuleAgeGate,
		RuleDataDeletionRequest, RuleGeolocationOptIn,
		RuleCSAMReporting, RuleLibraryFilterCompliance, RuleAIMinorInteraction,
		RuleSocialMediaMinAge, RuleImageRightsMinor,
		RuleParentalConsentGate, RuleParentalEventNotification, RuleScreenTimeReport,
		RuleCommercialDataBan, RuleAlgorithmicAudit,
	}
}

// PolicyRule is a single rule within a policy.
type PolicyRule struct {
	ID        uuid.UUID       `json:"id"`
	PolicyID  uuid.UUID       `json:"policy_id"`
	Category  RuleCategory    `json:"category"`
	Enabled   bool            `json:"enabled"`
	Config    json.RawMessage `json:"config"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

// PlatformCategory groups platforms by type.
type PlatformCategory string

const (
	PlatformCategoryDNS       PlatformCategory = "dns"
	PlatformCategoryStreaming  PlatformCategory = "streaming"
	PlatformCategoryGaming    PlatformCategory = "gaming"
	PlatformCategoryDevice    PlatformCategory = "device"
	PlatformCategoryBrowser   PlatformCategory = "browser"
)

// ComplianceLevel indicates a platform's compliance depth.
type ComplianceLevel string

const (
	ComplianceLevelCompliant   ComplianceLevel = "compliant"
	ComplianceLevelProvisional ComplianceLevel = "provisional"
	ComplianceLevelPending     ComplianceLevel = "pending"
)

// Platform represents a regulated technology platform.
type Platform struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Category    PlatformCategory `json:"category"`
	Tier        ComplianceLevel  `json:"tier"`
	Description string           `json:"description"`
	IconURL     string           `json:"icon_url"`
	AuthType    string           `json:"auth_type"` // api_key, oauth2, manual
	Enabled     bool             `json:"enabled"`
}

// ComplianceLink links a family to a platform with credentials.
type ComplianceLink struct {
	ID                 uuid.UUID  `json:"id"`
	FamilyID           uuid.UUID  `json:"family_id"`
	PlatformID         string     `json:"platform_id"`
	Status             string     `json:"status"` // verified, unverified, error
	EncryptedCreds     string     `json:"-"`
	ExternalID         string     `json:"external_id,omitempty"`
	LastEnforcementAt  *time.Time `json:"last_enforcement_at,omitempty"`
	LastEnforcementStatus string  `json:"last_enforcement_status,omitempty"`
	VerifiedAt         time.Time  `json:"verified_at"`
}

// EnforcementStatus tracks the state of an enforcement operation.
type EnforcementStatus string

const (
	EnforcementPending    EnforcementStatus = "pending"
	EnforcementRunning    EnforcementStatus = "running"
	EnforcementCompleted  EnforcementStatus = "completed"
	EnforcementFailed     EnforcementStatus = "failed"
	EnforcementPartial    EnforcementStatus = "partial"
)

// EnforcementJob represents a policy enforcement operation.
type EnforcementJob struct {
	ID           uuid.UUID         `json:"id"`
	ChildID      uuid.UUID         `json:"child_id"`
	PolicyID     uuid.UUID         `json:"policy_id"`
	TriggerType  string            `json:"trigger_type"` // manual, auto, webhook
	Status       EnforcementStatus `json:"status"`
	StartedAt    *time.Time        `json:"started_at,omitempty"`
	CompletedAt  *time.Time        `json:"completed_at,omitempty"`
	CreatedAt    time.Time         `json:"created_at"`
}

// EnforcementResult stores the result of enforcing policy on a specific platform.
type EnforcementResult struct {
	ID               uuid.UUID         `json:"id"`
	EnforcementJobID uuid.UUID         `json:"enforcement_job_id"`
	ComplianceLinkID uuid.UUID         `json:"compliance_link_id"`
	PlatformID       string            `json:"platform_id"`
	Status           EnforcementStatus `json:"status"`
	RulesApplied     int               `json:"rules_applied"`
	RulesSkipped     int               `json:"rules_skipped"`
	RulesFailed      int               `json:"rules_failed"`
	Details          json.RawMessage   `json:"details,omitempty"`
	ErrorMessage     *string           `json:"error_message,omitempty"`
	StartedAt        *time.Time        `json:"started_at,omitempty"`
	CompletedAt      *time.Time        `json:"completed_at,omitempty"`
}

// Webhook represents a registered webhook endpoint.
type Webhook struct {
	ID        uuid.UUID `json:"id"`
	FamilyID  uuid.UUID `json:"family_id"`
	URL       string    `json:"url"`
	Secret    string    `json:"-"`
	Events    []string  `json:"events"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UIFeedback stores visual feedback from reviewers on the running UI.
type UIFeedback struct {
	ID             uuid.UUID  `json:"id"`
	PageRoute      string     `json:"page_route"`
	CSSSelector    string     `json:"css_selector"`
	ComponentHint  *string    `json:"component_hint,omitempty"`
	Comment        string     `json:"comment"`
	ReviewerName   string     `json:"reviewer_name"`
	Status         string     `json:"status"`
	ViewportWidth  *int       `json:"viewport_width,omitempty"`
	ViewportHeight *int       `json:"viewport_height,omitempty"`
	ClickX         *int       `json:"click_x,omitempty"`
	ClickY         *int       `json:"click_y,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	ResolvedAt     *time.Time `json:"resolved_at,omitempty"`
}

// WebhookDelivery tracks webhook delivery attempts.
type WebhookDelivery struct {
	ID           uuid.UUID       `json:"id"`
	WebhookID    uuid.UUID       `json:"webhook_id"`
	Event        string          `json:"event"`
	Payload      json.RawMessage `json:"payload"`
	ResponseCode *int            `json:"response_code,omitempty"`
	Success      bool            `json:"success"`
	Attempts     int             `json:"attempts"`
	NextRetryAt  *time.Time      `json:"next_retry_at,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
}

// ── Community Standards ────────────────────────────────────────────

// Standard represents a community-defined rule package (e.g. "Four Norms", "Wait Until 8th").
type Standard struct {
	ID              uuid.UUID      `json:"id"`
	Slug            string         `json:"slug"`
	Name            string         `json:"name"`
	Organization    string         `json:"organization"`
	Description     string         `json:"description"`
	LongDescription string         `json:"long_description"`
	IconURL         string         `json:"icon_url,omitempty"`
	Version         string         `json:"version"`
	Published       bool           `json:"published"`
	MinAge          *int           `json:"min_age,omitempty"`
	MaxAge          *int           `json:"max_age,omitempty"`
	AdoptionCount   int            `json:"adoption_count"`
	Rules           []StandardRule `json:"rules,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
}

// StandardRule is a single rule within a community standard.
type StandardRule struct {
	ID         uuid.UUID       `json:"id"`
	StandardID uuid.UUID       `json:"standard_id"`
	Category   RuleCategory    `json:"category"`
	Label      string          `json:"label"`
	Enabled    bool            `json:"enabled"`
	Config     json.RawMessage `json:"config"`
	SortOrder  int             `json:"sort_order"`
}

// StandardAdoption records a child adopting a community standard.
type StandardAdoption struct {
	ID         uuid.UUID `json:"id"`
	ChildID    uuid.UUID `json:"child_id"`
	StandardID uuid.UUID `json:"standard_id"`
	AdoptedAt  time.Time `json:"adopted_at"`
}

// Movement aliases — same underlying types, new naming for /movements routes.
type Movement = Standard
type MovementRule = StandardRule
type MovementAdoption = StandardAdoption

// ── Phosra Service Layer ─────────────────────────────────────────

// NotificationSchedule stores curfew/timer configs per child managed by Phosra.
type NotificationSchedule struct {
	ID           uuid.UUID       `json:"id"`
	ChildID      uuid.UUID       `json:"child_id"`
	FamilyID     uuid.UUID       `json:"family_id"`
	RuleCategory RuleCategory    `json:"rule_category"`
	Config       json.RawMessage `json:"config"`
	Active       bool            `json:"active"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}

// ActivityLog records a single activity entry aggregated from any provider.
type ActivityLog struct {
	ID         uuid.UUID       `json:"id"`
	ChildID    uuid.UUID       `json:"child_id"`
	PlatformID string          `json:"platform_id"`
	Category   string          `json:"category"`
	Detail     json.RawMessage `json:"detail"`
	RecordedAt time.Time       `json:"recorded_at"`
	CreatedAt  time.Time       `json:"created_at"`
}

// PrivacyRequest tracks data deletion, sharing opt-out, and consent requests.
type PrivacyRequest struct {
	ID          uuid.UUID       `json:"id"`
	ChildID     uuid.UUID       `json:"child_id"`
	FamilyID    uuid.UUID       `json:"family_id"`
	RequestType string          `json:"request_type"`
	PlatformID  string          `json:"platform_id"`
	Status      string          `json:"status"`
	Config      json.RawMessage `json:"config"`
	SubmittedAt *time.Time      `json:"submitted_at,omitempty"`
	CompletedAt *time.Time      `json:"completed_at,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
}

// AgeVerificationRecord tracks age gate and consent verification per child+platform.
type AgeVerificationRecord struct {
	ID               uuid.UUID       `json:"id"`
	ChildID          uuid.UUID       `json:"child_id"`
	VerificationType string          `json:"verification_type"`
	PlatformID       string          `json:"platform_id"`
	Verified         bool            `json:"verified"`
	VerifiedAt       *time.Time      `json:"verified_at,omitempty"`
	Config           json.RawMessage `json:"config"`
	CreatedAt        time.Time       `json:"created_at"`
}

// ComplianceAttestation records compliance status for a family+platform+rule.
type ComplianceAttestation struct {
	ID           uuid.UUID       `json:"id"`
	FamilyID     uuid.UUID       `json:"family_id"`
	RuleCategory RuleCategory    `json:"rule_category"`
	PlatformID   string          `json:"platform_id"`
	Status       string          `json:"status"`
	Evidence     json.RawMessage `json:"evidence"`
	AttestedAt   *time.Time      `json:"attested_at,omitempty"`
	NextReviewAt *time.Time      `json:"next_review_at,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
}

// SocialPolicy stores Phosra-managed social control policies per child+platform.
type SocialPolicy struct {
	ID         uuid.UUID       `json:"id"`
	ChildID    uuid.UUID       `json:"child_id"`
	PlatformID string          `json:"platform_id"`
	PolicyType string          `json:"policy_type"`
	Config     json.RawMessage `json:"config"`
	Active     bool            `json:"active"`
	CreatedAt  time.Time       `json:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at"`
}

// LocationLog stores Phosra-tracked location data for providers that lack native tracking.
type LocationLog struct {
	ID         uuid.UUID `json:"id"`
	ChildID    uuid.UUID `json:"child_id"`
	DeviceID   string    `json:"device_id"`
	Latitude   float64   `json:"latitude"`
	Longitude  float64   `json:"longitude"`
	Accuracy   float64   `json:"accuracy"`
	RecordedAt time.Time `json:"recorded_at"`
}

// PurchaseApproval tracks parent approval workflow for purchases.
type PurchaseApproval struct {
	ID          uuid.UUID  `json:"id"`
	ChildID     uuid.UUID  `json:"child_id"`
	FamilyID    uuid.UUID  `json:"family_id"`
	PlatformID  string     `json:"platform_id"`
	ItemName    string     `json:"item_name"`
	Amount      float64    `json:"amount"`
	Currency    string     `json:"currency"`
	Status      string     `json:"status"`
	RequestedAt time.Time  `json:"requested_at"`
	ResolvedAt  *time.Time `json:"resolved_at,omitempty"`
	ResolvedBy  *uuid.UUID `json:"resolved_by,omitempty"`
}

// ContentClassification stores Phosra-managed content ratings.
type ContentClassification struct {
	ID           uuid.UUID `json:"id"`
	ContentType  string    `json:"content_type"`
	ContentID    string    `json:"content_id"`
	RatingSystem string    `json:"rating_system"`
	Rating       string    `json:"rating"`
	Confidence   float64   `json:"confidence"`
	Source       string    `json:"source"`
	ClassifiedAt time.Time `json:"classified_at"`
}

// ── Device Sync (Apple On-Device Integration) ───────────────────

// DeviceRegistration represents a registered iOS app instance for a child.
type DeviceRegistration struct {
	ID                   uuid.UUID       `json:"id"`
	ChildID              uuid.UUID       `json:"child_id"`
	FamilyID             uuid.UUID       `json:"family_id"`
	PlatformID           string          `json:"platform_id"`
	DeviceName           string          `json:"device_name"`
	DeviceModel          string          `json:"device_model"`
	OSVersion            string          `json:"os_version"`
	AppVersion           string          `json:"app_version"`
	APNsToken            *string         `json:"apns_token,omitempty"`
	APIKeyHash           string          `json:"-"`
	LastSeenAt           *time.Time      `json:"last_seen_at,omitempty"`
	LastPolicyVersion    int             `json:"last_policy_version"`
	Status               string          `json:"status"`
	Capabilities         []string        `json:"capabilities"`
	EnforcementSummary   json.RawMessage `json:"enforcement_summary"`
	CreatedAt            time.Time       `json:"created_at"`
	UpdatedAt            time.Time       `json:"updated_at"`
}

// DeviceReport represents an activity or status report from a device.
type DeviceReport struct {
	ID         uuid.UUID       `json:"id"`
	DeviceID   uuid.UUID       `json:"device_id"`
	ChildID    uuid.UUID       `json:"child_id"`
	ReportType string          `json:"report_type"`
	Payload    json.RawMessage `json:"payload"`
	ReportedAt time.Time       `json:"reported_at"`
	CreatedAt  time.Time       `json:"created_at"`
}
