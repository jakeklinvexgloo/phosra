-- 032_outreach_autopilot.sql
-- Outreach Autopilot: multi-account Google OAuth, sequences, pending emails, config

-- ── 1. Multi-account Google tokens ─────────────────────────────
-- Current table uses id=1 single-row constraint. Convert to account_key-based.

-- Add account_key column
ALTER TABLE admin_google_tokens ADD COLUMN account_key VARCHAR(50);

-- Set existing row to 'personal'
UPDATE admin_google_tokens SET account_key = 'personal' WHERE id = 1;

-- Drop old PK and check constraint
ALTER TABLE admin_google_tokens DROP CONSTRAINT admin_google_tokens_pkey;
ALTER TABLE admin_google_tokens DROP CONSTRAINT admin_google_tokens_id_check;

-- Drop id column entirely
ALTER TABLE admin_google_tokens DROP COLUMN id;

-- Make account_key NOT NULL and PK
ALTER TABLE admin_google_tokens ALTER COLUMN account_key SET NOT NULL;
ALTER TABLE admin_google_tokens ADD PRIMARY KEY (account_key);

-- ── 2. Outreach sequences ──────────────────────────────────────

CREATE TABLE admin_outreach_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES admin_outreach_contacts(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    current_step INTEGER NOT NULL DEFAULT 0
        CHECK (current_step >= 0 AND current_step <= 3),
    next_action_at TIMESTAMPTZ,
    last_sent_at TIMESTAMPTZ,
    gmail_thread_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (contact_id)
);

CREATE INDEX idx_sequences_active_next ON admin_outreach_sequences (status, next_action_at)
    WHERE status = 'active';

-- ── 3. Pending emails (approval queue) ─────────────────────────

CREATE TABLE admin_outreach_pending_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES admin_outreach_contacts(id) ON DELETE CASCADE,
    sequence_id UUID REFERENCES admin_outreach_sequences(id) ON DELETE SET NULL,
    step_number INTEGER NOT NULL DEFAULT 0,
    to_email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_review'
        CHECK (status IN ('pending_review', 'approved', 'rejected', 'sent', 'failed')),
    gmail_message_id VARCHAR(255),
    generation_model VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pending_emails_status ON admin_outreach_pending_emails (status);

-- ── 4. Outreach config (single-row) ────────────────────────────

CREATE TABLE admin_outreach_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    autopilot_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    sender_name VARCHAR(100) NOT NULL DEFAULT 'Alex Chen',
    sender_title VARCHAR(100) NOT NULL DEFAULT 'Head of Partnerships',
    sender_email VARCHAR(255) NOT NULL DEFAULT 'alex@phosra.com',
    company_brief TEXT NOT NULL DEFAULT 'Phosra is a universal parental controls API that helps platforms comply with child safety laws like COPPA, KOSA, and the EU Digital Services Act. We provide a single integration point for age verification, content filtering, screen time controls, and parental consent — replacing months of custom development with a single API call.',
    email_signature TEXT NOT NULL DEFAULT E'Best,\nAlex Chen\nHead of Partnerships, Phosra\nalex@phosra.com',
    send_hour_utc INTEGER NOT NULL DEFAULT 13 CHECK (send_hour_utc >= 0 AND send_hour_utc <= 23),
    max_emails_per_day INTEGER NOT NULL DEFAULT 20 CHECK (max_emails_per_day >= 1 AND max_emails_per_day <= 100),
    follow_up_delay_days INTEGER NOT NULL DEFAULT 3 CHECK (follow_up_delay_days >= 1 AND follow_up_delay_days <= 30),
    google_account_key VARCHAR(50) NOT NULL DEFAULT 'outreach',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default config
INSERT INTO admin_outreach_config (id) VALUES (1);

-- ── 5. Expand activity types ───────────────────────────────────

-- Add new activity types + columns for autopilot tracking
ALTER TABLE admin_outreach_activities
    ADD COLUMN intent_classification VARCHAR(30),
    ADD COLUMN confidence_score NUMERIC(4,2);

-- Widen activity_type check to include autopilot types
ALTER TABLE admin_outreach_activities DROP CONSTRAINT IF EXISTS admin_outreach_activities_activity_type_check;
-- (If no named constraint exists, the column may have no CHECK. That's fine.)
