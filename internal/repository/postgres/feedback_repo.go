package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/guardiangate/api/internal/domain"
)

type FeedbackRepo struct {
	*DB
}

func NewFeedbackRepo(db *DB) *FeedbackRepo {
	return &FeedbackRepo{DB: db}
}

func (r *FeedbackRepo) Create(ctx context.Context, fb *domain.UIFeedback) error {
	if fb.ID == uuid.Nil {
		fb.ID = uuid.New()
	}
	fb.CreatedAt = time.Now()
	if fb.Status == "" {
		fb.Status = "open"
	}
	if fb.ReviewerName == "" {
		fb.ReviewerName = "Anonymous"
	}

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO ui_feedback (id, page_route, css_selector, component_hint, comment, reviewer_name, status, viewport_width, viewport_height, click_x, click_y, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
		fb.ID, fb.PageRoute, fb.CSSSelector, fb.ComponentHint, fb.Comment,
		fb.ReviewerName, fb.Status, fb.ViewportWidth, fb.ViewportHeight,
		fb.ClickX, fb.ClickY, fb.CreatedAt,
	)
	return err
}

func (r *FeedbackRepo) List(ctx context.Context, status string) ([]domain.UIFeedback, error) {
	query := `SELECT id, page_route, css_selector, component_hint, comment, reviewer_name, status, viewport_width, viewport_height, click_x, click_y, created_at, resolved_at
		 FROM ui_feedback`
	args := []any{}

	if status != "" {
		query += ` WHERE status = $1`
		args = append(args, status)
	}
	query += ` ORDER BY created_at DESC`

	rows, err := r.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.UIFeedback
	for rows.Next() {
		var fb domain.UIFeedback
		if err := rows.Scan(
			&fb.ID, &fb.PageRoute, &fb.CSSSelector, &fb.ComponentHint, &fb.Comment,
			&fb.ReviewerName, &fb.Status, &fb.ViewportWidth, &fb.ViewportHeight,
			&fb.ClickX, &fb.ClickY, &fb.CreatedAt, &fb.ResolvedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, fb)
	}
	return items, rows.Err()
}

func (r *FeedbackRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	var resolvedAt *time.Time
	if status == "fixed" || status == "dismissed" {
		now := time.Now()
		resolvedAt = &now
	}

	_, err := r.Pool.Exec(ctx,
		`UPDATE ui_feedback SET status = $1, resolved_at = $2 WHERE id = $3`,
		status, resolvedAt, id,
	)
	return err
}
