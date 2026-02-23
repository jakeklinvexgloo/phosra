CREATE TABLE IF NOT EXISTS safe_agreements (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_phone       TEXT NOT NULL,
    investor_name        TEXT NOT NULL,
    investor_email       TEXT NOT NULL DEFAULT '',
    investor_company     TEXT NOT NULL DEFAULT '',
    investment_amount_cents BIGINT NOT NULL,
    valuation_cap_cents  BIGINT NOT NULL DEFAULT 600000000,
    safe_type            TEXT NOT NULL DEFAULT 'post_money_cap',
    status               TEXT NOT NULL DEFAULT 'pending_investor',
    -- statuses: pending_investor | investor_signed | countersigned | voided
    investor_signed_at   TIMESTAMPTZ,
    investor_signature   TEXT NOT NULL DEFAULT '',
    investor_sign_ip     TEXT NOT NULL DEFAULT '',
    investor_sign_ua     TEXT NOT NULL DEFAULT '',
    document_hash        TEXT NOT NULL DEFAULT '',
    company_signed_at    TIMESTAMPTZ,
    company_signature    TEXT NOT NULL DEFAULT '',
    company_sign_ip      TEXT NOT NULL DEFAULT '',
    pdf_generated        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safe_investor_phone ON safe_agreements(investor_phone);
CREATE INDEX IF NOT EXISTS idx_safe_status ON safe_agreements(status);
