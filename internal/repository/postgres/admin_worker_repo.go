package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type AdminWorkerRepo struct {
	*DB
}

func NewAdminWorkerRepo(db *DB) *AdminWorkerRepo {
	return &AdminWorkerRepo{DB: db}
}

// workerRunCols is the SELECT column list with COALESCE for nullable text fields.
const workerRunCols = `id, worker_id, status, trigger_type, started_at, completed_at,
	COALESCE(output_summary, ''), items_processed, COALESCE(error_message, '')`

func scanWorkerRun(row interface{ Scan(dest ...any) error }, run *domain.WorkerRun) error {
	return row.Scan(
		&run.ID, &run.WorkerID, &run.Status, &run.TriggerType,
		&run.StartedAt, &run.CompletedAt, &run.OutputSummary,
		&run.ItemsProcessed, &run.ErrorMessage,
	)
}

func (r *AdminWorkerRepo) CreateRun(ctx context.Context, run *domain.WorkerRun) error {
	if run.ID == uuid.Nil {
		run.ID = uuid.New()
	}
	run.StartedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`INSERT INTO admin_worker_runs (id, worker_id, status, trigger_type, started_at, items_processed)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		run.ID, run.WorkerID, run.Status, run.TriggerType, run.StartedAt, run.ItemsProcessed,
	)
	return err
}

func (r *AdminWorkerRepo) CompleteRun(ctx context.Context, id uuid.UUID, status domain.WorkerRunStatus, summary string, itemsProcessed int, errMsg string) error {
	now := time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE admin_worker_runs
		 SET status = $1, completed_at = $2, output_summary = $3, items_processed = $4, error_message = $5
		 WHERE id = $6`,
		status, now, summary, itemsProcessed, errMsg, id,
	)
	return err
}

func (r *AdminWorkerRepo) ListRuns(ctx context.Context, workerID string, limit int) ([]domain.WorkerRun, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT `+workerRunCols+`
		 FROM admin_worker_runs WHERE worker_id = $1
		 ORDER BY started_at DESC LIMIT $2`, workerID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var runs []domain.WorkerRun
	for rows.Next() {
		var run domain.WorkerRun
		if err := scanWorkerRun(rows, &run); err != nil {
			return nil, err
		}
		runs = append(runs, run)
	}
	return runs, rows.Err()
}

func (r *AdminWorkerRepo) LatestRunPerWorker(ctx context.Context) (map[string]*domain.WorkerRun, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT DISTINCT ON (worker_id)
		   `+workerRunCols+`
		 FROM admin_worker_runs
		 ORDER BY worker_id, started_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]*domain.WorkerRun)
	for rows.Next() {
		var run domain.WorkerRun
		if err := scanWorkerRun(rows, &run); err != nil {
			return nil, err
		}
		result[run.WorkerID] = &run
	}
	return result, rows.Err()
}

func (r *AdminWorkerRepo) GetLatestRun(ctx context.Context, workerID string) (*domain.WorkerRun, error) {
	var run domain.WorkerRun
	err := r.Pool.QueryRow(ctx,
		`SELECT `+workerRunCols+`
		 FROM admin_worker_runs WHERE worker_id = $1
		 ORDER BY started_at DESC LIMIT 1`, workerID,
	).Scan(
		&run.ID, &run.WorkerID, &run.Status, &run.TriggerType,
		&run.StartedAt, &run.CompletedAt, &run.OutputSummary,
		&run.ItemsProcessed, &run.ErrorMessage,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &run, nil
}

// CountNewsUnread returns the count of unread news items.
func (r *AdminWorkerRepo) CountNewsUnread(ctx context.Context) (int, error) {
	var count int
	err := r.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM admin_news_items WHERE NOT is_read`).Scan(&count)
	return count, err
}

// CountApproachingDeadlines returns compliance alerts within 30 days that aren't resolved.
func (r *AdminWorkerRepo) CountApproachingDeadlines(ctx context.Context) (int, error) {
	var count int
	err := r.Pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM admin_compliance_alerts
		 WHERE status != 'resolved' AND deadline_date <= NOW() + INTERVAL '30 days'`,
	).Scan(&count)
	return count, err
}
