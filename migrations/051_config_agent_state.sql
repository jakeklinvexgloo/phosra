-- 051: Config agent state persistence
-- Stores Netflix (and future platform) config agent wizard state so users
-- can resume configuration across app restarts without completing all steps.

CREATE TABLE IF NOT EXISTS config_agent_states (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform    VARCHAR(50) NOT NULL DEFAULT 'netflix',
    state       JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_config_agent_states_user
    ON config_agent_states (user_id);
