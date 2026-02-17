package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/guardiangate/api/internal/domain"
)

type DeviceReportRepo struct{ *DB }

func NewDeviceReportRepo(db *DB) *DeviceReportRepo {
	return &DeviceReportRepo{DB: db}
}

func (r *DeviceReportRepo) Create(ctx context.Context, report *domain.DeviceReport) error {
	if report.ID == uuid.Nil {
		report.ID = uuid.New()
	}
	report.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO device_reports (id, device_id, child_id, report_type, payload, reported_at, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		report.ID, report.DeviceID, report.ChildID, report.ReportType,
		report.Payload, report.ReportedAt, report.CreatedAt,
	)
	return err
}

func (r *DeviceReportRepo) ListByChild(ctx context.Context, childID uuid.UUID, limit int) ([]domain.DeviceReport, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, device_id, child_id, report_type, payload, reported_at, created_at
		 FROM device_reports WHERE child_id = $1
		 ORDER BY reported_at DESC LIMIT $2`, childID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scan(rows)
}

func (r *DeviceReportRepo) ListByDevice(ctx context.Context, deviceID uuid.UUID, limit int) ([]domain.DeviceReport, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, device_id, child_id, report_type, payload, reported_at, created_at
		 FROM device_reports WHERE device_id = $1
		 ORDER BY reported_at DESC LIMIT $2`, deviceID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scan(rows)
}

func (r *DeviceReportRepo) ListByChildAndTimeRange(ctx context.Context, childID uuid.UUID, from, to time.Time) ([]domain.DeviceReport, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, device_id, child_id, report_type, payload, reported_at, created_at
		 FROM device_reports WHERE child_id = $1 AND reported_at >= $2 AND reported_at <= $3
		 ORDER BY reported_at DESC`, childID, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scan(rows)
}

func (r *DeviceReportRepo) scan(rows interface {
	Next() bool
	Scan(dest ...any) error
	Err() error
}) ([]domain.DeviceReport, error) {
	var items []domain.DeviceReport
	for rows.Next() {
		var report domain.DeviceReport
		if err := rows.Scan(
			&report.ID, &report.DeviceID, &report.ChildID, &report.ReportType,
			&report.Payload, &report.ReportedAt, &report.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, report)
	}
	return items, rows.Err()
}
