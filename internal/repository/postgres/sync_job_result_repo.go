package postgres

import (
	"context"

	"github.com/google/uuid"

	"github.com/guardiangate/api/internal/domain"
)

type EnforcementResultRepo struct {
	*DB
}

func NewEnforcementResultRepo(db *DB) *EnforcementResultRepo {
	return &EnforcementResultRepo{DB: db}
}

func (r *EnforcementResultRepo) Create(ctx context.Context, result *domain.EnforcementResult) error {
	if result.ID == uuid.Nil {
		result.ID = uuid.New()
	}

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO enforcement_results (id, enforcement_job_id, compliance_link_id, platform_id, status, rules_applied, rules_skipped, rules_failed, details, error_message, started_at, completed_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
		result.ID, result.EnforcementJobID, result.ComplianceLinkID, result.PlatformID, result.Status,
		result.RulesApplied, result.RulesSkipped, result.RulesFailed, result.Details,
		result.ErrorMessage, result.StartedAt, result.CompletedAt,
	)
	return err
}

func (r *EnforcementResultRepo) Update(ctx context.Context, result *domain.EnforcementResult) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE enforcement_results SET status = $1, rules_applied = $2, rules_skipped = $3, rules_failed = $4, details = $5, error_message = $6, started_at = $7, completed_at = $8
		 WHERE id = $9`,
		result.Status, result.RulesApplied, result.RulesSkipped, result.RulesFailed,
		result.Details, result.ErrorMessage, result.StartedAt, result.CompletedAt, result.ID,
	)
	return err
}

func (r *EnforcementResultRepo) ListByJob(ctx context.Context, jobID uuid.UUID) ([]domain.EnforcementResult, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, enforcement_job_id, compliance_link_id, platform_id, status, rules_applied, rules_skipped, rules_failed, details, error_message, started_at, completed_at
		 FROM enforcement_results WHERE enforcement_job_id = $1
		 ORDER BY platform_id`, jobID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.EnforcementResult
	for rows.Next() {
		var res domain.EnforcementResult
		if err := rows.Scan(&res.ID, &res.EnforcementJobID, &res.ComplianceLinkID, &res.PlatformID, &res.Status,
			&res.RulesApplied, &res.RulesSkipped, &res.RulesFailed, &res.Details,
			&res.ErrorMessage, &res.StartedAt, &res.CompletedAt); err != nil {
			return nil, err
		}
		results = append(results, res)
	}
	return results, rows.Err()
}
