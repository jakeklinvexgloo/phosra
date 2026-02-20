package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type UserRepo struct {
	*DB
}

func NewUserRepo(db *DB) *UserRepo {
	return &UserRepo{DB: db}
}

func (r *UserRepo) Create(ctx context.Context, user *domain.User) error {
	if user.ID == uuid.Nil {
		user.ID = uuid.New()
	}
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO users (id, external_auth_id, email, password_hash, name, is_admin, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		user.ID, user.ExternalAuthID, user.Email, user.PasswordHash, user.Name, user.IsAdmin, user.CreatedAt, user.UpdatedAt,
	)
	return err
}

func (r *UserRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	var u domain.User
	err := r.Pool.QueryRow(ctx,
		`SELECT id, external_auth_id, email, password_hash, name, is_admin, created_at, updated_at, deleted_at
		 FROM users WHERE id = $1 AND deleted_at IS NULL`, id,
	).Scan(&u.ID, &u.ExternalAuthID, &u.Email, &u.PasswordHash, &u.Name, &u.IsAdmin, &u.CreatedAt, &u.UpdatedAt, &u.DeletedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var u domain.User
	err := r.Pool.QueryRow(ctx,
		`SELECT id, external_auth_id, email, password_hash, name, is_admin, created_at, updated_at, deleted_at
		 FROM users WHERE email = $1 AND deleted_at IS NULL`, email,
	).Scan(&u.ID, &u.ExternalAuthID, &u.Email, &u.PasswordHash, &u.Name, &u.IsAdmin, &u.CreatedAt, &u.UpdatedAt, &u.DeletedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetByExternalAuthID(ctx context.Context, externalAuthID string) (*domain.User, error) {
	var u domain.User
	err := r.Pool.QueryRow(ctx,
		`SELECT id, external_auth_id, email, password_hash, name, is_admin, created_at, updated_at, deleted_at
		 FROM users WHERE external_auth_id = $1 AND deleted_at IS NULL`, externalAuthID,
	).Scan(&u.ID, &u.ExternalAuthID, &u.Email, &u.PasswordHash, &u.Name, &u.IsAdmin, &u.CreatedAt, &u.UpdatedAt, &u.DeletedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) Update(ctx context.Context, user *domain.User) error {
	user.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE users SET email = $1, password_hash = $2, name = $3, is_admin = $4, updated_at = $5
		 WHERE id = $6 AND deleted_at IS NULL`,
		user.Email, user.PasswordHash, user.Name, user.IsAdmin, user.UpdatedAt, user.ID,
	)
	return err
}

func (r *UserRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE users SET deleted_at = $1 WHERE id = $2 AND deleted_at IS NULL`,
		time.Now(), id,
	)
	return err
}
