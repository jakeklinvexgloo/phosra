package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type RefreshTokenRepo struct {
	*DB
}

func NewRefreshTokenRepo(db *DB) *RefreshTokenRepo {
	return &RefreshTokenRepo{DB: db}
}

func (r *RefreshTokenRepo) Create(ctx context.Context, token *domain.RefreshToken) error {
	if token.ID == uuid.Nil {
		token.ID = uuid.New()
	}
	token.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at, revoked)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		token.ID, token.UserID, token.TokenHash, token.ExpiresAt, token.CreatedAt, token.Revoked,
	)
	return err
}

func (r *RefreshTokenRepo) GetByHash(ctx context.Context, hash string) (*domain.RefreshToken, error) {
	var t domain.RefreshToken
	err := r.Pool.QueryRow(ctx,
		`SELECT id, user_id, token_hash, expires_at, created_at, revoked
		 FROM refresh_tokens WHERE token_hash = $1`, hash,
	).Scan(&t.ID, &t.UserID, &t.TokenHash, &t.ExpiresAt, &t.CreatedAt, &t.Revoked)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *RefreshTokenRepo) RevokeByUserID(ctx context.Context, userID uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND revoked = false`,
		userID,
	)
	return err
}

func (r *RefreshTokenRepo) Revoke(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE refresh_tokens SET revoked = true WHERE id = $1`,
		id,
	)
	return err
}

func (r *RefreshTokenRepo) DeleteExpired(ctx context.Context) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM refresh_tokens WHERE expires_at < $1`,
		time.Now(),
	)
	return err
}
