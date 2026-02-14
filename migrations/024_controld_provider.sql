-- 024_controld_provider.sql
-- Add Control D as a live DNS provider with service-level app blocking

INSERT INTO platforms (id, name, category, tier, description, auth_type)
VALUES (
    'controld',
    'Control D',
    'dns',
    'compliant',
    'Advanced DNS filtering with service-level app blocking, anti-circumvention, and 15 content categories',
    'api_key'
) ON CONFLICT (id) DO NOTHING;
