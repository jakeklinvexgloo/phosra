-- 042_sources.sql: Parental control source connections for the Sources API.
-- Lets 3rd-party parental control apps (Bark, Qustodio, etc.) receive Phosra
-- policies and enforce them on behalf of families.

-- Parental control source connections
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    source_slug TEXT NOT NULL,                     -- e.g., "bark", "qustodio", "apple-screen-time"
    display_name TEXT NOT NULL,                    -- e.g., "Bark", "Qustodio"
    api_tier TEXT NOT NULL CHECK (api_tier IN ('managed', 'guided')),
    credentials TEXT,                              -- AES-256-GCM encrypted (NULL for guided)
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'connected', 'syncing', 'error', 'disconnected')),
    auto_sync BOOLEAN NOT NULL DEFAULT false,
    capabilities JSONB NOT NULL DEFAULT '[]',      -- negotiated capabilities
    config JSONB NOT NULL DEFAULT '{}',            -- source-specific configuration
    last_sync_at TIMESTAMPTZ,
    last_sync_status TEXT,
    sync_version INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    webhook_secret TEXT,                           -- for inbound webhooks from this source
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sources_child ON sources(child_id);
CREATE INDEX idx_sources_family ON sources(family_id);
CREATE INDEX idx_sources_slug ON sources(source_slug);
CREATE UNIQUE INDEX idx_sources_child_slug ON sources(child_id, source_slug);

-- Source sync jobs (tracks each push/pull operation)
CREATE TABLE source_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    sync_mode TEXT NOT NULL CHECK (sync_mode IN ('full', 'incremental', 'single_rule')),
    trigger_type TEXT NOT NULL DEFAULT 'manual'
        CHECK (trigger_type IN ('manual', 'auto', 'webhook', 'policy_change')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'completed', 'failed', 'partial')),
    rules_pushed INTEGER NOT NULL DEFAULT 0,
    rules_skipped INTEGER NOT NULL DEFAULT 0,
    rules_failed INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_jobs_source ON source_sync_jobs(source_id, created_at DESC);

-- Per-rule sync results within a job
CREATE TABLE source_sync_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES source_sync_jobs(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    rule_category TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pushed', 'skipped', 'failed', 'unsupported')),
    source_value JSONB,                            -- what was pushed
    source_response JSONB,                         -- response from source API
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_results_job ON source_sync_results(job_id);

-- Source capability registry (what each source supports)
CREATE TABLE source_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_slug TEXT NOT NULL,
    rule_category TEXT NOT NULL,
    support_level TEXT NOT NULL CHECK (support_level IN ('full', 'partial', 'none')),
    read_write TEXT NOT NULL DEFAULT 'push_only'
        CHECK (read_write IN ('push_only', 'pull_only', 'bidirectional')),
    notes TEXT,
    UNIQUE(source_slug, rule_category)
);

CREATE INDEX idx_source_caps_slug ON source_capabilities(source_slug);

-- Inbound events from sources (for drift detection)
CREATE TABLE source_inbound_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,                      -- e.g., "rule_changed", "status_update", "drift_detected"
    payload JSONB NOT NULL DEFAULT '{}',
    processed BOOLEAN NOT NULL DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inbound_events_source ON source_inbound_events(source_id, created_at DESC);
CREATE INDEX idx_inbound_events_unprocessed ON source_inbound_events(processed) WHERE processed = false;
