-- Phosra Analytics Service: aggregates monitoring data across providers into unified reports
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    platform_id VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    detail JSONB NOT NULL DEFAULT '{}',
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_child ON activity_logs(child_id);
CREATE INDEX idx_activity_logs_recorded ON activity_logs(recorded_at DESC);
CREATE INDEX idx_activity_logs_child_platform ON activity_logs(child_id, platform_id);
