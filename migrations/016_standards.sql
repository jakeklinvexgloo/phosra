-- 016_standards.sql — Community Standards: movement-defined, API-enforced rule packages
--
-- Standards allow organizations (Wait Until 8th, The Anxious Generation, etc.)
-- to define packaged rule sets that families can adopt with one click.
-- Phosra then enforces the standard's rules across every connected platform.

CREATE TABLE IF NOT EXISTS standards (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT UNIQUE NOT NULL,            -- "four-norms", "wait-until-8th"
    name        TEXT NOT NULL,
    organization TEXT NOT NULL,                  -- "The Anxious Generation"
    description TEXT NOT NULL,
    long_description TEXT NOT NULL DEFAULT '',
    icon_url    TEXT,
    version     TEXT NOT NULL DEFAULT '1.0',
    published   BOOLEAN NOT NULL DEFAULT false,
    min_age     INT,                             -- minimum child age for this standard
    max_age     INT,                             -- maximum child age
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS standard_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    category    TEXT NOT NULL,                   -- maps to domain.RuleCategory
    label       TEXT NOT NULL DEFAULT '',
    enabled     BOOLEAN NOT NULL DEFAULT true,
    config      JSONB NOT NULL DEFAULT '{}',     -- same shape as policy_rules.config
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS child_standard_adoptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    standard_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
    adopted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(child_id, standard_id)
);

CREATE INDEX IF NOT EXISTS idx_standard_rules_standard ON standard_rules(standard_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_child ON child_standard_adoptions(child_id);
CREATE INDEX IF NOT EXISTS idx_adoptions_standard ON child_standard_adoptions(standard_id);

-- Seed the four initial community standards
INSERT INTO standards (slug, name, organization, description, long_description, version, published, min_age, max_age) VALUES
(
    'four-norms',
    'Four Norms',
    'The Anxious Generation',
    'Jonathan Haidt''s four foundational norms for a phone-free childhood.',
    'Based on The Anxious Generation by Jonathan Haidt, the Four Norms represent a research-backed framework for protecting children from the harms of smartphone-based childhood.',
    '1.0',
    true,
    0,
    16
),
(
    'wait-until-8th',
    'Wait Until 8th',
    'Wait Until 8th',
    'A community pledge to delay smartphones until at least 8th grade.',
    'Wait Until 8th is a grassroots movement of over 130,000 families who pledge to wait until at least 8th grade before giving their children a smartphone.',
    '1.0',
    true,
    0,
    14
),
(
    'screen-smart-family',
    'Screen-Smart Family',
    'Phosra',
    'Phosra''s recommended baseline for balanced screen time and online safety.',
    'The Screen-Smart Family standard is Phosra''s own curated best-practice ruleset, designed by child development experts and informed by current legislation.',
    '1.0',
    true,
    0,
    17
),
(
    'screen-free-schools',
    'Screen-Free Schools',
    'Screen Time Action Network',
    'Comprehensive device restrictions during school hours for focused learning.',
    'The Screen-Free Schools standard enforces phone-free policies during school hours, blocking social media, gaming, and non-educational content during the school day.',
    '1.0',
    false,
    5,
    18
)
ON CONFLICT (slug) DO NOTHING;

-- Seed standard rules (using subqueries to reference the parent standards)
INSERT INTO standard_rules (standard_id, category, label, config, sort_order) VALUES
-- Four Norms rules
((SELECT id FROM standards WHERE slug = 'four-norms'), 'social_media_min_age', 'No social media until age 16', '{"min_age": 16}', 1),
((SELECT id FROM standards WHERE slug = 'four-norms'), 'privacy_account_creation', 'No smartphones until age 14', '{"min_age": 14}', 2),
((SELECT id FROM standards WHERE slug = 'four-norms'), 'time_scheduled_hours', 'Phone-free schools', '{"blocked_during": "school_hours"}', 3),
((SELECT id FROM standards WHERE slug = 'four-norms'), 'time_daily_limit', 'More outdoor play', '{"outdoor_minimum_minutes": 120}', 4),
-- Wait Until 8th rules
((SELECT id FROM standards WHERE slug = 'wait-until-8th'), 'privacy_account_creation', 'No smartphone apps until 8th grade', '{"min_age": 14}', 1),
((SELECT id FROM standards WHERE slug = 'wait-until-8th'), 'social_media_min_age', 'No social media until 8th grade', '{"min_age": 14}', 2),
((SELECT id FROM standards WHERE slug = 'wait-until-8th'), 'content_rating', 'Age-appropriate content', '{"level": "strict"}', 3),
((SELECT id FROM standards WHERE slug = 'wait-until-8th'), 'web_filter_level', 'Web filtering', '{"level": "strict"}', 4),
((SELECT id FROM standards WHERE slug = 'wait-until-8th'), 'monitoring_activity', 'Activity monitoring', '{"enabled": true}', 5),
-- Screen-Smart Family rules
((SELECT id FROM standards WHERE slug = 'screen-smart-family'), 'time_daily_limit', 'Daily screen time', '{"adaptive": true}', 1),
((SELECT id FROM standards WHERE slug = 'screen-smart-family'), 'content_rating', 'Content ratings', '{"level": "age_appropriate"}', 2),
((SELECT id FROM standards WHERE slug = 'screen-smart-family'), 'web_safesearch', 'Safe search', '{"enforced": true}', 3),
((SELECT id FROM standards WHERE slug = 'screen-smart-family'), 'social_chat_control', 'Chat controls', '{"mode": "known_contacts_only"}', 4),
((SELECT id FROM standards WHERE slug = 'screen-smart-family'), 'purchase_approval', 'Purchase approval', '{"required": true}', 5),
((SELECT id FROM standards WHERE slug = 'screen-smart-family'), 'privacy_data_sharing', 'Data sharing', '{"level": "minimal"}', 6),
-- Screen-Free Schools rules
((SELECT id FROM standards WHERE slug = 'screen-free-schools'), 'time_scheduled_hours', 'School hours', '{"blocked_during": "school_hours", "scope": "non_educational"}', 1),
((SELECT id FROM standards WHERE slug = 'screen-free-schools'), 'social_media_min_age', 'Social media blocked during school', '{"blocked_during": "school_hours"}', 2),
((SELECT id FROM standards WHERE slug = 'screen-free-schools'), 'notification_curfew', 'Notifications silenced during school', '{"during": "school_hours"}', 3),
((SELECT id FROM standards WHERE slug = 'screen-free-schools'), 'algo_feed_control', 'Algorithmic feeds disabled during school', '{"disabled_during": "school_hours"}', 4)
ON CONFLICT DO NOTHING;
