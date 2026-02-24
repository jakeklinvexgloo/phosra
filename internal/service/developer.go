package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

var (
	ErrOrgNotFound         = errors.New("developer org not found")
	ErrKeyNotFound         = errors.New("API key not found")
	ErrInvalidScope        = errors.New("invalid scope requested")
	ErrInvalidEnvironment  = errors.New("environment must be 'live' or 'test'")
	ErrNotOrgMember        = errors.New("not a member of this organization")
	ErrInsufficientOrgRole = errors.New("insufficient role for this action")
)

// slugRegexp strips non-alphanumeric/hyphen/space chars.
var slugRegexp = regexp.MustCompile(`[^a-z0-9\s-]`)
var multiHyphenRegexp = regexp.MustCompile(`-{2,}`)

// validScopes is the known set of API scopes.
var validScopes = map[string]bool{
	"read:families":     true,
	"write:families":    true,
	"read:children":     true,
	"write:children":    true,
	"read:policies":     true,
	"write:policies":    true,
	"read:enforcement":  true,
	"write:enforcement": true,
	"read:devices":      true,
	"write:devices":     true,
	"read:webhooks":     true,
	"write:webhooks":    true,
	"read:ratings":      true,
	"read:platforms":    true,
}

// developerRepo defines the repository interface for the developer portal.
type developerRepo interface {
	CreateOrg(ctx context.Context, org *domain.DeveloperOrg) error
	GetOrg(ctx context.Context, id uuid.UUID) (*domain.DeveloperOrg, error)
	GetOrgBySlug(ctx context.Context, slug string) (*domain.DeveloperOrg, error)
	ListOrgsByUser(ctx context.Context, userID uuid.UUID) ([]domain.DeveloperOrg, error)
	UpdateOrg(ctx context.Context, org *domain.DeveloperOrg) error
	DeleteOrg(ctx context.Context, id uuid.UUID) error
	AddMember(ctx context.Context, member *domain.DeveloperOrgMember) error
	RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error
	ListMembers(ctx context.Context, orgID uuid.UUID) ([]domain.DeveloperOrgMember, error)
	GetMemberRole(ctx context.Context, orgID, userID uuid.UUID) (string, error)
	CreateKey(ctx context.Context, key *domain.DeveloperAPIKey) error
	GetKeyByHash(ctx context.Context, hash string) (*domain.DeveloperAPIKey, error)
	ListKeysByOrg(ctx context.Context, orgID uuid.UUID) ([]domain.DeveloperAPIKey, error)
	RevokeKey(ctx context.Context, id uuid.UUID) error
	UpdateKeyLastUsed(ctx context.Context, id uuid.UUID, ip string) error
	RecordUsage(ctx context.Context, usage *domain.DeveloperAPIUsage) error
	GetUsageSummary(ctx context.Context, orgID uuid.UUID, from, to time.Time) ([]domain.DeveloperAPIUsage, error)
	LogKeyEvent(ctx context.Context, event *domain.DeveloperKeyEvent) error
}

// DeveloperService handles developer portal business logic.
type DeveloperService struct {
	repo developerRepo
}

// NewDeveloperService creates a new DeveloperService.
func NewDeveloperService(repo developerRepo) *DeveloperService {
	return &DeveloperService{repo: repo}
}

// CreateOrg creates a new developer organization and adds the user as owner.
func (s *DeveloperService) CreateOrg(ctx context.Context, userID uuid.UUID, name, description, websiteURL string) (*domain.DeveloperOrg, error) {
	slug := generateSlug(name)

	org := &domain.DeveloperOrg{
		ID:           uuid.New(),
		Name:         name,
		Slug:         slug,
		Description:  description,
		WebsiteURL:   websiteURL,
		OwnerUserID:  userID,
		Tier:         domain.DeveloperTierFree,
		RateLimitRPM: domain.DefaultFreeRateLimitRPM,
	}

	if err := s.repo.CreateOrg(ctx, org); err != nil {
		return nil, fmt.Errorf("create org: %w", err)
	}

	// Add the creator as owner
	member := &domain.DeveloperOrgMember{
		ID:     uuid.New(),
		OrgID:  org.ID,
		UserID: userID,
		Role:   domain.DeveloperRoleOwner,
	}
	if err := s.repo.AddMember(ctx, member); err != nil {
		return nil, fmt.Errorf("add owner member: %w", err)
	}

	return org, nil
}

// GetOrg retrieves a developer organization by ID.
func (s *DeveloperService) GetOrg(ctx context.Context, orgID uuid.UUID) (*domain.DeveloperOrg, error) {
	org, err := s.repo.GetOrg(ctx, orgID)
	if err != nil {
		return nil, fmt.Errorf("get org: %w", err)
	}
	if org == nil {
		return nil, ErrOrgNotFound
	}
	return org, nil
}

// ListOrgs lists all organizations for a user.
func (s *DeveloperService) ListOrgs(ctx context.Context, userID uuid.UUID) ([]domain.DeveloperOrg, error) {
	orgs, err := s.repo.ListOrgsByUser(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("list orgs: %w", err)
	}
	return orgs, nil
}

// UpdateOrg updates an organization's details.
func (s *DeveloperService) UpdateOrg(ctx context.Context, orgID uuid.UUID, name, description, websiteURL string) (*domain.DeveloperOrg, error) {
	org, err := s.repo.GetOrg(ctx, orgID)
	if err != nil {
		return nil, fmt.Errorf("get org: %w", err)
	}
	if org == nil {
		return nil, ErrOrgNotFound
	}

	if name != "" {
		org.Name = name
		org.Slug = generateSlug(name)
	}
	if description != "" {
		org.Description = description
	}
	if websiteURL != "" {
		org.WebsiteURL = websiteURL
	}
	org.UpdatedAt = time.Now()

	if err := s.repo.UpdateOrg(ctx, org); err != nil {
		return nil, fmt.Errorf("update org: %w", err)
	}
	return org, nil
}

// DeleteOrg deletes an organization.
func (s *DeveloperService) DeleteOrg(ctx context.Context, orgID uuid.UUID) error {
	org, err := s.repo.GetOrg(ctx, orgID)
	if err != nil {
		return fmt.Errorf("get org: %w", err)
	}
	if org == nil {
		return ErrOrgNotFound
	}
	return s.repo.DeleteOrg(ctx, orgID)
}

// ListMembers lists all members of an organization.
func (s *DeveloperService) ListMembers(ctx context.Context, orgID uuid.UUID) ([]domain.DeveloperOrgMember, error) {
	members, err := s.repo.ListMembers(ctx, orgID)
	if err != nil {
		return nil, fmt.Errorf("list members: %w", err)
	}
	return members, nil
}

// CreateAPIKey generates a new API key for an organization.
// Returns the key struct and the raw key string (shown once to the user).
func (s *DeveloperService) CreateAPIKey(ctx context.Context, orgID, userID uuid.UUID, name string, environment domain.DeveloperEnv, scopes []string) (*domain.DeveloperAPIKey, string, error) {
	if environment != domain.DeveloperEnvLive && environment != domain.DeveloperEnvTest {
		return nil, "", ErrInvalidEnvironment
	}

	if err := s.ValidateScopes(scopes); err != nil {
		return nil, "", err
	}

	// Generate 32-byte random key
	keyBytes := make([]byte, 32)
	if _, err := rand.Read(keyBytes); err != nil {
		return nil, "", fmt.Errorf("generate random key: %w", err)
	}
	rawHex := hex.EncodeToString(keyBytes)

	// Add environment-based prefix
	var prefix string
	if environment == domain.DeveloperEnvLive {
		prefix = "phosra_live_"
	} else {
		prefix = "phosra_test_"
	}
	rawKey := prefix + rawHex

	// Hash the key for storage
	hash := sha256.Sum256([]byte(rawKey))
	keyHash := hex.EncodeToString(hash[:])

	// Store first 8 chars as prefix for identification
	keyPrefix := rawKey[:len(prefix)+8]

	key := &domain.DeveloperAPIKey{
		ID:          uuid.New(),
		OrgID:       orgID,
		Name:        name,
		KeyHash:     keyHash,
		KeyPrefix:   keyPrefix,
		Environment: environment,
		Scopes:      scopes,
		CreatedBy:   userID,
	}

	if err := s.repo.CreateKey(ctx, key); err != nil {
		return nil, "", fmt.Errorf("create key: %w", err)
	}

	// Log the creation event
	event := &domain.DeveloperKeyEvent{
		ID:          uuid.New(),
		KeyID:       key.ID,
		EventType:   domain.KeyEventCreated,
		ActorUserID: &userID,
		Metadata:    json.RawMessage("{}"),
	}
	if err := s.repo.LogKeyEvent(ctx, event); err != nil {
		// Non-fatal: key was created successfully, just log event failed
		_ = err
	}

	return key, rawKey, nil
}

// ListAPIKeys lists all API keys for an organization (without raw keys).
func (s *DeveloperService) ListAPIKeys(ctx context.Context, orgID uuid.UUID) ([]domain.DeveloperAPIKey, error) {
	keys, err := s.repo.ListKeysByOrg(ctx, orgID)
	if err != nil {
		return nil, fmt.Errorf("list keys: %w", err)
	}
	return keys, nil
}

// RevokeKey revokes an API key and logs the event.
func (s *DeveloperService) RevokeKey(ctx context.Context, orgID, keyID, actorUserID uuid.UUID) error {
	if err := s.repo.RevokeKey(ctx, keyID); err != nil {
		return fmt.Errorf("revoke key: %w", err)
	}

	event := &domain.DeveloperKeyEvent{
		ID:          uuid.New(),
		KeyID:       keyID,
		EventType:   domain.KeyEventRevoked,
		ActorUserID: &actorUserID,
		Metadata:    json.RawMessage("{}"),
	}
	if err := s.repo.LogKeyEvent(ctx, event); err != nil {
		_ = err
	}

	return nil
}

// RegenerateKey revokes the old key and creates a new one with the same name, environment, and scopes.
func (s *DeveloperService) RegenerateKey(ctx context.Context, orgID, keyID, actorUserID uuid.UUID) (*domain.DeveloperAPIKey, string, error) {
	// Get the existing key's metadata
	keys, err := s.repo.ListKeysByOrg(ctx, orgID)
	if err != nil {
		return nil, "", fmt.Errorf("list keys: %w", err)
	}

	var oldKey *domain.DeveloperAPIKey
	for i := range keys {
		if keys[i].ID == keyID {
			oldKey = &keys[i]
			break
		}
	}
	if oldKey == nil {
		return nil, "", ErrKeyNotFound
	}

	// Revoke the old key
	if err := s.RevokeKey(ctx, orgID, keyID, actorUserID); err != nil {
		return nil, "", fmt.Errorf("revoke old key: %w", err)
	}

	// Create new key with the same parameters
	newKey, rawKey, err := s.CreateAPIKey(ctx, orgID, actorUserID, oldKey.Name, oldKey.Environment, oldKey.Scopes)
	if err != nil {
		return nil, "", fmt.Errorf("create replacement key: %w", err)
	}

	// Log regeneration event
	metadata := fmt.Sprintf(`{"previous_key_id":"%s"}`, keyID)
	event := &domain.DeveloperKeyEvent{
		ID:          uuid.New(),
		KeyID:       newKey.ID,
		EventType:   domain.KeyEventRegenerated,
		ActorUserID: &actorUserID,
		Metadata:    json.RawMessage(metadata),
	}
	if err := s.repo.LogKeyEvent(ctx, event); err != nil {
		_ = err
	}

	return newKey, rawKey, nil
}

// GetUsage retrieves usage data for an organization over the last N days.
func (s *DeveloperService) GetUsage(ctx context.Context, orgID uuid.UUID, days int) ([]domain.DeveloperAPIUsage, error) {
	to := time.Now()
	from := to.AddDate(0, 0, -days)
	usage, err := s.repo.GetUsageSummary(ctx, orgID, from, to)
	if err != nil {
		return nil, fmt.Errorf("get usage: %w", err)
	}
	return usage, nil
}

// ValidateScopes checks that all requested scopes are in the known set.
func (s *DeveloperService) ValidateScopes(requested []string) error {
	for _, scope := range requested {
		if !validScopes[scope] {
			return fmt.Errorf("%w: %s", ErrInvalidScope, scope)
		}
	}
	return nil
}

// CheckOrgAccess verifies the user is a member of the org and returns the role.
func (s *DeveloperService) CheckOrgAccess(ctx context.Context, orgID, userID uuid.UUID) (string, error) {
	role, err := s.repo.GetMemberRole(ctx, orgID, userID)
	if err != nil {
		return "", ErrNotOrgMember
	}
	if role == "" {
		return "", ErrNotOrgMember
	}
	return role, nil
}

// CheckOrgAdmin verifies the user has admin or owner role in the org.
func (s *DeveloperService) CheckOrgAdmin(ctx context.Context, orgID, userID uuid.UUID) error {
	role, err := s.CheckOrgAccess(ctx, orgID, userID)
	if err != nil {
		return err
	}
	if role != "owner" && role != "admin" {
		return ErrInsufficientOrgRole
	}
	return nil
}

// generateSlug converts a name to a URL-friendly slug with a random suffix to prevent collisions.
func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = slugRegexp.ReplaceAllString(slug, "")
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = multiHyphenRegexp.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")

	// Append a random 4-char hex suffix to prevent collisions
	suffix := make([]byte, 2)
	if _, err := rand.Read(suffix); err == nil {
		slug = slug + "-" + hex.EncodeToString(suffix)
	}

	return slug
}
