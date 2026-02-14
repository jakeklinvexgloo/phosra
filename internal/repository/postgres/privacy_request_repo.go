package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

type PrivacyRequestRepo struct{ *DB }

func NewPrivacyRequestRepo(db *DB) *PrivacyRequestRepo {
	return &PrivacyRequestRepo{DB: db}
}

func (r *PrivacyRequestRepo) Create(ctx context.Context, req *domain.PrivacyRequest) error {
	if req.ID == uuid.Nil {
		req.ID = uuid.New()
	}
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO privacy_requests (id, child_id, family_id, request_type, platform_id, status, config, submitted_at, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
		req.ID, req.ChildID, req.FamilyID, req.RequestType, req.PlatformID, req.Status, req.Config, req.SubmittedAt,
	)
	return err
}

func (r *PrivacyRequestRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.PrivacyRequest, error) {
	var req domain.PrivacyRequest
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, family_id, request_type, platform_id, status, config, submitted_at, completed_at, created_at
		 FROM privacy_requests WHERE id = $1`, id,
	).Scan(&req.ID, &req.ChildID, &req.FamilyID, &req.RequestType, &req.PlatformID, &req.Status, &req.Config, &req.SubmittedAt, &req.CompletedAt, &req.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &req, nil
}

func (r *PrivacyRequestRepo) ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.PrivacyRequest, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, family_id, request_type, platform_id, status, config, submitted_at, completed_at, created_at
		 FROM privacy_requests WHERE child_id = $1 ORDER BY created_at DESC`, childID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []domain.PrivacyRequest
	for rows.Next() {
		var req domain.PrivacyRequest
		if err := rows.Scan(&req.ID, &req.ChildID, &req.FamilyID, &req.RequestType, &req.PlatformID, &req.Status, &req.Config, &req.SubmittedAt, &req.CompletedAt, &req.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, req)
	}
	return items, rows.Err()
}

func (r *PrivacyRequestRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	_, err := r.Pool.Exec(ctx, `UPDATE privacy_requests SET status = $1, completed_at = NOW() WHERE id = $2`, status, id)
	return err
}
