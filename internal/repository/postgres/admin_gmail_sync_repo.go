package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type AdminGmailSyncRepo struct {
	*DB
}

func NewAdminGmailSyncRepo(db *DB) *AdminGmailSyncRepo {
	return &AdminGmailSyncRepo{DB: db}
}

// Get returns the sync state for the given account key, or nil if no row exists.
func (r *AdminGmailSyncRepo) Get(ctx context.Context, accountKey string) (*domain.GmailSyncState, error) {
	var s domain.GmailSyncState
	err := r.Pool.QueryRow(ctx,
		`SELECT account_key, last_synced_at, last_message_epoch_ms, messages_imported, contacts_created, updated_at
		 FROM admin_gmail_sync_state WHERE account_key = $1`, accountKey,
	).Scan(&s.AccountKey, &s.LastSyncedAt, &s.LastMessageEpochMs, &s.MessagesImported, &s.ContactsCreated, &s.UpdatedAt)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// Upsert inserts or updates the sync state for the given account key.
func (r *AdminGmailSyncRepo) Upsert(ctx context.Context, state *domain.GmailSyncState) error {
	state.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO admin_gmail_sync_state (account_key, last_synced_at, last_message_epoch_ms, messages_imported, contacts_created, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 ON CONFLICT (account_key) DO UPDATE SET
		   last_synced_at = EXCLUDED.last_synced_at,
		   last_message_epoch_ms = EXCLUDED.last_message_epoch_ms,
		   messages_imported = EXCLUDED.messages_imported,
		   contacts_created = EXCLUDED.contacts_created,
		   updated_at = EXCLUDED.updated_at`,
		state.AccountKey, state.LastSyncedAt, state.LastMessageEpochMs, state.MessagesImported, state.ContactsCreated, state.UpdatedAt,
	)
	return err
}
