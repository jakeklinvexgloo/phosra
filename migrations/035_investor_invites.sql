-- Investor referral invite links (one-time shareable URLs)

CREATE TABLE investor_invite_links (
    id              BIGSERIAL PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    created_by      TEXT NOT NULL,              -- phone_e164 of referrer
    max_uses        INT NOT NULL DEFAULT 1,
    uses            INT NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE investor_invite_claims (
    id              BIGSERIAL PRIMARY KEY,
    invite_code     TEXT NOT NULL REFERENCES investor_invite_links(code),
    name            TEXT NOT NULL DEFAULT '',
    company         TEXT NOT NULL DEFAULT '',
    email           TEXT NOT NULL DEFAULT '',
    ip_address      TEXT NOT NULL DEFAULT '',
    user_agent      TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invite_links_code ON investor_invite_links(code);
CREATE INDEX idx_invite_links_created_by ON investor_invite_links(created_by);
CREATE INDEX idx_invite_claims_code ON investor_invite_claims(invite_code);
