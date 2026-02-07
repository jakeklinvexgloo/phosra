-- 006: Providers and provider connections
CREATE TABLE providers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('dns', 'streaming', 'gaming', 'device', 'browser')),
    tier VARCHAR(10) NOT NULL CHECK (tier IN ('live', 'partial', 'stub')),
    description TEXT NOT NULL DEFAULT '',
    icon_url TEXT NOT NULL DEFAULT '',
    auth_type VARCHAR(20) NOT NULL CHECK (auth_type IN ('api_key', 'oauth2', 'manual')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE provider_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    provider_id VARCHAR(50) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
    encrypted_creds TEXT NOT NULL DEFAULT '',
    external_id VARCHAR(255),
    last_sync_at TIMESTAMPTZ,
    last_sync_status VARCHAR(20),
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(family_id, provider_id)
);

CREATE INDEX idx_provider_connections_family ON provider_connections(family_id);
CREATE INDEX idx_provider_connections_provider ON provider_connections(provider_id);
