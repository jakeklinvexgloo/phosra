package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type WebhookRepo struct {
	*DB
}

func NewWebhookRepo(db *DB) *WebhookRepo {
	return &WebhookRepo{DB: db}
}

func (r *WebhookRepo) Create(ctx context.Context, webhook *domain.Webhook) error {
	if webhook.ID == uuid.Nil {
		webhook.ID = uuid.New()
	}
	now := time.Now()
	webhook.CreatedAt = now
	webhook.UpdatedAt = now

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO webhooks (id, family_id, url, secret, events, active, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		webhook.ID, webhook.FamilyID, webhook.URL, webhook.Secret, webhook.Events,
		webhook.Active, webhook.CreatedAt, webhook.UpdatedAt,
	)
	return err
}

func (r *WebhookRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Webhook, error) {
	var w domain.Webhook
	err := r.Pool.QueryRow(ctx,
		`SELECT id, family_id, url, secret, events, active, created_at, updated_at
		 FROM webhooks WHERE id = $1`, id,
	).Scan(&w.ID, &w.FamilyID, &w.URL, &w.Secret, &w.Events, &w.Active, &w.CreatedAt, &w.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &w, nil
}

func (r *WebhookRepo) Update(ctx context.Context, webhook *domain.Webhook) error {
	webhook.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE webhooks SET url = $1, secret = $2, events = $3, active = $4, updated_at = $5
		 WHERE id = $6`,
		webhook.URL, webhook.Secret, webhook.Events, webhook.Active, webhook.UpdatedAt, webhook.ID,
	)
	return err
}

func (r *WebhookRepo) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`DELETE FROM webhooks WHERE id = $1`, id,
	)
	return err
}

func (r *WebhookRepo) ListByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.Webhook, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, family_id, url, secret, events, active, created_at, updated_at
		 FROM webhooks WHERE family_id = $1
		 ORDER BY created_at`, familyID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var webhooks []domain.Webhook
	for rows.Next() {
		var w domain.Webhook
		if err := rows.Scan(&w.ID, &w.FamilyID, &w.URL, &w.Secret, &w.Events, &w.Active, &w.CreatedAt, &w.UpdatedAt); err != nil {
			return nil, err
		}
		webhooks = append(webhooks, w)
	}
	return webhooks, rows.Err()
}

func (r *WebhookRepo) ListActiveByEvent(ctx context.Context, familyID uuid.UUID, event string) ([]domain.Webhook, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, family_id, url, secret, events, active, created_at, updated_at
		 FROM webhooks WHERE family_id = $1 AND active = true AND $2 = ANY(events)
		 ORDER BY created_at`, familyID, event,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var webhooks []domain.Webhook
	for rows.Next() {
		var w domain.Webhook
		if err := rows.Scan(&w.ID, &w.FamilyID, &w.URL, &w.Secret, &w.Events, &w.Active, &w.CreatedAt, &w.UpdatedAt); err != nil {
			return nil, err
		}
		webhooks = append(webhooks, w)
	}
	return webhooks, rows.Err()
}
