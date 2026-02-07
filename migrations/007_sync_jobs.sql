-- 007: Sync jobs and results
CREATE TABLE sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES child_policies(id) ON DELETE CASCADE,
    trigger_type VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'auto', 'webhook')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'partial')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_child ON sync_jobs(child_id);
CREATE INDEX idx_sync_jobs_policy ON sync_jobs(policy_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status) WHERE status IN ('pending', 'running');

CREATE TABLE sync_job_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_job_id UUID NOT NULL REFERENCES sync_jobs(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    provider_id VARCHAR(50) NOT NULL REFERENCES providers(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'partial')),
    rules_applied INT NOT NULL DEFAULT 0,
    rules_skipped INT NOT NULL DEFAULT 0,
    rules_failed INT NOT NULL DEFAULT 0,
    details JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sync_job_results_job ON sync_job_results(sync_job_id);
CREATE INDEX idx_sync_job_results_connection ON sync_job_results(connection_id);
