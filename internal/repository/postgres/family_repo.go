package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type FamilyRepo struct {
	*DB
}

func NewFamilyRepo(db *DB) *FamilyRepo {
	return &FamilyRepo{DB: db}
}

func (r *FamilyRepo) Create(ctx context.Context, family *domain.Family) error {
	if family.ID == uuid.Nil {
		family.ID = uuid.New()
	}
	now := time.Now()
	family.CreatedAt = now
	family.UpdatedAt = now

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO families (id, name, created_at, updated_at)
		 VALUES ($1, $2, $3, $4)`,
		family.ID, family.Name, family.CreatedAt, family.UpdatedAt,
	)
	return err
}

func (r *FamilyRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Family, error) {
	var f domain.Family
	err := r.Pool.QueryRow(ctx,
		`SELECT id, name, created_at, updated_at FROM families WHERE id = $1`, id,
	).Scan(&f.ID, &f.Name, &f.CreatedAt, &f.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &f, nil
}

func (r *FamilyRepo) Update(ctx context.Context, family *domain.Family) error {
	family.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE families SET name = $1, updated_at = $2 WHERE id = $3`,
		family.Name, family.UpdatedAt, family.ID,
	)
	return err
}

func (r *FamilyRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM families WHERE id = $1`, id,
	)
	return err
}

func (r *FamilyRepo) ListByUser(ctx context.Context, userID uuid.UUID) ([]domain.Family, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT f.id, f.name, f.created_at, f.updated_at
		 FROM families f
		 INNER JOIN family_members fm ON fm.family_id = f.id
		 WHERE fm.user_id = $1
		 ORDER BY f.created_at`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var families []domain.Family
	for rows.Next() {
		var f domain.Family
		if err := rows.Scan(&f.ID, &f.Name, &f.CreatedAt, &f.UpdatedAt); err != nil {
			return nil, err
		}
		families = append(families, f)
	}
	return families, rows.Err()
}
