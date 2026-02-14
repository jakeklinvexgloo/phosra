-- Phosra Social, Location, Purchase, and Content Classification services

-- Social policies: chat control, DM restrictions, contact management
CREATE TABLE IF NOT EXISTS social_policies (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    platform_id VARCHAR(50) NOT NULL,
    policy_type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_policies_child ON social_policies(child_id);
CREATE UNIQUE INDEX idx_social_policies_child_platform_type ON social_policies(child_id, platform_id, policy_type);

-- Location logs: device-reported locations for providers that lack native tracking
CREATE TABLE IF NOT EXISTS location_logs (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    device_id VARCHAR(100) NOT NULL DEFAULT '',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL DEFAULT 0,
    recorded_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_location_logs_child ON location_logs(child_id);
CREATE INDEX idx_location_logs_recorded ON location_logs(recorded_at DESC);

-- Purchase approvals: parent approval workflow for purchases
CREATE TABLE IF NOT EXISTS purchase_approvals (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    platform_id VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id)
);

CREATE INDEX idx_purchase_approvals_child ON purchase_approvals(child_id);
CREATE INDEX idx_purchase_approvals_status ON purchase_approvals(status);

-- Content classifications: Phosra-managed content rating when providers lack native support
CREATE TABLE IF NOT EXISTS content_classifications (
    id UUID PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(255) NOT NULL,
    rating_system VARCHAR(20) NOT NULL,
    rating VARCHAR(20) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    source VARCHAR(50) NOT NULL DEFAULT 'phosra_ai',
    classified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_content_classifications_unique ON content_classifications(content_type, content_id, rating_system);
