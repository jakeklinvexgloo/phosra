-- 017_playground_providers.sql
-- Add platforms for the Klinvex Family playground demo:
-- Paramount+, YouTube TV, Peacock (streaming)
-- Amazon Fire Tablet, Apple Watch, Amazon Fire TV Stick (device)
-- Note: 'providers' was renamed to 'platforms' in migration 010_rebrand.sql
-- Tier values: 'stub' was renamed to 'pending' in that same migration.

INSERT INTO platforms (id, name, category, tier, description, auth_type) VALUES
    ('paramount_plus', 'Paramount+', 'streaming', 'pending', 'Paramount+ streaming parental controls', 'manual'),
    ('youtube_tv', 'YouTube TV', 'streaming', 'pending', 'YouTube TV live streaming parental controls', 'manual'),
    ('peacock', 'Peacock', 'streaming', 'pending', 'Peacock streaming parental controls', 'manual'),
    ('fire_tablet', 'Amazon Fire Tablet', 'device', 'pending', 'Amazon Fire Tablet Kids parental controls', 'manual'),
    ('apple_watch', 'Apple Watch', 'device', 'pending', 'Apple Watch parental controls via Family Setup', 'manual'),
    ('fire_tv', 'Amazon Fire TV Stick', 'device', 'pending', 'Amazon Fire TV parental controls', 'manual')
ON CONFLICT (id) DO NOTHING;
