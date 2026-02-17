package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type PolicyRepo struct {
	*DB
}

func NewPolicyRepo(db *DB) *PolicyRepo {
	return &PolicyRepo{DB: db}
}

func (r *PolicyRepo) Create(ctx context.Context, policy *domain.ChildPolicy) error {
	if policy.ID == uuid.Nil {
		policy.ID = uuid.New()
	}
	now := time.Now()
	policy.CreatedAt = now
	policy.UpdatedAt = now

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO child_policies (id, child_id, name, status, priority, version, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		policy.ID, policy.ChildID, policy.Name, policy.Status, policy.Priority, 1, policy.CreatedAt, policy.UpdatedAt,
	)
	return err
}

func (r *PolicyRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.ChildPolicy, error) {
	var p domain.ChildPolicy
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, name, status, priority, version, created_at, updated_at
		 FROM child_policies WHERE id = $1`, id,
	).Scan(&p.ID, &p.ChildID, &p.Name, &p.Status, &p.Priority, &p.Version, &p.CreatedAt, &p.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PolicyRepo) Update(ctx context.Context, policy *domain.ChildPolicy) error {
	policy.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE child_policies SET name = $1, status = $2, priority = $3, updated_at = $4
		 WHERE id = $5`,
		policy.Name, policy.Status, policy.Priority, policy.UpdatedAt, policy.ID,
	)
	return err
}

func (r *PolicyRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM child_policies WHERE id = $1`, id,
	)
	return err
}

func (r *PolicyRepo) ListByChild(ctx context.Context, childID uuid.UUID) ([]domain.ChildPolicy, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, name, status, priority, version, created_at, updated_at
		 FROM child_policies WHERE child_id = $1
		 ORDER BY priority, created_at`, childID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var policies []domain.ChildPolicy
	for rows.Next() {
		var p domain.ChildPolicy
		if err := rows.Scan(&p.ID, &p.ChildID, &p.Name, &p.Status, &p.Priority, &p.Version, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		policies = append(policies, p)
	}
	return policies, rows.Err()
}
