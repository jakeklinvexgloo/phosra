-- 033_investor_auth.sql
-- SMS-first auth system for investor portal

BEGIN;

-- Approved phone numbers (admin-managed)
CREATE TABLE IF NOT EXISTS investor_approved_phones (
    id              BIGSERIAL PRIMARY KEY,
    phone_e164      TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL DEFAULT '',
    company         TEXT NOT NULL DEFAULT '',
    notes           TEXT NOT NULL DEFAULT '',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investor_phones_active ON investor_approved_phones (is_active) WHERE is_active = TRUE;

-- OTP codes (hashed, short-lived)
CREATE TABLE IF NOT EXISTS investor_otp_codes (
    id              BIGSERIAL PRIMARY KEY,
    phone_e164      TEXT NOT NULL,
    code_hash       TEXT NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    attempts        INT NOT NULL DEFAULT 0,
    used            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investor_otp_phone ON investor_otp_codes (phone_e164, created_at DESC);

-- Sessions (JWT-backed, server-side revocation)
CREATE TABLE IF NOT EXISTS investor_sessions (
    id              BIGSERIAL PRIMARY KEY,
    phone_e164      TEXT NOT NULL,
    token_hash      TEXT NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    user_agent      TEXT NOT NULL DEFAULT '',
    ip_address      TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investor_sessions_phone ON investor_sessions (phone_e164);
CREATE INDEX idx_investor_sessions_token ON investor_sessions (token_hash) WHERE revoked_at IS NULL;

-- Linked accounts (email / Google for convenience login)
CREATE TABLE IF NOT EXISTS investor_linked_accounts (
    id              BIGSERIAL PRIMARY KEY,
    phone_e164      TEXT NOT NULL REFERENCES investor_approved_phones(phone_e164) ON DELETE CASCADE,
    provider        TEXT NOT NULL CHECK (provider IN ('email', 'google')),
    provider_id     TEXT NOT NULL,
    provider_email  TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_id)
);

CREATE INDEX idx_investor_linked_phone ON investor_linked_accounts (phone_e164);
CREATE INDEX idx_investor_linked_provider ON investor_linked_accounts (provider, provider_id);

COMMIT;
