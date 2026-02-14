package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

type AgeVerificationRepo struct{ *DB }

func NewAgeVerificationRepo(db *DB) *AgeVerificationRepo {
	return &AgeVerificationRepo{DB: db}
}

func (r *AgeVerificationRepo) Upsert(ctx context.Context, rec *domain.AgeVerificationRecord) error {
	if rec.ID == uuid.Nil {
		rec.ID = uuid.New()
	}
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO age_verification_records (id, child_id, verification_type, platform_id, verified, verified_at, config, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
		 ON CONFLICT (child_id, platform_id) WHERE verification_type = $3
		 DO UPDATE SET verified = EXCLUDED.verified, verified_at = EXCLUDED.verified_at, config = EXCLUDED.config`,
		rec.ID, rec.ChildID, rec.VerificationType, rec.PlatformID, rec.Verified, rec.VerifiedAt, rec.Config,
	)
	return err
}

func (r *AgeVerificationRepo) GetByChildAndPlatform(ctx context.Context, childID uuid.UUID, platformID string) (*domain.AgeVerificationRecord, error) {
	var rec domain.AgeVerificationRecord
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, verification_type, platform_id, verified, verified_at, config, created_at
		 FROM age_verification_records WHERE child_id = $1 AND platform_id = $2`,
		childID, platformID,
	).Scan(&rec.ID, &rec.ChildID, &rec.VerificationType, &rec.PlatformID, &rec.Verified, &rec.VerifiedAt, &rec.Config, &rec.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &rec, nil
}

func (r *AgeVerificationRepo) ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.AgeVerificationRecord, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, verification_type, platform_id, verified, verified_at, config, created_at
		 FROM age_verification_records WHERE child_id = $1 ORDER BY created_at`, childID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []domain.AgeVerificationRecord
	for rows.Next() {
		var rec domain.AgeVerificationRecord
		if err := rows.Scan(&rec.ID, &rec.ChildID, &rec.VerificationType, &rec.PlatformID, &rec.Verified, &rec.VerifiedAt, &rec.Config, &rec.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, rec)
	}
	return items, rows.Err()
}
