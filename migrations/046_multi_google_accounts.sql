-- 046: Multi-Google-account support for outreach
-- Adds google_account_key to pending emails and creates persona-to-account mapping table.

-- Add google_account_key to pending emails so each email records which account sends it
ALTER TABLE admin_outreach_pending_emails
    ADD COLUMN IF NOT EXISTS google_account_key VARCHAR(50) NOT NULL DEFAULT 'outreach';

-- Persona-to-account mapping table
CREATE TABLE IF NOT EXISTS admin_outreach_persona_accounts (
    persona_key VARCHAR(50) PRIMARY KEY,
    google_account_key VARCHAR(50) NOT NULL,
    calendar_account_key VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed defaults
INSERT INTO admin_outreach_persona_accounts (persona_key, google_account_key, calendar_account_key, display_name, sender_email)
VALUES
    ('alex', 'outreach', 'outreach', 'Alex Chen', 'alex@phosra.com'),
    ('jake', 'jake', 'jake', 'Jake Klinvex', 'jake.k.klinvex@phosra.com')
ON CONFLICT (persona_key) DO NOTHING;
