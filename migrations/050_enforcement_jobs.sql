-- 048: Browser Enforcement Jobs
-- Adds enforcement job queue, session cache, and audit log for browser-based enforcement

-- Enforcement jobs queue
CREATE TABLE IF NOT EXISTS browser_enforcement_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    child_id UUID,
    child_name TEXT NOT NULL,
    child_age INTEGER NOT NULL,
    platform_id TEXT NOT NULL,
    rules JSONB NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pending',
    result JSONB,
    error_message TEXT,
    screenshots JSONB DEFAULT '[]',
    deployment_model TEXT NOT NULL DEFAULT 'local',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_browser_enforcement_jobs_family ON browser_enforcement_jobs(family_id);
CREATE INDEX IF NOT EXISTS idx_browser_enforcement_jobs_status ON browser_enforcement_jobs(status);
CREATE INDEX IF NOT EXISTS idx_browser_enforcement_jobs_platform ON browser_enforcement_jobs(platform_id);

-- Session cache for persisted browser sessions
CREATE TABLE IF NOT EXISTS platform_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    platform_id TEXT NOT NULL,
    encrypted_storage_state BYTEA NOT NULL,
    encryption_key_id TEXT,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(family_id, platform_id)
);

-- Enforcement audit log (immutable)
CREATE TABLE IF NOT EXISTS browser_enforcement_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES browser_enforcement_jobs(id),
    action TEXT NOT NULL,
    rule_category TEXT,
    status TEXT NOT NULL,
    details JSONB,
    screenshot_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_browser_enforcement_audit_job ON browser_enforcement_audit_log(job_id);
