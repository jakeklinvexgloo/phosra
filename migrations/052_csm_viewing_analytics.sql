-- 052_csm_viewing_analytics.sql
-- CSM review cache + viewing history analytics

CREATE TABLE IF NOT EXISTS csm_reviews (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    csm_slug          VARCHAR(255) NOT NULL UNIQUE,
    csm_url           TEXT NOT NULL DEFAULT '',
    csm_media_type    VARCHAR(50) NOT NULL DEFAULT '',
    title             TEXT NOT NULL,
    age_rating        VARCHAR(20) DEFAULT '',
    age_range_min     INT,
    quality_stars     INT,
    is_family_friendly BOOLEAN,
    review_summary    TEXT DEFAULT '',
    review_body       TEXT DEFAULT '',
    parent_summary    TEXT DEFAULT '',
    descriptors_json  JSONB DEFAULT '[]'::jsonb,
    date_published    DATE,
    scraped_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csm_reviews_slug ON csm_reviews (csm_slug);
CREATE INDEX IF NOT EXISTS idx_csm_reviews_title ON csm_reviews USING gin (to_tsvector('english', title));

CREATE TABLE IF NOT EXISTS viewing_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id       UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    platform        VARCHAR(50) NOT NULL DEFAULT 'netflix',
    title           TEXT NOT NULL,
    series_title    TEXT,
    watched_date    DATE,
    netflix_profile VARCHAR(100) DEFAULT '',
    csm_review_id   UUID REFERENCES csm_reviews(id) ON DELETE SET NULL,
    match_confidence REAL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_viewing_history_child ON viewing_history (child_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_family ON viewing_history (family_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_viewing_history_dedup
    ON viewing_history (child_id, platform, title, COALESCE(watched_date, '1970-01-01'::date));
