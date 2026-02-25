CREATE TABLE press_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT '',
    subtitle TEXT NOT NULL DEFAULT '',
    slug TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'idea'
        CHECK (status IN ('idea', 'draft', 'in_review', 'approved', 'scheduled', 'distributed', 'archived')),
    release_type TEXT NOT NULL DEFAULT 'product_launch'
        CHECK (release_type IN (
            'product_launch', 'partnership', 'funding', 'executive_hire',
            'regulatory', 'research', 'event', 'expansion', 'milestone', 'other'
        )),
    dateline_city TEXT NOT NULL DEFAULT '',
    dateline_state TEXT NOT NULL DEFAULT '',
    publish_date TIMESTAMPTZ,
    embargo_date TIMESTAMPTZ,
    headline TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    quotes JSONB NOT NULL DEFAULT '[]',
    boilerplate TEXT NOT NULL DEFAULT '',
    contact_name TEXT NOT NULL DEFAULT '',
    contact_email TEXT NOT NULL DEFAULT '',
    contact_phone TEXT NOT NULL DEFAULT '',
    draft_inputs JSONB NOT NULL DEFAULT '{}',
    revision_history JSONB NOT NULL DEFAULT '[]',
    notes TEXT NOT NULL DEFAULT '',
    word_count INTEGER NOT NULL DEFAULT 0,
    created_by TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_press_releases_slug ON press_releases(slug) WHERE slug != '';
CREATE INDEX idx_press_releases_status ON press_releases(status);
CREATE INDEX idx_press_releases_publish_date ON press_releases(publish_date);
CREATE INDEX idx_press_releases_created_at ON press_releases(created_at DESC);
