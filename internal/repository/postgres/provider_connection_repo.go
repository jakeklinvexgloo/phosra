package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type ComplianceLinkRepo struct {
	*DB
}

func NewComplianceLinkRepo(db *DB) *ComplianceLinkRepo {
	return &ComplianceLinkRepo{DB: db}
}

func (r *ComplianceLinkRepo) Create(ctx context.Context, link *domain.ComplianceLink) error {
	if link.ID == uuid.Nil {
		link.ID = uuid.New()
	}
	link.VerifiedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO compliance_links (id, family_id, platform_id, status, encrypted_creds, external_id, last_enforcement_at, last_enforcement_status, verified_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		link.ID, link.FamilyID, link.PlatformID, link.Status, link.EncryptedCreds,
		link.ExternalID, link.LastEnforcementAt, link.LastEnforcementStatus, link.VerifiedAt,
	)
	return err
}

func (r *ComplianceLinkRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.ComplianceLink, error) {
	var c domain.ComplianceLink
	err := r.Pool.QueryRow(ctx,
		`SELECT id, family_id, platform_id, status, encrypted_creds, external_id, last_enforcement_at, last_enforcement_status, verified_at
		 FROM compliance_links WHERE id = $1`, id,
	).Scan(&c.ID, &c.FamilyID, &c.PlatformID, &c.Status, &c.EncryptedCreds,
		&c.ExternalID, &c.LastEnforcementAt, &c.LastEnforcementStatus, &c.VerifiedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ComplianceLinkRepo) Update(ctx context.Context, link *domain.ComplianceLink) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE compliance_links SET status = $1, encrypted_creds = $2, external_id = $3, last_enforcement_at = $4, last_enforcement_status = $5
		 WHERE id = $6`,
		link.Status, link.EncryptedCreds, link.ExternalID, link.LastEnforcementAt, link.LastEnforcementStatus, link.ID,
	)
	return err
}

func (r *ComplianceLinkRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM compliance_links WHERE id = $1`, id,
	)
	return err
}

func (r *ComplianceLinkRepo) ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.ComplianceLink, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, family_id, platform_id, status, encrypted_creds, external_id, last_enforcement_at, last_enforcement_status, verified_at
		 FROM compliance_links WHERE family_id = $1
		 ORDER BY verified_at`, familyID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []domain.ComplianceLink
	for rows.Next() {
		var c domain.ComplianceLink
		if err := rows.Scan(&c.ID, &c.FamilyID, &c.PlatformID, &c.Status, &c.EncryptedCreds,
			&c.ExternalID, &c.LastEnforcementAt, &c.LastEnforcementStatus, &c.VerifiedAt); err != nil {
			return nil, err
		}
		links = append(links, c)
	}
	return links, rows.Err()
}

func (r *ComplianceLinkRepo) GetByFamilyAndPlatform(ctx context.Context, familyID uuid.UUID, platformID string) (*domain.ComplianceLink, error) {
	var c domain.ComplianceLink
	err := r.Pool.QueryRow(ctx,
		`SELECT id, family_id, platform_id, status, encrypted_creds, external_id, last_enforcement_at, last_enforcement_status, verified_at
		 FROM compliance_links WHERE family_id = $1 AND platform_id = $2`, familyID, platformID,
	).Scan(&c.ID, &c.FamilyID, &c.PlatformID, &c.Status, &c.EncryptedCreds,
		&c.ExternalID, &c.LastEnforcementAt, &c.LastEnforcementStatus, &c.VerifiedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}
