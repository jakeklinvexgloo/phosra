package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type ChildRepo struct {
	*DB
}

func NewChildRepo(db *DB) *ChildRepo {
	return &ChildRepo{DB: db}
}

func (r *ChildRepo) Create(ctx context.Context, child *domain.Child) error {
	if child.ID == uuid.Nil {
		child.ID = uuid.New()
	}
	now := time.Now()
	child.CreatedAt = now
	child.UpdatedAt = now

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO children (id, family_id, name, birth_date, avatar_url, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		child.ID, child.FamilyID, child.Name, child.BirthDate, child.AvatarURL, child.CreatedAt, child.UpdatedAt,
	)
	return err
}

func (r *ChildRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Child, error) {
	var c domain.Child
	err := r.Pool.QueryRow(ctx,
		`SELECT id, family_id, name, birth_date, avatar_url, created_at, updated_at
		 FROM children WHERE id = $1`, id,
	).Scan(&c.ID, &c.FamilyID, &c.Name, &c.BirthDate, &c.AvatarURL, &c.CreatedAt, &c.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ChildRepo) Update(ctx context.Context, child *domain.Child) error {
	child.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE children SET name = $1, birth_date = $2, avatar_url = $3, updated_at = $4
		 WHERE id = $5`,
		child.Name, child.BirthDate, child.AvatarURL, child.UpdatedAt, child.ID,
	)
	return err
}

func (r *ChildRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM children WHERE id = $1`, id,
	)
	return err
}

func (r *ChildRepo) ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.Child, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, family_id, name, birth_date, avatar_url, created_at, updated_at
		 FROM children WHERE family_id = $1
		 ORDER BY created_at`, familyID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var children []domain.Child
	for rows.Next() {
		var c domain.Child
		if err := rows.Scan(&c.ID, &c.FamilyID, &c.Name, &c.BirthDate, &c.AvatarURL, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		children = append(children, c)
	}
	return children, rows.Err()
}
