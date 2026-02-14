-- Phosra Privacy & Consent Service: manages data deletion requests, consent gates, and data sharing controls
CREATE TABLE IF NOT EXISTS privacy_requests (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL,
    platform_id VARCHAR(50) NOT NULL DEFAULT 'all',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    config JSONB NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_privacy_requests_child ON privacy_requests(child_id);
CREATE INDEX idx_privacy_requests_status ON privacy_requests(status);
