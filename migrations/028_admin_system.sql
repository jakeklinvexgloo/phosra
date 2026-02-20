-- Migration 028: Admin system tables
-- Adds is_admin flag to users and creates admin-specific tables for
-- outreach CRM, worker run tracking, news feed, and compliance alerts.

-- Add admin flag to users
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── Outreach contacts (seeded from existing markdown files) ───

CREATE TABLE admin_outreach_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    org VARCHAR(255),
    title VARCHAR(255),
    contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN ('advocacy', 'tech_company', 'legislator', 'academic', 'other')),
    email VARCHAR(255),
    linkedin_url VARCHAR(500),
    twitter_handle VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'not_contacted' CHECK (status IN ('not_contacted', 'reached_out', 'in_conversation', 'partnership', 'declined')),
    notes TEXT,
    relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
    tags TEXT[],
    last_contact_at TIMESTAMPTZ,
    next_followup_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outreach_status ON admin_outreach_contacts(status);
CREATE INDEX idx_outreach_type ON admin_outreach_contacts(contact_type);
CREATE INDEX idx_outreach_followup ON admin_outreach_contacts(next_followup_at) WHERE next_followup_at IS NOT NULL;

-- ─── Outreach activity log ───

CREATE TABLE admin_outreach_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES admin_outreach_contacts(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('email_sent', 'linkedin_message', 'call', 'meeting', 'note')),
    subject VARCHAR(500),
    body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outreach_activities_contact ON admin_outreach_activities(contact_id, created_at DESC);

-- ─── Worker run history ───

CREATE TABLE admin_worker_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    trigger_type VARCHAR(30) NOT NULL DEFAULT 'cron' CHECK (trigger_type IN ('cron', 'manual')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    output_summary TEXT,
    items_processed INTEGER DEFAULT 0,
    error_message TEXT
);

CREATE INDEX idx_worker_runs_worker ON admin_worker_runs(worker_id, started_at DESC);

-- ─── News feed items ───

CREATE TABLE admin_news_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    source VARCHAR(255) NOT NULL,
    url VARCHAR(1000),
    published_at TIMESTAMPTZ,
    relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
    summary TEXT,
    tags TEXT[],
    is_saved BOOLEAN NOT NULL DEFAULT FALSE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_created ON admin_news_items(created_at DESC);
CREATE INDEX idx_news_tags ON admin_news_items USING GIN(tags);

-- ─── Compliance deadline alerts ───

CREATE TABLE admin_compliance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    law_id VARCHAR(100) NOT NULL,
    law_name VARCHAR(255) NOT NULL,
    deadline_date DATE NOT NULL,
    description TEXT,
    urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'action_needed', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compliance_alerts_deadline ON admin_compliance_alerts(deadline_date) WHERE status != 'resolved';
