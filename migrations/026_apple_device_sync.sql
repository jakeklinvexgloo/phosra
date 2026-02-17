-- 026_apple_device_sync.sql
-- Adds policy versioning, device registrations, and device reports
-- for the Apple on-device integration (FamilyControls / Screen Time).

-- 1. Policy version tracking (auto-increments on every UPDATE to child_policies)
ALTER TABLE child_policies ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION bump_policy_version() RETURNS trigger AS $$
BEGIN
    NEW.version := OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_policy_version
    BEFORE UPDATE ON child_policies FOR EACH ROW
    EXECUTE FUNCTION bump_policy_version();

-- 2. Bump policy version when rules change
-- INSERT/UPDATE/DELETE on policy_rules triggers a touch on child_policies.updated_at,
-- which fires the version bump trigger above.
CREATE OR REPLACE FUNCTION touch_policy_on_rule_change() RETURNS trigger AS $$
BEGIN
    UPDATE child_policies SET updated_at = NOW()
    WHERE id = COALESCE(NEW.policy_id, OLD.policy_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rule_change_bumps_policy
    AFTER INSERT OR UPDATE OR DELETE ON policy_rules
    FOR EACH ROW
    EXECUTE FUNCTION touch_policy_on_rule_change();

-- 3. Device registrations (iOS app instances per child)
CREATE TABLE device_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    platform_id VARCHAR(50) NOT NULL DEFAULT 'apple',
    device_name VARCHAR(255) NOT NULL DEFAULT '',
    device_model VARCHAR(100) NOT NULL DEFAULT '',
    os_version VARCHAR(20) NOT NULL DEFAULT '',
    app_version VARCHAR(20) NOT NULL DEFAULT '',
    apns_token VARCHAR(255),
    api_key_hash VARCHAR(64),
    last_seen_at TIMESTAMPTZ,
    last_policy_version INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_reg_child ON device_registrations(child_id);
CREATE INDEX idx_device_reg_family ON device_registrations(family_id);
CREATE UNIQUE INDEX idx_device_reg_apns ON device_registrations(apns_token) WHERE apns_token IS NOT NULL;
CREATE UNIQUE INDEX idx_device_reg_api_key ON device_registrations(api_key_hash) WHERE api_key_hash IS NOT NULL;

-- 4. Device reports (activity data from iOS app)
CREATE TABLE device_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES device_registrations(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    reported_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_reports_child ON device_reports(child_id);
CREATE INDEX idx_device_reports_device ON device_reports(device_id);
CREATE INDEX idx_device_reports_reported ON device_reports(reported_at DESC);
