package postgres

import (
	"context"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

type PurchaseApprovalRepo struct{ *DB }

func NewPurchaseApprovalRepo(db *DB) *PurchaseApprovalRepo {
	return &PurchaseApprovalRepo{DB: db}
}

func (r *PurchaseApprovalRepo) Create(ctx context.Context, req *domain.PurchaseApproval) error {
	if req.ID == uuid.Nil {
		req.ID = uuid.New()
	}
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO purchase_approvals (id, child_id, family_id, platform_id, item_name, amount, currency, status, requested_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
		req.ID, req.ChildID, req.FamilyID, req.PlatformID, req.ItemName, req.Amount, req.Currency, req.Status,
	)
	return err
}

func (r *PurchaseApprovalRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.PurchaseApproval, error) {
	var req domain.PurchaseApproval
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, family_id, platform_id, item_name, amount, currency, status, requested_at, resolved_at, resolved_by
		 FROM purchase_approvals WHERE id = $1`, id,
	).Scan(&req.ID, &req.ChildID, &req.FamilyID, &req.PlatformID, &req.ItemName, &req.Amount, &req.Currency, &req.Status, &req.RequestedAt, &req.ResolvedAt, &req.ResolvedBy)
	if err != nil {
		return nil, err
	}
	return &req, nil
}

func (r *PurchaseApprovalRepo) ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.PurchaseApproval, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, family_id, platform_id, item_name, amount, currency, status, requested_at, resolved_at, resolved_by
		 FROM purchase_approvals WHERE child_id = $1 ORDER BY requested_at DESC`, childID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []domain.PurchaseApproval
	for rows.Next() {
		var req domain.PurchaseApproval
		if err := rows.Scan(&req.ID, &req.ChildID, &req.FamilyID, &req.PlatformID, &req.ItemName, &req.Amount, &req.Currency, &req.Status, &req.RequestedAt, &req.ResolvedAt, &req.ResolvedBy); err != nil {
			return nil, err
		}
		items = append(items, req)
	}
	return items, rows.Err()
}

func (r *PurchaseApprovalRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status string, resolvedBy *uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE purchase_approvals SET status = $1, resolved_at = NOW(), resolved_by = $2 WHERE id = $3`,
		status, resolvedBy, id,
	)
	return err
}
