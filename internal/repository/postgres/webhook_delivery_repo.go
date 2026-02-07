package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/guardiangate/api/internal/domain"
)

type WebhookDeliveryRepo struct {
	*DB
}

func NewWebhookDeliveryRepo(db *DB) *WebhookDeliveryRepo {
	return &WebhookDeliveryRepo{DB: db}
}

func (r *WebhookDeliveryRepo) Create(ctx context.Context, delivery *domain.WebhookDelivery) error {
	if delivery.ID == uuid.Nil {
		delivery.ID = uuid.New()
	}
	delivery.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO webhook_deliveries (id, webhook_id, event, payload, response_code, success, attempts, next_retry_at, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		delivery.ID, delivery.WebhookID, delivery.Event, delivery.Payload,
		delivery.ResponseCode, delivery.Success, delivery.Attempts,
		delivery.NextRetryAt, delivery.CreatedAt,
	)
	return err
}

func (r *WebhookDeliveryRepo) Update(ctx context.Context, delivery *domain.WebhookDelivery) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE webhook_deliveries SET response_code = $1, success = $2, attempts = $3, next_retry_at = $4
		 WHERE id = $5`,
		delivery.ResponseCode, delivery.Success, delivery.Attempts, delivery.NextRetryAt, delivery.ID,
	)
	return err
}

func (r *WebhookDeliveryRepo) ListByWebhook(ctx context.Context, webhookID uuid.UUID, limit int) ([]domain.WebhookDelivery, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, webhook_id, event, payload, response_code, success, attempts, next_retry_at, created_at
		 FROM webhook_deliveries WHERE webhook_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2`, webhookID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deliveries []domain.WebhookDelivery
	for rows.Next() {
		var d domain.WebhookDelivery
		if err := rows.Scan(&d.ID, &d.WebhookID, &d.Event, &d.Payload, &d.ResponseCode,
			&d.Success, &d.Attempts, &d.NextRetryAt, &d.CreatedAt); err != nil {
			return nil, err
		}
		deliveries = append(deliveries, d)
	}
	return deliveries, rows.Err()
}

func (r *WebhookDeliveryRepo) ListPendingRetries(ctx context.Context, limit int) ([]domain.WebhookDelivery, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, webhook_id, event, payload, response_code, success, attempts, next_retry_at, created_at
		 FROM webhook_deliveries
		 WHERE success = false AND next_retry_at IS NOT NULL AND next_retry_at <= $1
		 ORDER BY next_retry_at ASC
		 LIMIT $2`, time.Now(), limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deliveries []domain.WebhookDelivery
	for rows.Next() {
		var d domain.WebhookDelivery
		if err := rows.Scan(&d.ID, &d.WebhookID, &d.Event, &d.Payload, &d.ResponseCode,
			&d.Success, &d.Attempts, &d.NextRetryAt, &d.CreatedAt); err != nil {
			return nil, err
		}
		deliveries = append(deliveries, d)
	}
	return deliveries, rows.Err()
}
