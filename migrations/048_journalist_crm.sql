-- 048: Journalist CRM
-- Journalist profiles, pitch tracking, press-release linkage, and coverage tracking.
--
-- Design decision: SEPARATE tables rather than reusing admin_outreach_contacts.
-- Reasoning:
--   1. Journalists have fundamentally different fields (publication, beat, sub-beats,
--      recent articles, pitch angles) that don't map to the generic outreach schema.
--   2. The relationship pipeline is different: journalist relationships track
--      pitch → follow-up → coverage, not contact → conversation → partnership.
--   3. The linkage between press releases and journalists is a many-to-many with
--      rich metadata (embargo, exclusivity, pitch status) that would be awkward
--      to model through generic activities.
--   4. Separate tables avoid bloating the existing outreach system with
--      journalist-specific CHECK constraints and JSONB columns.
--   5. The existing outreach system has workers/automations tied to its schema;
--      changing it risks breaking those integrations.

-- ═══════════════════════════════════════════════════════════════════
-- 1. JOURNALIST PROFILES
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE admin_journalists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    name VARCHAR(255) NOT NULL,
    publication VARCHAR(255) NOT NULL,
    title VARCHAR(255),              -- e.g. "Senior Reporter", "Tech Editor"
    beat VARCHAR(100),               -- primary beat: "child_safety", "tech_policy", etc.
    sub_beats TEXT[],                -- e.g. ["COPPA", "age_verification", "ed_tech"]

    -- Contact info
    email VARCHAR(255),
    twitter_handle VARCHAR(255),     -- X / Twitter
    linkedin_url VARCHAR(500),
    signal_handle VARCHAR(255),
    phone VARCHAR(50),

    -- Scoring & tiering
    relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
    tier INTEGER NOT NULL DEFAULT 3 CHECK (tier >= 1 AND tier <= 3),

    -- Relationship pipeline
    relationship_status VARCHAR(30) NOT NULL DEFAULT 'identified'
        CHECK (relationship_status IN (
            'identified',         -- found but no contact yet
            'researching',        -- gathering info / reading their work
            'pitched',            -- sent initial pitch
            'in_dialogue',        -- ongoing conversation
            'warm_contact',       -- established relationship, responsive
            'champion',           -- actively covers us / strong advocate
            'inactive'            -- no longer covers relevant beats
        )),

    -- Rich data (JSONB)
    pitch_angles JSONB NOT NULL DEFAULT '[]',
        -- Array of { angle: string, context: string, relevance: string, press_release_id?: string }
    recent_articles JSONB NOT NULL DEFAULT '[]',
        -- Array of { title: string, url: string, date: string, relevance_note: string }
    coverage_preferences JSONB NOT NULL DEFAULT '{}',
        -- { prefers_exclusive: bool, preferred_contact_method: string, timezone: string, deadlines_note: string }

    -- Notes
    notes TEXT,

    -- Timestamps
    last_contact_at TIMESTAMPTZ,
    next_followup_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journalists_publication ON admin_journalists(publication);
CREATE INDEX idx_journalists_beat ON admin_journalists(beat);
CREATE INDEX idx_journalists_tier ON admin_journalists(tier);
CREATE INDEX idx_journalists_status ON admin_journalists(relationship_status);
CREATE INDEX idx_journalists_followup ON admin_journalists(next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX idx_journalists_sub_beats ON admin_journalists USING GIN(sub_beats);

-- ═══════════════════════════════════════════════════════════════════
-- 2. PRESS RELEASE ↔ JOURNALIST PITCHES (many-to-many linkage)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE admin_journalist_pitches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    journalist_id UUID NOT NULL REFERENCES admin_journalists(id) ON DELETE CASCADE,
    press_release_id UUID NOT NULL REFERENCES press_releases(id) ON DELETE CASCADE,

    -- Pitch details
    pitch_status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (pitch_status IN (
            'draft',              -- pitch being drafted
            'ready',              -- approved, ready to send
            'sent',               -- pitch email sent
            'opened',             -- email opened (if tracking available)
            'replied',            -- journalist responded
            'interested',         -- journalist expressed interest
            'declined',           -- journalist passed
            'covered',            -- journalist published coverage
            'no_response'         -- no response after follow-ups
        )),

    -- Exclusivity & embargo
    offered_exclusive BOOLEAN NOT NULL DEFAULT FALSE,
    exclusive_deadline TIMESTAMPTZ,       -- when exclusivity expires
    embargo_agreed BOOLEAN NOT NULL DEFAULT FALSE,
    embargo_date TIMESTAMPTZ,

    -- Pitch content
    pitch_subject TEXT,
    pitch_body TEXT,
    pitch_angle TEXT,                     -- which angle was used

    -- Email tracking
    gmail_thread_id VARCHAR(255),
    gmail_message_id VARCHAR(255),

    -- Follow-up tracking
    follow_up_count INTEGER NOT NULL DEFAULT 0,
    last_follow_up_at TIMESTAMPTZ,
    next_follow_up_at TIMESTAMPTZ,

    -- Result
    coverage_id UUID,                     -- filled in when coverage is recorded (FK added after coverage table)

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One pitch per journalist per release
    UNIQUE (journalist_id, press_release_id)
);

CREATE INDEX idx_pitches_journalist ON admin_journalist_pitches(journalist_id);
CREATE INDEX idx_pitches_release ON admin_journalist_pitches(press_release_id);
CREATE INDEX idx_pitches_status ON admin_journalist_pitches(pitch_status);
CREATE INDEX idx_pitches_followup ON admin_journalist_pitches(next_follow_up_at)
    WHERE next_follow_up_at IS NOT NULL AND pitch_status NOT IN ('covered', 'declined', 'no_response');

-- ═══════════════════════════════════════════════════════════════════
-- 3. COVERAGE TRACKING
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE admin_press_coverage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Links
    journalist_id UUID NOT NULL REFERENCES admin_journalists(id) ON DELETE CASCADE,
    press_release_id UUID REFERENCES press_releases(id) ON DELETE SET NULL,
    pitch_id UUID REFERENCES admin_journalist_pitches(id) ON DELETE SET NULL,

    -- Article details
    article_title TEXT NOT NULL,
    article_url TEXT NOT NULL,
    publication VARCHAR(255) NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,

    -- Analysis
    tone VARCHAR(20) NOT NULL DEFAULT 'neutral'
        CHECK (tone IN ('positive', 'neutral', 'negative', 'mixed')),
    phosra_prominence VARCHAR(20) NOT NULL DEFAULT 'mentioned'
        CHECK (phosra_prominence IN ('primary_subject', 'featured', 'mentioned', 'brief_mention')),
    quotes_used JSONB NOT NULL DEFAULT '[]',
        -- Array of { quote: string, attributed_to: string }
    key_messages_included TEXT[],        -- which key messages made it in

    -- Reach
    estimated_reach INTEGER,             -- estimated readership/impressions
    domain_authority INTEGER,            -- publication DA score if known

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coverage_journalist ON admin_press_coverage(journalist_id);
CREATE INDEX idx_coverage_release ON admin_press_coverage(press_release_id);
CREATE INDEX idx_coverage_published ON admin_press_coverage(published_at DESC);
CREATE INDEX idx_coverage_tone ON admin_press_coverage(tone);

-- Add FK from pitches → coverage now that coverage table exists
ALTER TABLE admin_journalist_pitches
    ADD CONSTRAINT fk_pitches_coverage
    FOREIGN KEY (coverage_id) REFERENCES admin_press_coverage(id) ON DELETE SET NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 4. JOURNALIST ACTIVITY LOG
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE admin_journalist_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journalist_id UUID NOT NULL REFERENCES admin_journalists(id) ON DELETE CASCADE,
    pitch_id UUID REFERENCES admin_journalist_pitches(id) ON DELETE SET NULL,

    activity_type VARCHAR(50) NOT NULL
        CHECK (activity_type IN (
            'pitch_sent', 'follow_up_sent', 'reply_received',
            'phone_call', 'meeting', 'dm_sent', 'dm_received',
            'coverage_published', 'note', 'status_change'
        )),

    subject VARCHAR(500),
    body TEXT,
    metadata JSONB,                      -- flexible: { gmail_message_id, old_status, new_status, etc. }

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journalist_activities_journalist ON admin_journalist_activities(journalist_id, created_at DESC);
CREATE INDEX idx_journalist_activities_pitch ON admin_journalist_activities(pitch_id) WHERE pitch_id IS NOT NULL;
