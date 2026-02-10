-- 017_playground_providers.sql
-- Add providers for the Klinvex Family playground demo:
-- Paramount+, YouTube TV, Peacock (streaming)
-- Amazon Fire Tablet, Apple Watch, Amazon Fire TV Stick (device)

INSERT INTO providers (id, name, category, tier, description, auth_type) VALUES
    ('paramount_plus', 'Paramount+', 'streaming', 'stub', 'Paramount+ streaming parental controls', 'manual'),
    ('youtube_tv', 'YouTube TV', 'streaming', 'stub', 'YouTube TV live streaming parental controls', 'manual'),
    ('peacock', 'Peacock', 'streaming', 'stub', 'Peacock streaming parental controls', 'manual'),
    ('fire_tablet', 'Amazon Fire Tablet', 'device', 'stub', 'Amazon Fire Tablet Kids parental controls', 'manual'),
    ('apple_watch', 'Apple Watch', 'device', 'stub', 'Apple Watch parental controls via Family Setup', 'manual'),
    ('fire_tv', 'Amazon Fire TV Stick', 'device', 'stub', 'Amazon Fire TV parental controls', 'manual')
ON CONFLICT (id) DO NOTHING;
