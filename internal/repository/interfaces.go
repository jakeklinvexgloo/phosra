package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByExternalAuthID(ctx context.Context, externalAuthID string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type RefreshTokenRepository interface {
	Create(ctx context.Context, token *domain.RefreshToken) error
	GetByHash(ctx context.Context, hash string) (*domain.RefreshToken, error)
	RevokeByUserID(ctx context.Context, userID uuid.UUID) error
	Revoke(ctx context.Context, id uuid.UUID) error
	DeleteExpired(ctx context.Context) error
}

type FamilyRepository interface {
	Create(ctx context.Context, family *domain.Family) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Family, error)
	Update(ctx context.Context, family *domain.Family) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByUser(ctx context.Context, userID uuid.UUID) ([]domain.Family, error)
}

type FamilyMemberRepository interface {
	Add(ctx context.Context, member *domain.FamilyMember) error
	Remove(ctx context.Context, familyID, userID uuid.UUID) error
	ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.FamilyMember, error)
	GetRole(ctx context.Context, familyID, userID uuid.UUID) (*domain.FamilyMember, error)
}

type ChildRepository interface {
	Create(ctx context.Context, child *domain.Child) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Child, error)
	Update(ctx context.Context, child *domain.Child) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.Child, error)
}

type RatingRepository interface {
	GetSystems(ctx context.Context) ([]domain.RatingSystem, error)
	GetRatingsBySystem(ctx context.Context, systemID string) ([]domain.Rating, error)
	GetRatingByID(ctx context.Context, id uuid.UUID) (*domain.Rating, error)
	GetRatingsForAge(ctx context.Context, age int) ([]domain.AgeRatingMap, error)
	GetEquivalences(ctx context.Context, ratingID uuid.UUID) ([]domain.RatingEquivalence, error)
	GetDescriptors(ctx context.Context, systemID string) ([]domain.ContentDescriptor, error)
	GetAgeRatingMap(ctx context.Context) ([]domain.AgeRatingMap, error)
}

type PolicyRepository interface {
	Create(ctx context.Context, policy *domain.ChildPolicy) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.ChildPolicy, error)
	Update(ctx context.Context, policy *domain.ChildPolicy) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.ChildPolicy, error)
}

type PolicyRuleRepository interface {
	Create(ctx context.Context, rule *domain.PolicyRule) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.PolicyRule, error)
	Update(ctx context.Context, rule *domain.PolicyRule) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByPolicy(ctx context.Context, policyID uuid.UUID) ([]domain.PolicyRule, error)
	BulkUpsert(ctx context.Context, policyID uuid.UUID, rules []domain.PolicyRule) error
}

type PlatformRepository interface {
	GetByID(ctx context.Context, id string) (*domain.Platform, error)
	List(ctx context.Context) ([]domain.Platform, error)
	ListByCategory(ctx context.Context, category domain.PlatformCategory) ([]domain.Platform, error)
}

type ComplianceLinkRepository interface {
	Create(ctx context.Context, link *domain.ComplianceLink) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.ComplianceLink, error)
	Update(ctx context.Context, link *domain.ComplianceLink) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.ComplianceLink, error)
	GetByFamilyAndPlatform(ctx context.Context, familyID uuid.UUID, platformID string) (*domain.ComplianceLink, error)
}

type EnforcementJobRepository interface {
	Create(ctx context.Context, job *domain.EnforcementJob) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.EnforcementJob, error)
	Update(ctx context.Context, job *domain.EnforcementJob) error
	ListByChild(ctx context.Context, childID uuid.UUID, limit int) ([]domain.EnforcementJob, error)
	ListPending(ctx context.Context, limit int) ([]domain.EnforcementJob, error)
}

type EnforcementResultRepository interface {
	Create(ctx context.Context, result *domain.EnforcementResult) error
	Update(ctx context.Context, result *domain.EnforcementResult) error
	ListByJob(ctx context.Context, jobID uuid.UUID) ([]domain.EnforcementResult, error)
}

type WebhookRepository interface {
	Create(ctx context.Context, webhook *domain.Webhook) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Webhook, error)
	Update(ctx context.Context, webhook *domain.Webhook) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.Webhook, error)
	ListActiveByEvent(ctx context.Context, familyID uuid.UUID, event string) ([]domain.Webhook, error)
}

type UIFeedbackRepository interface {
	Create(ctx context.Context, fb *domain.UIFeedback) error
	List(ctx context.Context, status string) ([]domain.UIFeedback, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
}

type WebhookDeliveryRepository interface {
	Create(ctx context.Context, delivery *domain.WebhookDelivery) error
	Update(ctx context.Context, delivery *domain.WebhookDelivery) error
	ListByWebhook(ctx context.Context, webhookID uuid.UUID, limit int) ([]domain.WebhookDelivery, error)
	ListPendingRetries(ctx context.Context, limit int) ([]domain.WebhookDelivery, error)
}

type StandardRepository interface {
	List(ctx context.Context, publishedOnly bool) ([]domain.Standard, error)
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Standard, error)
	GetBySlug(ctx context.Context, slug string) (*domain.Standard, error)
	GetRulesByStandard(ctx context.Context, standardID uuid.UUID) ([]domain.StandardRule, error)
	GetAdoptionCount(ctx context.Context, standardID uuid.UUID) (int, error)
}

type StandardAdoptionRepository interface {
	Adopt(ctx context.Context, adoption *domain.StandardAdoption) error
	Unadopt(ctx context.Context, childID, standardID uuid.UUID) error
	ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.StandardAdoption, error)
	IsAdopted(ctx context.Context, childID, standardID uuid.UUID) (bool, error)
}

// ── Phosra Service Layer Repositories ────────────────────────────

type NotificationScheduleRepository interface {
	Upsert(ctx context.Context, schedule *domain.NotificationSchedule) error
	GetByChildAndCategory(ctx context.Context, childID uuid.UUID, category domain.RuleCategory) (*domain.NotificationSchedule, error)
	ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.NotificationSchedule, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type ActivityLogRepository interface {
	Create(ctx context.Context, entry *domain.ActivityLog) error
	ListByChild(ctx context.Context, childID uuid.UUID, limit int) ([]domain.ActivityLog, error)
	ListByChildAndTimeRange(ctx context.Context, childID uuid.UUID, from, to time.Time) ([]domain.ActivityLog, error)
}

type AgeVerificationRepository interface {
	Upsert(ctx context.Context, record *domain.AgeVerificationRecord) error
	GetByChildAndPlatform(ctx context.Context, childID uuid.UUID, platformID string) (*domain.AgeVerificationRecord, error)
	ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.AgeVerificationRecord, error)
}

type PrivacyRequestRepository interface {
	Create(ctx context.Context, req *domain.PrivacyRequest) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.PrivacyRequest, error)
	ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.PrivacyRequest, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
}

type ComplianceAttestationRepository interface {
	Upsert(ctx context.Context, att *domain.ComplianceAttestation) error
	ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.ComplianceAttestation, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
}

type SocialPolicyRepository interface {
	Upsert(ctx context.Context, policy *domain.SocialPolicy) error
	ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.SocialPolicy, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type LocationLogRepository interface {
	Create(ctx context.Context, entry *domain.LocationLog) error
	GetLatest(ctx context.Context, childID uuid.UUID) (*domain.LocationLog, error)
	ListByChildAndTimeRange(ctx context.Context, childID uuid.UUID, from, to time.Time) ([]domain.LocationLog, error)
}

type PurchaseApprovalRepository interface {
	Create(ctx context.Context, req *domain.PurchaseApproval) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.PurchaseApproval, error)
	ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.PurchaseApproval, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string, resolvedBy *uuid.UUID) error
}

type ContentClassificationRepository interface {
	Upsert(ctx context.Context, c *domain.ContentClassification) error
	GetByContentID(ctx context.Context, contentType, contentID, ratingSystem string) (*domain.ContentClassification, error)
}

// ── Device Sync (Apple On-Device Integration) ───────────────────

type DeviceRegistrationRepository interface {
	Create(ctx context.Context, reg *domain.DeviceRegistration) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.DeviceRegistration, error)
	GetByAPIKeyHash(ctx context.Context, hash string) (*domain.DeviceRegistration, error)
	Update(ctx context.Context, reg *domain.DeviceRegistration) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.DeviceRegistration, error)
	ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.DeviceRegistration, error)
}

type DeviceReportRepository interface {
	Create(ctx context.Context, report *domain.DeviceReport) error
	ListByChild(ctx context.Context, childID uuid.UUID, limit int) ([]domain.DeviceReport, error)
	ListByDevice(ctx context.Context, deviceID uuid.UUID, limit int) ([]domain.DeviceReport, error)
	ListByChildAndTimeRange(ctx context.Context, childID uuid.UUID, from, to time.Time) ([]domain.DeviceReport, error)
}

// ── Developer Portal ─────────────────────────────────────────────

type DeveloperRepository interface {
	// Orgs
	CreateOrg(ctx context.Context, org *domain.DeveloperOrg) error
	GetOrg(ctx context.Context, id uuid.UUID) (*domain.DeveloperOrg, error)
	GetOrgBySlug(ctx context.Context, slug string) (*domain.DeveloperOrg, error)
	ListOrgsByUser(ctx context.Context, userID uuid.UUID) ([]domain.DeveloperOrg, error)
	UpdateOrg(ctx context.Context, org *domain.DeveloperOrg) error
	DeleteOrg(ctx context.Context, id uuid.UUID) error

	// Members
	AddMember(ctx context.Context, member *domain.DeveloperOrgMember) error
	RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error
	ListMembers(ctx context.Context, orgID uuid.UUID) ([]domain.DeveloperOrgMember, error)
	GetMemberRole(ctx context.Context, orgID, userID uuid.UUID) (string, error)

	// API Keys
	CreateKey(ctx context.Context, key *domain.DeveloperAPIKey) error
	GetKeyByHash(ctx context.Context, hash string) (*domain.DeveloperAPIKey, error)
	ListKeysByOrg(ctx context.Context, orgID uuid.UUID) ([]domain.DeveloperAPIKey, error)
	RevokeKey(ctx context.Context, id uuid.UUID) error
	UpdateKeyLastUsed(ctx context.Context, id uuid.UUID, ip string) error

	// Usage
	RecordUsage(ctx context.Context, usage *domain.DeveloperAPIUsage) error
	GetUsageSummary(ctx context.Context, orgID uuid.UUID, from, to time.Time) ([]domain.DeveloperAPIUsage, error)

	// Key Events
	LogKeyEvent(ctx context.Context, event *domain.DeveloperKeyEvent) error
}

// ── Sources API (Parental Control Integrations) ─────────────────

type SourceRepository interface {
	// Sources
	CreateSource(ctx context.Context, src *domain.Source) (*domain.Source, error)
	GetSource(ctx context.Context, id uuid.UUID) (*domain.Source, error)
	GetSourceByChildAndSlug(ctx context.Context, childID uuid.UUID, slug string) (*domain.Source, error)
	ListSourcesByChild(ctx context.Context, childID uuid.UUID) ([]domain.Source, error)
	ListSourcesByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.Source, error)
	UpdateSource(ctx context.Context, src *domain.Source) (*domain.Source, error)
	UpdateSourceStatus(ctx context.Context, id uuid.UUID, status string, errorMsg *string) error
	DeleteSource(ctx context.Context, id uuid.UUID) error

	// Sync Jobs
	CreateSyncJob(ctx context.Context, job *domain.SourceSyncJob) (*domain.SourceSyncJob, error)
	GetSyncJob(ctx context.Context, id uuid.UUID) (*domain.SourceSyncJob, error)
	UpdateSyncJob(ctx context.Context, job *domain.SourceSyncJob) error
	ListSyncJobs(ctx context.Context, sourceID uuid.UUID, limit int) ([]domain.SourceSyncJob, error)

	// Sync Results
	CreateSyncResult(ctx context.Context, result *domain.SourceSyncResult) (*domain.SourceSyncResult, error)
	ListSyncResults(ctx context.Context, jobID uuid.UUID) ([]domain.SourceSyncResult, error)

	// Capabilities
	GetCapabilities(ctx context.Context, sourceSlug string) ([]domain.SourceCapability, error)
	UpsertCapability(ctx context.Context, cap *domain.SourceCapability) error

	// Inbound Events
	CreateInboundEvent(ctx context.Context, event *domain.SourceInboundEvent) (*domain.SourceInboundEvent, error)
	ListUnprocessedEvents(ctx context.Context, sourceID uuid.UUID) ([]domain.SourceInboundEvent, error)
	MarkEventProcessed(ctx context.Context, id uuid.UUID) error
}
