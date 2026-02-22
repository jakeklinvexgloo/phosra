-- Trackable deck sharing for investor portal
CREATE TABLE deck_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(32) UNIQUE NOT NULL,
    shared_by_phone VARCHAR(20) NOT NULL,
    shared_by_name VARCHAR(255) NOT NULL DEFAULT '',
    shared_by_company VARCHAR(255) NOT NULL DEFAULT '',
    recipient_hint VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE deck_share_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID NOT NULL REFERENCES deck_shares(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT
);

CREATE INDEX idx_deck_shares_token ON deck_shares(token);
CREATE INDEX idx_deck_share_views_share_id ON deck_share_views(share_id);
