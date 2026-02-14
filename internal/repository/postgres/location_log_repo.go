package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/guardiangate/api/internal/domain"
)

type LocationLogRepo struct{ *DB }

func NewLocationLogRepo(db *DB) *LocationLogRepo {
	return &LocationLogRepo{DB: db}
}

func (r *LocationLogRepo) Create(ctx context.Context, e *domain.LocationLog) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO location_logs (id, child_id, device_id, latitude, longitude, accuracy, recorded_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		e.ID, e.ChildID, e.DeviceID, e.Latitude, e.Longitude, e.Accuracy, e.RecordedAt,
	)
	return err
}

func (r *LocationLogRepo) GetLatest(ctx context.Context, childID uuid.UUID) (*domain.LocationLog, error) {
	var e domain.LocationLog
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, device_id, latitude, longitude, accuracy, recorded_at
		 FROM location_logs WHERE child_id = $1 ORDER BY recorded_at DESC LIMIT 1`, childID,
	).Scan(&e.ID, &e.ChildID, &e.DeviceID, &e.Latitude, &e.Longitude, &e.Accuracy, &e.RecordedAt)
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *LocationLogRepo) ListByChildAndTimeRange(ctx context.Context, childID uuid.UUID, from, to time.Time) ([]domain.LocationLog, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, device_id, latitude, longitude, accuracy, recorded_at
		 FROM location_logs WHERE child_id = $1 AND recorded_at >= $2 AND recorded_at <= $3
		 ORDER BY recorded_at DESC`, childID, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []domain.LocationLog
	for rows.Next() {
		var e domain.LocationLog
		if err := rows.Scan(&e.ID, &e.ChildID, &e.DeviceID, &e.Latitude, &e.Longitude, &e.Accuracy, &e.RecordedAt); err != nil {
			return nil, err
		}
		items = append(items, e)
	}
	return items, rows.Err()
}
