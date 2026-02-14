-- Phosra Age Verification Service: manages age gates, consent gates, and social media minimum age enforcement
CREATE TABLE IF NOT EXISTS age_verification_records (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL,
    platform_id VARCHAR(50) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_age_verification_child ON age_verification_records(child_id);
CREATE INDEX idx_age_verification_child_platform ON age_verification_records(child_id, platform_id);
