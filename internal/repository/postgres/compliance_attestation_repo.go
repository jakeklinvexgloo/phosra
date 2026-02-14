package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

type ComplianceAttestationRepo struct{ *DB }

func NewComplianceAttestationRepo(db *DB) *ComplianceAttestationRepo {
	return &ComplianceAttestationRepo{DB: db}
}

func (r *ComplianceAttestationRepo) Upsert(ctx context.Context, att *domain.ComplianceAttestation) error {
	if att.ID == uuid.Nil {
		att.ID = uuid.New()
	}
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO compliance_attestations (id, family_id, rule_category, platform_id, status, evidence, attested_at, next_review_at, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		 ON CONFLICT DO NOTHING`,
		att.ID, att.FamilyID, att.RuleCategory, att.PlatformID, att.Status, att.Evidence, att.AttestedAt, att.NextReviewAt,
	)
	return err
}

func (r *ComplianceAttestationRepo) ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.ComplianceAttestation, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, family_id, rule_category, platform_id, status, evidence, attested_at, next_review_at, created_at
		 FROM compliance_attestations WHERE family_id = $1 ORDER BY created_at`, familyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []domain.ComplianceAttestation
	for rows.Next() {
		var att domain.ComplianceAttestation
		if err := rows.Scan(&att.ID, &att.FamilyID, &att.RuleCategory, &att.PlatformID, &att.Status, &att.Evidence, &att.AttestedAt, &att.NextReviewAt, &att.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, att)
	}
	return items, rows.Err()
}

func (r *ComplianceAttestationRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	_, err := r.Pool.Exec(ctx, `UPDATE compliance_attestations SET status = $1 WHERE id = $2`, status, id)
	return err
}
