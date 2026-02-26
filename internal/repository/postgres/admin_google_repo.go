package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/google"
)

// AdminGoogleRepo manages the admin_google_tokens table (multi-account).
type AdminGoogleRepo struct {
	*DB
}

func NewAdminGoogleRepo(db *DB) *AdminGoogleRepo {
	return &AdminGoogleRepo{DB: db}
}

// GetTokens returns the stored Google OAuth tokens for the given account key, or nil if none exist.
func (r *AdminGoogleRepo) GetTokens(ctx context.Context, accountKey string) (*google.GoogleTokens, error) {
	var t google.GoogleTokens
	err := r.Pool.QueryRow(ctx, `
		SELECT account_key, google_email, access_token_encrypted, refresh_token_encrypted,
		       token_expiry, scopes, created_at, updated_at
		FROM admin_google_tokens
		WHERE account_key = $1
	`, accountKey).Scan(
		&t.AccountKey,
		&t.GoogleEmail,
		&t.AccessTokenEncrypted,
		&t.RefreshTokenEncrypted,
		&t.TokenExpiry,
		&t.Scopes,
		&t.CreatedAt,
		&t.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

// UpsertTokens inserts or updates a Google token record by account key.
func (r *AdminGoogleRepo) UpsertTokens(ctx context.Context, tokens *google.GoogleTokens) error {
	_, err := r.Pool.Exec(ctx, `
		INSERT INTO admin_google_tokens (account_key, google_email, access_token_encrypted, refresh_token_encrypted, token_expiry, scopes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (account_key) DO UPDATE SET
			google_email = EXCLUDED.google_email,
			access_token_encrypted = EXCLUDED.access_token_encrypted,
			refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
			token_expiry = EXCLUDED.token_expiry,
			scopes = EXCLUDED.scopes,
			updated_at = EXCLUDED.updated_at
	`,
		tokens.AccountKey,
		tokens.GoogleEmail,
		tokens.AccessTokenEncrypted,
		tokens.RefreshTokenEncrypted,
		tokens.TokenExpiry,
		tokens.Scopes,
		tokens.CreatedAt,
		time.Now(),
	)
	return err
}

// DeleteTokens removes the Google token record for the given account key (disconnect).
func (r *AdminGoogleRepo) DeleteTokens(ctx context.Context, accountKey string) error {
	_, err := r.Pool.Exec(ctx, `DELETE FROM admin_google_tokens WHERE account_key = $1`, accountKey)
	return err
}

// ListAllAccounts returns all stored Google account keys and emails.
func (r *AdminGoogleRepo) ListAllAccounts(ctx context.Context) ([]struct {
	AccountKey  string
	GoogleEmail string
}, error) {
	rows, err := r.Pool.Query(ctx, `SELECT account_key, google_email FROM admin_google_tokens ORDER BY account_key`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var accounts []struct {
		AccountKey  string
		GoogleEmail string
	}
	for rows.Next() {
		var a struct {
			AccountKey  string
			GoogleEmail string
		}
		if err := rows.Scan(&a.AccountKey, &a.GoogleEmail); err != nil {
			return nil, err
		}
		accounts = append(accounts, a)
	}
	return accounts, rows.Err()
}
