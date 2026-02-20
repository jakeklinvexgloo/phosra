-- Migration 031: AI Pitch Coaching
-- Real-time voice mock calls with AI personas + post-session feedback

-- ─── Pitch coaching sessions ───
CREATE TABLE admin_pitch_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Configuration
    persona VARCHAR(50) NOT NULL CHECK (persona IN ('investor', 'partner', 'legislator')),
    persona_config JSONB NOT NULL DEFAULT '{}',

    -- Session state
    status VARCHAR(30) NOT NULL DEFAULT 'configuring'
        CHECK (status IN ('configuring', 'active', 'processing', 'completed', 'failed')),

    -- Timing
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- Recording
    recording_path VARCHAR(500),
    recording_size_bytes BIGINT,

    -- Transcript (from OpenAI Realtime events)
    transcript JSONB,                  -- [{speaker, text, start_ms, end_ms}, ...]

    -- AI Feedback (from GPT-4o coaching analysis)
    feedback JSONB,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pitch_sessions_user ON admin_pitch_sessions(user_id, created_at DESC);
CREATE INDEX idx_pitch_sessions_status ON admin_pitch_sessions(status);

-- ─── Per-session metrics (detailed breakdown) ───
CREATE TABLE admin_pitch_session_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES admin_pitch_sessions(id) ON DELETE CASCADE,

    -- Speech metrics
    filler_word_count INTEGER DEFAULT 0,
    filler_words JSONB DEFAULT '[]',       -- ["um", "uh", "like", ...]
    words_per_minute NUMERIC(6,2),
    silence_percentage NUMERIC(5,2),

    -- Content metrics
    clarity_score INTEGER CHECK (clarity_score >= 0 AND clarity_score <= 100),
    persuasion_score INTEGER CHECK (persuasion_score >= 0 AND persuasion_score <= 100),
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    structure_score INTEGER CHECK (structure_score >= 0 AND structure_score <= 100),

    -- Emotional analysis (Phase 3: Hume AI)
    emotion_data JSONB,
    dominant_emotions JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pitch_metrics_session ON admin_pitch_session_metrics(session_id);
