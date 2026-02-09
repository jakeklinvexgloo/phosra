package repository

import (
	"context"

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
