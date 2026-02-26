package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type AdminPersonaRepo struct {
	*DB
}

func NewAdminPersonaRepo(db *DB) *AdminPersonaRepo {
	return &AdminPersonaRepo{DB: db}
}

func (r *AdminPersonaRepo) List(ctx context.Context) ([]domain.PersonaAccountMapping, error) {
	rows, err := r.Pool.Query(ctx, `
		SELECT persona_key, google_account_key, calendar_account_key, display_name, sender_email, created_at, updated_at
		FROM admin_outreach_persona_accounts
		ORDER BY persona_key
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mappings []domain.PersonaAccountMapping
	for rows.Next() {
		var m domain.PersonaAccountMapping
		if err := rows.Scan(&m.PersonaKey, &m.GoogleAccountKey, &m.CalendarAccountKey, &m.DisplayName, &m.SenderEmail, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, err
		}
		mappings = append(mappings, m)
	}
	return mappings, rows.Err()
}

func (r *AdminPersonaRepo) Get(ctx context.Context, personaKey string) (*domain.PersonaAccountMapping, error) {
	var m domain.PersonaAccountMapping
	err := r.Pool.QueryRow(ctx, `
		SELECT persona_key, google_account_key, calendar_account_key, display_name, sender_email, created_at, updated_at
		FROM admin_outreach_persona_accounts
		WHERE persona_key = $1
	`, personaKey).Scan(&m.PersonaKey, &m.GoogleAccountKey, &m.CalendarAccountKey, &m.DisplayName, &m.SenderEmail, &m.CreatedAt, &m.UpdatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *AdminPersonaRepo) Upsert(ctx context.Context, m *domain.PersonaAccountMapping) error {
	now := time.Now()
	_, err := r.Pool.Exec(ctx, `
		INSERT INTO admin_outreach_persona_accounts (persona_key, google_account_key, calendar_account_key, display_name, sender_email, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (persona_key) DO UPDATE SET
			google_account_key = EXCLUDED.google_account_key,
			calendar_account_key = EXCLUDED.calendar_account_key,
			display_name = EXCLUDED.display_name,
			sender_email = EXCLUDED.sender_email,
			updated_at = EXCLUDED.updated_at
	`, m.PersonaKey, m.GoogleAccountKey, m.CalendarAccountKey, m.DisplayName, m.SenderEmail, now, now)
	return err
}
