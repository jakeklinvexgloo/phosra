-- 053_csm_deep_descriptors.sql
-- Add deep CSM review data: age explanation, positive content, and normalized descriptors table.

-- New columns on csm_reviews
ALTER TABLE csm_reviews ADD COLUMN IF NOT EXISTS age_explanation TEXT DEFAULT '';
ALTER TABLE csm_reviews ADD COLUMN IF NOT EXISTS positive_content JSONB DEFAULT '[]'::jsonb;

-- Normalized descriptors table for richer per-category data
CREATE TABLE IF NOT EXISTS csm_descriptors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    csm_review_id   UUID NOT NULL REFERENCES csm_reviews(id) ON DELETE CASCADE,
    category        VARCHAR(100) NOT NULL,
    level_text      VARCHAR(50) DEFAULT '',
    numeric_level   INT DEFAULT 0,
    description     TEXT DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csm_descriptors_review ON csm_descriptors (csm_review_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_csm_descriptors_dedup
    ON csm_descriptors (csm_review_id, category);
