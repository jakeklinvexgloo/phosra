-- 029_google_workspace.sql
-- Google Workspace integration: OAuth token storage + Gmail message linking

-- Single-row table for Google OAuth tokens (single admin user)
CREATE TABLE admin_google_tokens (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    google_email VARCHAR(255) NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    token_expiry TIMESTAMPTZ NOT NULL,
    scopes TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Link outreach activities to Gmail messages
ALTER TABLE admin_outreach_activities
    ADD COLUMN gmail_message_id VARCHAR(255),
    ADD COLUMN gmail_thread_id VARCHAR(255);
