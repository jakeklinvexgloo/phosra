package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

type SocialPolicyRepo struct{ *DB }

func NewSocialPolicyRepo(db *DB) *SocialPolicyRepo {
	return &SocialPolicyRepo{DB: db}
}

func (r *SocialPolicyRepo) Upsert(ctx context.Context, p *domain.SocialPolicy) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO social_policies (id, child_id, platform_id, policy_type, config, active, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		 ON CONFLICT (child_id, platform_id, policy_type)
		 DO UPDATE SET config = EXCLUDED.config, active = EXCLUDED.active, updated_at = NOW()`,
		p.ID, p.ChildID, p.PlatformID, p.PolicyType, p.Config, p.Active,
	)
	return err
}

func (r *SocialPolicyRepo) ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.SocialPolicy, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, platform_id, policy_type, config, active, created_at, updated_at
		 FROM social_policies WHERE child_id = $1 ORDER BY created_at`, childID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []domain.SocialPolicy
	for rows.Next() {
		var p domain.SocialPolicy
		if err := rows.Scan(&p.ID, &p.ChildID, &p.PlatformID, &p.PolicyType, &p.Config, &p.Active, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		items = append(items, p)
	}
	return items, rows.Err()
}

func (r *SocialPolicyRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx, `DELETE FROM social_policies WHERE id = $1`, id)
	return err
}
