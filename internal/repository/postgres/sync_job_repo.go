package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type EnforcementJobRepo struct {
	*DB
}

func NewEnforcementJobRepo(db *DB) *EnforcementJobRepo {
	return &EnforcementJobRepo{DB: db}
}

func (r *EnforcementJobRepo) Create(ctx context.Context, job *domain.EnforcementJob) error {
	if job.ID == uuid.Nil {
		job.ID = uuid.New()
	}
	job.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO enforcement_jobs (id, child_id, policy_id, trigger_type, status, started_at, completed_at, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		job.ID, job.ChildID, job.PolicyID, job.TriggerType, job.Status,
		job.StartedAt, job.CompletedAt, job.CreatedAt,
	)
	return err
}

func (r *EnforcementJobRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.EnforcementJob, error) {
	var j domain.EnforcementJob
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, policy_id, trigger_type, status, started_at, completed_at, created_at
		 FROM enforcement_jobs WHERE id = $1`, id,
	).Scan(&j.ID, &j.ChildID, &j.PolicyID, &j.TriggerType, &j.Status,
		&j.StartedAt, &j.CompletedAt, &j.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &j, nil
}

func (r *EnforcementJobRepo) Update(ctx context.Context, job *domain.EnforcementJob) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE enforcement_jobs SET status = $1, started_at = $2, completed_at = $3
		 WHERE id = $4`,
		job.Status, job.StartedAt, job.CompletedAt, job.ID,
	)
	return err
}

func (r *EnforcementJobRepo) ListByChild(ctx context.Context, childID uuid.UUID, limit int) ([]domain.EnforcementJob, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, policy_id, trigger_type, status, started_at, completed_at, created_at
		 FROM enforcement_jobs WHERE child_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2`, childID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []domain.EnforcementJob
	for rows.Next() {
		var j domain.EnforcementJob
		if err := rows.Scan(&j.ID, &j.ChildID, &j.PolicyID, &j.TriggerType, &j.Status,
			&j.StartedAt, &j.CompletedAt, &j.CreatedAt); err != nil {
			return nil, err
		}
		jobs = append(jobs, j)
	}
	return jobs, rows.Err()
}

func (r *EnforcementJobRepo) ListPending(ctx context.Context, limit int) ([]domain.EnforcementJob, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, policy_id, trigger_type, status, started_at, completed_at, created_at
		 FROM enforcement_jobs WHERE status = $1
		 ORDER BY created_at ASC
		 LIMIT $2`, domain.EnforcementPending, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []domain.EnforcementJob
	for rows.Next() {
		var j domain.EnforcementJob
		if err := rows.Scan(&j.ID, &j.ChildID, &j.PolicyID, &j.TriggerType, &j.Status,
			&j.StartedAt, &j.CompletedAt, &j.CreatedAt); err != nil {
			return nil, err
		}
		jobs = append(jobs, j)
	}
	return jobs, rows.Err()
}
