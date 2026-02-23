package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type DeveloperRepo struct {
	*DB
}

func NewDeveloperRepo(db *DB) *DeveloperRepo {
	return &DeveloperRepo{DB: db}
}

// ── Org CRUD ─────────────────────────────────────────────────────

func (r *DeveloperRepo) CreateOrg(ctx context.Context, org *domain.DeveloperOrg) error {
	if org.ID == uuid.Nil {
		org.ID = uuid.New()
	}
	now := time.Now()
	org.CreatedAt = now
	org.UpdatedAt = now

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO developer_orgs
		 (id, name, slug, description, website_url, logo_url, owner_user_id, tier, rate_limit_rpm, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
		org.ID, org.Name, org.Slug, org.Description, org.WebsiteURL, org.LogoURL,
		org.OwnerUserID, org.Tier, org.RateLimitRPM, org.CreatedAt, org.UpdatedAt,
	)
	return err
}

func (r *DeveloperRepo) GetOrg(ctx context.Context, id uuid.UUID) (*domain.DeveloperOrg, error) {
	var o domain.DeveloperOrg
	err := r.Pool.QueryRow(ctx,
		`SELECT id, name, slug, description, website_url, logo_url, owner_user_id, tier, rate_limit_rpm, created_at, updated_at
		 FROM developer_orgs WHERE id = $1`, id,
	).Scan(
		&o.ID, &o.Name, &o.Slug, &o.Description, &o.WebsiteURL, &o.LogoURL,
		&o.OwnerUserID, &o.Tier, &o.RateLimitRPM, &o.CreatedAt, &o.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &o, nil
}

func (r *DeveloperRepo) GetOrgBySlug(ctx context.Context, slug string) (*domain.DeveloperOrg, error) {
	var o domain.DeveloperOrg
	err := r.Pool.QueryRow(ctx,
		`SELECT id, name, slug, description, website_url, logo_url, owner_user_id, tier, rate_limit_rpm, created_at, updated_at
		 FROM developer_orgs WHERE slug = $1`, slug,
	).Scan(
		&o.ID, &o.Name, &o.Slug, &o.Description, &o.WebsiteURL, &o.LogoURL,
		&o.OwnerUserID, &o.Tier, &o.RateLimitRPM, &o.CreatedAt, &o.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &o, nil
}

func (r *DeveloperRepo) ListOrgsByUser(ctx context.Context, userID uuid.UUID) ([]domain.DeveloperOrg, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT o.id, o.name, o.slug, o.description, o.website_url, o.logo_url,
		        o.owner_user_id, o.tier, o.rate_limit_rpm, o.created_at, o.updated_at
		 FROM developer_orgs o
		 INNER JOIN developer_org_members m ON m.org_id = o.id
		 WHERE m.user_id = $1
		 ORDER BY o.created_at`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orgs []domain.DeveloperOrg
	for rows.Next() {
		var o domain.DeveloperOrg
		if err := rows.Scan(
			&o.ID, &o.Name, &o.Slug, &o.Description, &o.WebsiteURL, &o.LogoURL,
			&o.OwnerUserID, &o.Tier, &o.RateLimitRPM, &o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, err
		}
		orgs = append(orgs, o)
	}
	return orgs, rows.Err()
}

func (r *DeveloperRepo) UpdateOrg(ctx context.Context, org *domain.DeveloperOrg) error {
	org.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE developer_orgs
		 SET name = $1, slug = $2, description = $3, website_url = $4, logo_url = $5,
		     tier = $6, rate_limit_rpm = $7, updated_at = $8
		 WHERE id = $9`,
		org.Name, org.Slug, org.Description, org.WebsiteURL, org.LogoURL,
		org.Tier, org.RateLimitRPM, org.UpdatedAt, org.ID,
	)
	return err
}

func (r *DeveloperRepo) DeleteOrg(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx, `DELETE FROM developer_orgs WHERE id = $1`, id)
	return err
}

// ── Org Members ──────────────────────────────────────────────────

func (r *DeveloperRepo) AddMember(ctx context.Context, member *domain.DeveloperOrgMember) error {
	if member.ID == uuid.Nil {
		member.ID = uuid.New()
	}
	member.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO developer_org_members (id, org_id, user_id, role, created_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		member.ID, member.OrgID, member.UserID, member.Role, member.CreatedAt,
	)
	return err
}

func (r *DeveloperRepo) RemoveMember(ctx context.Context, orgID, userID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM developer_org_members WHERE org_id = $1 AND user_id = $2`,
		orgID, userID,
	)
	return err
}

func (r *DeveloperRepo) ListMembers(ctx context.Context, orgID uuid.UUID) ([]domain.DeveloperOrgMember, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, org_id, user_id, role, created_at
		 FROM developer_org_members WHERE org_id = $1
		 ORDER BY created_at`, orgID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []domain.DeveloperOrgMember
	for rows.Next() {
		var m domain.DeveloperOrgMember
		if err := rows.Scan(&m.ID, &m.OrgID, &m.UserID, &m.Role, &m.CreatedAt); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, rows.Err()
}

func (r *DeveloperRepo) GetMemberRole(ctx context.Context, orgID, userID uuid.UUID) (string, error) {
	var role string
	err := r.Pool.QueryRow(ctx,
		`SELECT role FROM developer_org_members WHERE org_id = $1 AND user_id = $2`,
		orgID, userID,
	).Scan(&role)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return role, nil
}

// ── API Keys ─────────────────────────────────────────────────────

func (r *DeveloperRepo) CreateKey(ctx context.Context, key *domain.DeveloperAPIKey) error {
	if key.ID == uuid.Nil {
		key.ID = uuid.New()
	}
	key.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO developer_api_keys
		 (id, org_id, name, key_prefix, key_hash, environment, scopes, expires_at, created_by, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		key.ID, key.OrgID, key.Name, key.KeyPrefix, key.KeyHash,
		key.Environment, key.Scopes, key.ExpiresAt, key.CreatedBy, key.CreatedAt,
	)
	return err
}

func (r *DeveloperRepo) GetKeyByHash(ctx context.Context, hash string) (*domain.DeveloperAPIKey, error) {
	var k domain.DeveloperAPIKey
	err := r.Pool.QueryRow(ctx,
		`SELECT id, org_id, name, key_prefix, key_hash, environment, scopes,
		        last_used_at, last_used_ip, expires_at, revoked_at, created_by, created_at
		 FROM developer_api_keys
		 WHERE key_hash = $1 AND revoked_at IS NULL`, hash,
	).Scan(
		&k.ID, &k.OrgID, &k.Name, &k.KeyPrefix, &k.KeyHash, &k.Environment, &k.Scopes,
		&k.LastUsedAt, &k.LastUsedIP, &k.ExpiresAt, &k.RevokedAt, &k.CreatedBy, &k.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &k, nil
}

func (r *DeveloperRepo) ListKeysByOrg(ctx context.Context, orgID uuid.UUID) ([]domain.DeveloperAPIKey, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, org_id, name, key_prefix, key_hash, environment, scopes,
		        last_used_at, last_used_ip, expires_at, revoked_at, created_by, created_at
		 FROM developer_api_keys WHERE org_id = $1
		 ORDER BY created_at DESC`, orgID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []domain.DeveloperAPIKey
	for rows.Next() {
		var k domain.DeveloperAPIKey
		if err := rows.Scan(
			&k.ID, &k.OrgID, &k.Name, &k.KeyPrefix, &k.KeyHash, &k.Environment, &k.Scopes,
			&k.LastUsedAt, &k.LastUsedIP, &k.ExpiresAt, &k.RevokedAt, &k.CreatedBy, &k.CreatedAt,
		); err != nil {
			return nil, err
		}
		keys = append(keys, k)
	}
	return keys, rows.Err()
}

func (r *DeveloperRepo) RevokeKey(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE developer_api_keys SET revoked_at = NOW() WHERE id = $1`, id,
	)
	return err
}

func (r *DeveloperRepo) UpdateKeyLastUsed(ctx context.Context, id uuid.UUID, ip string) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE developer_api_keys SET last_used_at = NOW(), last_used_ip = $1 WHERE id = $2`,
		ip, id,
	)
	return err
}

// ── Usage Tracking ───────────────────────────────────────────────

func (r *DeveloperRepo) RecordUsage(ctx context.Context, usage *domain.DeveloperAPIUsage) error {
	if usage.ID == uuid.Nil {
		usage.ID = uuid.New()
	}

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO developer_api_usage
		 (id, key_id, org_id, hour, endpoint, status_2xx, status_4xx, status_5xx, total_requests)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 ON CONFLICT (key_id, hour, endpoint) DO UPDATE SET
		   status_2xx = developer_api_usage.status_2xx + EXCLUDED.status_2xx,
		   status_4xx = developer_api_usage.status_4xx + EXCLUDED.status_4xx,
		   status_5xx = developer_api_usage.status_5xx + EXCLUDED.status_5xx,
		   total_requests = developer_api_usage.total_requests + EXCLUDED.total_requests`,
		usage.ID, usage.KeyID, usage.OrgID, usage.Hour, usage.Endpoint,
		usage.Status2xx, usage.Status4xx, usage.Status5xx, usage.TotalRequests,
	)
	return err
}

func (r *DeveloperRepo) GetUsageSummary(ctx context.Context, orgID uuid.UUID, from, to time.Time) ([]domain.DeveloperAPIUsage, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, key_id, org_id, hour, endpoint, status_2xx, status_4xx, status_5xx, total_requests
		 FROM developer_api_usage
		 WHERE org_id = $1 AND hour >= $2 AND hour < $3
		 ORDER BY hour DESC`, orgID, from, to,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var usages []domain.DeveloperAPIUsage
	for rows.Next() {
		var u domain.DeveloperAPIUsage
		if err := rows.Scan(
			&u.ID, &u.KeyID, &u.OrgID, &u.Hour, &u.Endpoint,
			&u.Status2xx, &u.Status4xx, &u.Status5xx, &u.TotalRequests,
		); err != nil {
			return nil, err
		}
		usages = append(usages, u)
	}
	return usages, rows.Err()
}

// ── Key Events ───────────────────────────────────────────────────

func (r *DeveloperRepo) LogKeyEvent(ctx context.Context, event *domain.DeveloperKeyEvent) error {
	if event.ID == uuid.Nil {
		event.ID = uuid.New()
	}
	event.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO developer_key_events (id, key_id, event_type, actor_user_id, metadata, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		event.ID, event.KeyID, event.EventType, event.ActorUserID, event.Metadata, event.CreatedAt,
	)
	return err
}
