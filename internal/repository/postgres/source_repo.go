package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/guardiangate/api/internal/domain"
)

type SourceRepo struct {
	*DB
}

func NewSourceRepo(db *DB) *SourceRepo {
	return &SourceRepo{DB: db}
}

// ── Source CRUD ──────────────────────────────────────────────────

func (r *SourceRepo) CreateSource(ctx context.Context, src *domain.Source) (*domain.Source, error) {
	if src.ID == uuid.Nil {
		src.ID = uuid.New()
	}
	now := time.Now()
	src.CreatedAt = now
	src.UpdatedAt = now

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO sources
		 (id, child_id, family_id, source_slug, display_name, api_tier,
		  credentials, status, auto_sync, capabilities, config,
		  last_sync_at, last_sync_status, sync_version, error_message,
		  webhook_secret, created_at, updated_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
		src.ID, src.ChildID, src.FamilyID, src.SourceSlug, src.DisplayName, src.APITier,
		src.Credentials, src.Status, src.AutoSync, src.Capabilities, src.Config,
		src.LastSyncAt, src.LastSyncStatus, src.SyncVersion, src.ErrorMessage,
		src.WebhookSecret, src.CreatedAt, src.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return src, nil
}

func (r *SourceRepo) GetSource(ctx context.Context, id uuid.UUID) (*domain.Source, error) {
	var s domain.Source
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, family_id, source_slug, display_name, api_tier,
		        credentials, status, auto_sync, capabilities, config,
		        last_sync_at, last_sync_status, sync_version, error_message,
		        webhook_secret, created_at, updated_at
		 FROM sources WHERE id = $1`, id,
	).Scan(
		&s.ID, &s.ChildID, &s.FamilyID, &s.SourceSlug, &s.DisplayName, &s.APITier,
		&s.Credentials, &s.Status, &s.AutoSync, &s.Capabilities, &s.Config,
		&s.LastSyncAt, &s.LastSyncStatus, &s.SyncVersion, &s.ErrorMessage,
		&s.WebhookSecret, &s.CreatedAt, &s.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SourceRepo) GetSourceByChildAndSlug(ctx context.Context, childID uuid.UUID, slug string) (*domain.Source, error) {
	var s domain.Source
	err := r.Pool.QueryRow(ctx,
		`SELECT id, child_id, family_id, source_slug, display_name, api_tier,
		        credentials, status, auto_sync, capabilities, config,
		        last_sync_at, last_sync_status, sync_version, error_message,
		        webhook_secret, created_at, updated_at
		 FROM sources WHERE child_id = $1 AND source_slug = $2`, childID, slug,
	).Scan(
		&s.ID, &s.ChildID, &s.FamilyID, &s.SourceSlug, &s.DisplayName, &s.APITier,
		&s.Credentials, &s.Status, &s.AutoSync, &s.Capabilities, &s.Config,
		&s.LastSyncAt, &s.LastSyncStatus, &s.SyncVersion, &s.ErrorMessage,
		&s.WebhookSecret, &s.CreatedAt, &s.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SourceRepo) ListSourcesByChild(ctx context.Context, childID uuid.UUID) ([]domain.Source, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, family_id, source_slug, display_name, api_tier,
		        credentials, status, auto_sync, capabilities, config,
		        last_sync_at, last_sync_status, sync_version, error_message,
		        webhook_secret, created_at, updated_at
		 FROM sources WHERE child_id = $1
		 ORDER BY created_at`, childID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sources []domain.Source
	for rows.Next() {
		var s domain.Source
		if err := rows.Scan(
			&s.ID, &s.ChildID, &s.FamilyID, &s.SourceSlug, &s.DisplayName, &s.APITier,
			&s.Credentials, &s.Status, &s.AutoSync, &s.Capabilities, &s.Config,
			&s.LastSyncAt, &s.LastSyncStatus, &s.SyncVersion, &s.ErrorMessage,
			&s.WebhookSecret, &s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		sources = append(sources, s)
	}
	return sources, rows.Err()
}

func (r *SourceRepo) ListSourcesByFamily(ctx context.Context, familyID uuid.UUID) ([]domain.Source, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, child_id, family_id, source_slug, display_name, api_tier,
		        credentials, status, auto_sync, capabilities, config,
		        last_sync_at, last_sync_status, sync_version, error_message,
		        webhook_secret, created_at, updated_at
		 FROM sources WHERE family_id = $1
		 ORDER BY created_at`, familyID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sources []domain.Source
	for rows.Next() {
		var s domain.Source
		if err := rows.Scan(
			&s.ID, &s.ChildID, &s.FamilyID, &s.SourceSlug, &s.DisplayName, &s.APITier,
			&s.Credentials, &s.Status, &s.AutoSync, &s.Capabilities, &s.Config,
			&s.LastSyncAt, &s.LastSyncStatus, &s.SyncVersion, &s.ErrorMessage,
			&s.WebhookSecret, &s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		sources = append(sources, s)
	}
	return sources, rows.Err()
}

func (r *SourceRepo) UpdateSource(ctx context.Context, src *domain.Source) (*domain.Source, error) {
	src.UpdatedAt = time.Now()
	_, err := r.Pool.Exec(ctx,
		`UPDATE sources
		 SET source_slug = $1, display_name = $2, api_tier = $3,
		     credentials = $4, status = $5, auto_sync = $6,
		     capabilities = $7, config = $8,
		     last_sync_at = $9, last_sync_status = $10, sync_version = $11,
		     error_message = $12, webhook_secret = $13, updated_at = $14
		 WHERE id = $15`,
		src.SourceSlug, src.DisplayName, src.APITier,
		src.Credentials, src.Status, src.AutoSync,
		src.Capabilities, src.Config,
		src.LastSyncAt, src.LastSyncStatus, src.SyncVersion,
		src.ErrorMessage, src.WebhookSecret, src.UpdatedAt,
		src.ID,
	)
	if err != nil {
		return nil, err
	}
	return src, nil
}

func (r *SourceRepo) UpdateSourceStatus(ctx context.Context, id uuid.UUID, status string, errorMsg *string) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE sources SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3`,
		status, errorMsg, id,
	)
	return err
}

func (r *SourceRepo) DeleteSource(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx, `DELETE FROM sources WHERE id = $1`, id)
	return err
}

// ── Sync Jobs ───────────────────────────────────────────────────

func (r *SourceRepo) CreateSyncJob(ctx context.Context, job *domain.SourceSyncJob) (*domain.SourceSyncJob, error) {
	if job.ID == uuid.Nil {
		job.ID = uuid.New()
	}
	job.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO source_sync_jobs
		 (id, source_id, sync_mode, trigger_type, status,
		  rules_pushed, rules_skipped, rules_failed, error_message,
		  started_at, completed_at, created_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
		job.ID, job.SourceID, job.SyncMode, job.TriggerType, job.Status,
		job.RulesPushed, job.RulesSkipped, job.RulesFailed, job.ErrorMessage,
		job.StartedAt, job.CompletedAt, job.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return job, nil
}

func (r *SourceRepo) GetSyncJob(ctx context.Context, id uuid.UUID) (*domain.SourceSyncJob, error) {
	var j domain.SourceSyncJob
	err := r.Pool.QueryRow(ctx,
		`SELECT id, source_id, sync_mode, trigger_type, status,
		        rules_pushed, rules_skipped, rules_failed, error_message,
		        started_at, completed_at, created_at
		 FROM source_sync_jobs WHERE id = $1`, id,
	).Scan(
		&j.ID, &j.SourceID, &j.SyncMode, &j.TriggerType, &j.Status,
		&j.RulesPushed, &j.RulesSkipped, &j.RulesFailed, &j.ErrorMessage,
		&j.StartedAt, &j.CompletedAt, &j.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &j, nil
}

func (r *SourceRepo) UpdateSyncJob(ctx context.Context, job *domain.SourceSyncJob) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE source_sync_jobs
		 SET status = $1, rules_pushed = $2, rules_skipped = $3, rules_failed = $4,
		     error_message = $5, started_at = $6, completed_at = $7
		 WHERE id = $8`,
		job.Status, job.RulesPushed, job.RulesSkipped, job.RulesFailed,
		job.ErrorMessage, job.StartedAt, job.CompletedAt,
		job.ID,
	)
	return err
}

func (r *SourceRepo) ListSyncJobs(ctx context.Context, sourceID uuid.UUID, limit int) ([]domain.SourceSyncJob, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, source_id, sync_mode, trigger_type, status,
		        rules_pushed, rules_skipped, rules_failed, error_message,
		        started_at, completed_at, created_at
		 FROM source_sync_jobs WHERE source_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2`, sourceID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []domain.SourceSyncJob
	for rows.Next() {
		var j domain.SourceSyncJob
		if err := rows.Scan(
			&j.ID, &j.SourceID, &j.SyncMode, &j.TriggerType, &j.Status,
			&j.RulesPushed, &j.RulesSkipped, &j.RulesFailed, &j.ErrorMessage,
			&j.StartedAt, &j.CompletedAt, &j.CreatedAt,
		); err != nil {
			return nil, err
		}
		jobs = append(jobs, j)
	}
	return jobs, rows.Err()
}

// ── Sync Results ────────────────────────────────────────────────

func (r *SourceRepo) CreateSyncResult(ctx context.Context, result *domain.SourceSyncResult) (*domain.SourceSyncResult, error) {
	if result.ID == uuid.Nil {
		result.ID = uuid.New()
	}
	result.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO source_sync_results
		 (id, job_id, source_id, rule_category, status,
		  source_value, source_response, error_message, created_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		result.ID, result.JobID, result.SourceID, result.RuleCategory, result.Status,
		result.SourceValue, result.SourceResponse, result.ErrorMessage, result.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (r *SourceRepo) ListSyncResults(ctx context.Context, jobID uuid.UUID) ([]domain.SourceSyncResult, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, job_id, source_id, rule_category, status,
		        source_value, source_response, error_message, created_at
		 FROM source_sync_results WHERE job_id = $1
		 ORDER BY created_at`, jobID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.SourceSyncResult
	for rows.Next() {
		var sr domain.SourceSyncResult
		if err := rows.Scan(
			&sr.ID, &sr.JobID, &sr.SourceID, &sr.RuleCategory, &sr.Status,
			&sr.SourceValue, &sr.SourceResponse, &sr.ErrorMessage, &sr.CreatedAt,
		); err != nil {
			return nil, err
		}
		results = append(results, sr)
	}
	return results, rows.Err()
}

// ── Capabilities ────────────────────────────────────────────────

func (r *SourceRepo) GetCapabilities(ctx context.Context, sourceSlug string) ([]domain.SourceCapability, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, source_slug, rule_category, support_level, read_write, notes
		 FROM source_capabilities WHERE source_slug = $1
		 ORDER BY rule_category`, sourceSlug,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var caps []domain.SourceCapability
	for rows.Next() {
		var c domain.SourceCapability
		if err := rows.Scan(
			&c.ID, &c.SourceSlug, &c.RuleCategory, &c.SupportLevel, &c.ReadWrite, &c.Notes,
		); err != nil {
			return nil, err
		}
		caps = append(caps, c)
	}
	return caps, rows.Err()
}

func (r *SourceRepo) UpsertCapability(ctx context.Context, cap *domain.SourceCapability) error {
	if cap.ID == uuid.Nil {
		cap.ID = uuid.New()
	}

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO source_capabilities
		 (id, source_slug, rule_category, support_level, read_write, notes)
		 VALUES ($1,$2,$3,$4,$5,$6)
		 ON CONFLICT (source_slug, rule_category) DO UPDATE SET
		   support_level = EXCLUDED.support_level,
		   read_write = EXCLUDED.read_write,
		   notes = EXCLUDED.notes`,
		cap.ID, cap.SourceSlug, cap.RuleCategory, cap.SupportLevel, cap.ReadWrite, cap.Notes,
	)
	return err
}

// ── Inbound Events ──────────────────────────────────────────────

func (r *SourceRepo) CreateInboundEvent(ctx context.Context, event *domain.SourceInboundEvent) (*domain.SourceInboundEvent, error) {
	if event.ID == uuid.Nil {
		event.ID = uuid.New()
	}
	event.CreatedAt = time.Now()

	_, err := r.Pool.Exec(ctx,
		`INSERT INTO source_inbound_events
		 (id, source_id, event_type, payload, processed, processed_at, created_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7)`,
		event.ID, event.SourceID, event.EventType, event.Payload,
		event.Processed, event.ProcessedAt, event.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return event, nil
}

func (r *SourceRepo) ListUnprocessedEvents(ctx context.Context, sourceID uuid.UUID) ([]domain.SourceInboundEvent, error) {
	rows, err := r.Pool.Query(ctx,
		`SELECT id, source_id, event_type, payload, processed, processed_at, created_at
		 FROM source_inbound_events
		 WHERE source_id = $1 AND processed = false
		 ORDER BY created_at`, sourceID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []domain.SourceInboundEvent
	for rows.Next() {
		var e domain.SourceInboundEvent
		if err := rows.Scan(
			&e.ID, &e.SourceID, &e.EventType, &e.Payload,
			&e.Processed, &e.ProcessedAt, &e.CreatedAt,
		); err != nil {
			return nil, err
		}
		events = append(events, e)
	}
	return events, rows.Err()
}

func (r *SourceRepo) MarkEventProcessed(ctx context.Context, id uuid.UUID) error {
	_, err := r.Pool.Exec(ctx,
		`UPDATE source_inbound_events SET processed = true, processed_at = NOW() WHERE id = $1`,
		id,
	)
	return err
}
