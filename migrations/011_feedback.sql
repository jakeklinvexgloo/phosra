-- Visual feedback system for UI review
CREATE TABLE IF NOT EXISTS ui_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_route TEXT NOT NULL,
    css_selector TEXT NOT NULL,
    component_hint TEXT,
    comment TEXT NOT NULL,
    reviewer_name TEXT NOT NULL DEFAULT 'Anonymous',
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'approved', 'dismissed', 'fixed')),
    viewport_width INTEGER,
    viewport_height INTEGER,
    click_x INTEGER,
    click_y INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_ui_feedback_status ON ui_feedback(status);
CREATE INDEX idx_ui_feedback_page ON ui_feedback(page_route);
