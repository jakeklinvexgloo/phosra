package postgres

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type BrowserEnforcementRepo struct {
	*DB
}

func NewBrowserEnforcementRepo(db *DB) *BrowserEnforcementRepo {
	return &BrowserEnforcementRepo{DB: db}
}

func (r *BrowserEnforcementRepo) CreateJob(ctx context.Context, job *domain.BrowserEnforcementJob) (*domain.BrowserEnforcementJob, error) {
	if job.ID == uuid.Nil {
		job.ID = uuid.New()
	}
	now := time.Now()
	job.CreatedAt = now
	job.UpdatedAt = now
	if job.Status == "" {
		job.Status = domain.BrowserEnforcementPending
	}
	if job.DeploymentModel == "" {
		job.DeploymentModel = "local"
	}

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO browser_enforcement_jobs
		 (id, family_id, child_id, child_name, child_age, platform_id, rules, status,
		  screenshots, deployment_model, created_at, updated_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
		job.ID, job.FamilyID, job.ChildID, job.ChildName, job.ChildAge,
		job.PlatformID, job.Rules, job.Status,
		job.Screenshots, job.DeploymentModel, job.CreatedAt, job.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return job, nil
}

func (r *BrowserEnforcementRepo) GetJob(ctx context.Context, jobID uuid.UUID) (*domain.BrowserEnforcementJob, error) {
	var j domain.BrowserEnforcementJob
	err := r.Pool.QueryRow(ctx,
		`SELECT id, family_id, child_id, child_name, child_age, platform_id, rules, status,
		        result, error_message, screenshots, deployment_model,
		        started_at, completed_at, duration_ms, created_at, updated_at
		 FROM browser_enforcement_jobs WHERE id = $1`, jobID,
	).Scan(
		&j.ID, &j.FamilyID, &j.ChildID, &j.ChildName, &j.ChildAge,
		&j.PlatformID, &j.Rules, &j.Status,
		&j.Result, &j.ErrorMessage, &j.Screenshots, &j.DeploymentModel,
		&j.StartedAt, &j.CompletedAt, &j.DurationMs, &j.CreatedAt, &j.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &j, nil
}

func (r *BrowserEnforcementRepo) UpdateJobStatus(ctx context.Context, jobID uuid.UUID, status domain.BrowserEnforcementJobStatus, result []byte, errorMsg *string) error {
	now := time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE browser_enforcement_jobs
		 SET status = $1, result = $2, error_message = $3, updated_at = $4,
		     started_at = CASE WHEN status = 'pending' AND $1 = 'running' THEN $4 ELSE started_at END,
		     completed_at = CASE WHEN $1 IN ('completed','failed','cancelled') THEN $4 ELSE completed_at END,
		     duration_ms = CASE WHEN $1 IN ('completed','failed','cancelled') AND started_at IS NOT NULL
		                        THEN EXTRACT(EPOCH FROM ($4 - started_at))::integer * 1000
		                        ELSE duration_ms END
		 WHERE id = $5`,
		status, result, errorMsg, now, jobID,
	)
	return err
}

func (r *BrowserEnforcementRepo) ListJobs(ctx context.Context, familyID uuid.UUID, limit, offset int) ([]domain.BrowserEnforcementJob, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	rows, err := r.Pool.Query(ctx,
		`SELECT id, family_id, child_id, child_name, child_age, platform_id, rules, status,
		        result, error_message, screenshots, deployment_model,
		        started_at, completed_at, duration_ms, created_at, updated_at
		 FROM browser_enforcement_jobs
		 WHERE family_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2 OFFSET $3`, familyID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []domain.BrowserEnforcementJob
	for rows.Next() {
		var j domain.BrowserEnforcementJob
		if err := rows.Scan(
			&j.ID, &j.FamilyID, &j.ChildID, &j.ChildName, &j.ChildAge,
			&j.PlatformID, &j.Rules, &j.Status,
			&j.Result, &j.ErrorMessage, &j.Screenshots, &j.DeploymentModel,
			&j.StartedAt, &j.CompletedAt, &j.DurationMs, &j.CreatedAt, &j.UpdatedAt,
		); err != nil {
			return nil, err
		}
		jobs = append(jobs, j)
	}
	return jobs, rows.Err()
}

func (r *BrowserEnforcementRepo) CreateAuditEntry(ctx context.Context, entry *domain.BrowserEnforcementAuditEntry) error {
	if entry.ID == uuid.Nil {
		entry.ID = uuid.New()
	}
	entry.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO browser_enforcement_audit_log
		 (id, job_id, action, rule_category, status, details, screenshot_path, created_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		entry.ID, entry.JobID, entry.Action, entry.RuleCategory,
		entry.Status, entry.Details, entry.ScreenshotPath, entry.CreatedAt,
	)
	return err
}

func (r *BrowserEnforcementRepo) GetJobAuditLog(ctx context.Context, jobID uuid.UUID) ([]domain.BrowserEnforcementAuditEntry, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, job_id, action, rule_category, status, details, screenshot_path, created_at
		 FROM browser_enforcement_audit_log
		 WHERE job_id = $1
		 ORDER BY created_at ASC`, jobID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []domain.BrowserEnforcementAuditEntry
	for rows.Next() {
		var e domain.BrowserEnforcementAuditEntry
		if err := rows.Scan(
			&e.ID, &e.JobID, &e.Action, &e.RuleCategory,
			&e.Status, &e.Details, &e.ScreenshotPath, &e.CreatedAt,
		); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}
