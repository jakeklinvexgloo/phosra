-- 047: Gmail History Import
-- Adds sync state tracking, dedup index, and contact email lookup

-- Sync state per Google account
CREATE TABLE IF NOT EXISTS admin_gmail_sync_state (
    account_key VARCHAR(50) PRIMARY KEY,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_epoch_ms BIGINT NOT NULL DEFAULT 0,
    messages_imported INTEGER NOT NULL DEFAULT 0,
    contacts_created INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dedup index on activities
CREATE UNIQUE INDEX IF NOT EXISTS idx_activities_gmail_message_id
    ON admin_outreach_activities(gmail_message_id)
    WHERE gmail_message_id IS NOT NULL;

-- Fast contact lookup by email
CREATE INDEX IF NOT EXISTS idx_contacts_email
    ON admin_outreach_contacts(email)
    WHERE email IS NOT NULL;
