package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

type ActivityLogRepo struct{ *DB }

func NewActivityLogRepo(db *DB) *ActivityLogRepo {
	return &ActivityLogRepo{DB: db}
}

func (r *ActivityLogRepo) Create(ctx context.Context, e *domain.ActivityLog) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO activity_logs (id, child_id, platform_id, category, detail, recorded_at, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
		e.ID, e.ChildID, e.PlatformID, e.Category, e.Detail, e.RecordedAt,
	)
	return err
}

func (r *ActivityLogRepo) ListByChild(ctx context.Context, childID uuid.UUID, limit int) ([]domain.ActivityLog, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, platform_id, category, detail, recorded_at, created_at
		 FROM activity_logs WHERE child_id = $1 ORDER BY recorded_at DESC LIMIT $2`, childID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []domain.ActivityLog
	for rows.Next() {
		var e domain.ActivityLog
		if err := rows.Scan(&e.ID, &e.ChildID, &e.PlatformID, &e.Category, &e.Detail, &e.RecordedAt, &e.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, e)
	}
	return items, rows.Err()
}

func (r *ActivityLogRepo) ListByChildAndTimeRange(ctx context.Context, childID uuid.UUID, from, to time.Time) ([]domain.ActivityLog, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, platform_id, category, detail, recorded_at, created_at
		 FROM activity_logs WHERE child_id = $1 AND recorded_at >= $2 AND recorded_at <= $3
		 ORDER BY recorded_at DESC`, childID, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []domain.ActivityLog
	for rows.Next() {
		var e domain.ActivityLog
		if err := rows.Scan(&e.ID, &e.ChildID, &e.PlatformID, &e.Category, &e.Detail, &e.RecordedAt, &e.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, e)
	}
	return items, rows.Err()
}
