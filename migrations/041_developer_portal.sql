-- Developer organizations
CREATE TABLE IF NOT EXISTS developer_orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    website_url VARCHAR(500) DEFAULT '',
    logo_url VARCHAR(500) DEFAULT '',
    owner_user_id UUID NOT NULL REFERENCES users(id),
    tier VARCHAR(50) NOT NULL DEFAULT 'free'
        CHECK (tier IN ('free', 'growth', 'enterprise')),
    rate_limit_rpm INT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_orgs_owner ON developer_orgs(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_dev_orgs_slug ON developer_orgs(slug);

-- Developer org members
CREATE TABLE IF NOT EXISTS developer_org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES developer_orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- Developer API keys
CREATE TABLE IF NOT EXISTS developer_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES developer_orgs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(30) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE,
    environment VARCHAR(10) NOT NULL DEFAULT 'live'
        CHECK (environment IN ('live', 'test')),
    scopes TEXT[] NOT NULL DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    last_used_ip INET,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_keys_org ON developer_api_keys(org_id);
CREATE INDEX IF NOT EXISTS idx_dev_keys_hash ON developer_api_keys(key_hash) WHERE revoked_at IS NULL;

-- API usage tracking (hourly rollups)
CREATE TABLE IF NOT EXISTS developer_api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID NOT NULL REFERENCES developer_api_keys(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES developer_orgs(id) ON DELETE CASCADE,
    hour TIMESTAMPTZ NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    status_2xx INT NOT NULL DEFAULT 0,
    status_4xx INT NOT NULL DEFAULT 0,
    status_5xx INT NOT NULL DEFAULT 0,
    total_requests INT NOT NULL DEFAULT 0,
    UNIQUE(key_id, hour, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_dev_usage_org_hour ON developer_api_usage(org_id, hour DESC);

-- Key lifecycle audit log
CREATE TABLE IF NOT EXISTS developer_key_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID NOT NULL REFERENCES developer_api_keys(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL
        CHECK (event_type IN ('created', 'regenerated', 'revoked', 'scopes_changed', 'expired')),
    actor_user_id UUID REFERENCES users(id),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_key_events ON developer_key_events(key_id, created_at DESC);
