-- 009: Seed data for rating systems, ratings, providers, equivalences, and age map

-- Rating Systems
INSERT INTO rating_systems (id, name, country, media_type, description) VALUES
    ('mpaa', 'MPAA', 'US', 'movie', 'Motion Picture Association of America film rating system'),
    ('tvpg', 'TV Parental Guidelines', 'US', 'tv', 'US television content rating system'),
    ('esrb', 'ESRB', 'US', 'game', 'Entertainment Software Rating Board'),
    ('pegi', 'PEGI', 'EU', 'game', 'Pan European Game Information'),
    ('csm', 'Common Sense Media', 'US', 'general', 'Common Sense Media age-based ratings');

-- MPAA Ratings
INSERT INTO ratings (id, system_id, code, name, description, min_age, display_order, restrictive_idx) VALUES
    ('00000000-0000-0000-0001-000000000001', 'mpaa', 'G', 'General Audiences', 'All ages admitted', 0, 1, 1),
    ('00000000-0000-0000-0001-000000000002', 'mpaa', 'PG', 'Parental Guidance', 'Some material may not be suitable for children', 0, 2, 2),
    ('00000000-0000-0000-0001-000000000003', 'mpaa', 'PG-13', 'Parents Strongly Cautioned', 'Some material may be inappropriate for children under 13', 13, 3, 3),
    ('00000000-0000-0000-0001-000000000004', 'mpaa', 'R', 'Restricted', 'Under 17 requires accompanying parent or adult guardian', 17, 4, 4),
    ('00000000-0000-0000-0001-000000000005', 'mpaa', 'NC-17', 'Adults Only', 'No one 17 and under admitted', 18, 5, 5);

-- TV Parental Guidelines
INSERT INTO ratings (id, system_id, code, name, description, min_age, display_order, restrictive_idx) VALUES
    ('00000000-0000-0000-0002-000000000001', 'tvpg', 'TV-Y', 'All Children', 'Designed for all children', 0, 1, 1),
    ('00000000-0000-0000-0002-000000000002', 'tvpg', 'TV-Y7', 'Directed to Older Children', 'Designed for children age 7 and above', 7, 2, 2),
    ('00000000-0000-0000-0002-000000000003', 'tvpg', 'TV-G', 'General Audience', 'Most parents would find suitable for all ages', 0, 3, 1),
    ('00000000-0000-0000-0002-000000000004', 'tvpg', 'TV-PG', 'Parental Guidance Suggested', 'May contain some material parents find unsuitable', 0, 4, 2),
    ('00000000-0000-0000-0002-000000000005', 'tvpg', 'TV-14', 'Parents Strongly Cautioned', 'Contains material unsuitable for children under 14', 14, 5, 3),
    ('00000000-0000-0000-0002-000000000006', 'tvpg', 'TV-MA', 'Mature Audience Only', 'Designed for adults and may be unsuitable for children under 17', 17, 6, 4);

-- ESRB Ratings
INSERT INTO ratings (id, system_id, code, name, description, min_age, display_order, restrictive_idx) VALUES
    ('00000000-0000-0000-0003-000000000001', 'esrb', 'E', 'Everyone', 'Content generally suitable for all ages', 0, 1, 1),
    ('00000000-0000-0000-0003-000000000002', 'esrb', 'E10+', 'Everyone 10+', 'Content generally suitable for ages 10 and up', 10, 2, 2),
    ('00000000-0000-0000-0003-000000000003', 'esrb', 'T', 'Teen', 'Content generally suitable for ages 13 and up', 13, 3, 3),
    ('00000000-0000-0000-0003-000000000004', 'esrb', 'M', 'Mature 17+', 'Content generally suitable for ages 17 and up', 17, 4, 4),
    ('00000000-0000-0000-0003-000000000005', 'esrb', 'AO', 'Adults Only 18+', 'Content suitable only for adults ages 18 and up', 18, 5, 5);

-- PEGI Ratings
INSERT INTO ratings (id, system_id, code, name, description, min_age, display_order, restrictive_idx) VALUES
    ('00000000-0000-0000-0004-000000000001', 'pegi', '3', 'PEGI 3', 'Suitable for all age groups', 3, 1, 1),
    ('00000000-0000-0000-0004-000000000002', 'pegi', '7', 'PEGI 7', 'Suitable for ages 7 and older', 7, 2, 2),
    ('00000000-0000-0000-0004-000000000003', 'pegi', '12', 'PEGI 12', 'Suitable for ages 12 and older', 12, 3, 3),
    ('00000000-0000-0000-0004-000000000004', 'pegi', '16', 'PEGI 16', 'Suitable for ages 16 and older', 16, 4, 4),
    ('00000000-0000-0000-0004-000000000005', 'pegi', '18', 'PEGI 18', 'Suitable for ages 18 and older', 18, 5, 5);

-- Common Sense Media Ratings
INSERT INTO ratings (id, system_id, code, name, description, min_age, display_order, restrictive_idx) VALUES
    ('00000000-0000-0000-0005-000000000001', 'csm', '2+', 'Age 2+', 'Appropriate for ages 2 and up', 2, 1, 1),
    ('00000000-0000-0000-0005-000000000002', 'csm', '5+', 'Age 5+', 'Appropriate for ages 5 and up', 5, 2, 2),
    ('00000000-0000-0000-0005-000000000003', 'csm', '7+', 'Age 7+', 'Appropriate for ages 7 and up', 7, 3, 3),
    ('00000000-0000-0000-0005-000000000004', 'csm', '10+', 'Age 10+', 'Appropriate for ages 10 and up', 10, 4, 4),
    ('00000000-0000-0000-0005-000000000005', 'csm', '13+', 'Age 13+', 'Appropriate for ages 13 and up', 13, 5, 5),
    ('00000000-0000-0000-0005-000000000006', 'csm', '15+', 'Age 15+', 'Appropriate for ages 15 and up', 15, 6, 6),
    ('00000000-0000-0000-0005-000000000007', 'csm', '17+', 'Age 17+', 'Appropriate for ages 17 and up', 17, 7, 7),
    ('00000000-0000-0000-0005-000000000008', 'csm', '18+', 'Age 18+', 'Adults only', 18, 8, 8);

-- Cross-system rating equivalences
INSERT INTO rating_equivalences (rating_a, rating_b, strength) VALUES
    -- G ↔ TV-Y, E, PEGI 3, CSM 2+
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', 0.90),
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0003-000000000001', 0.85),
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0004-000000000001', 0.85),
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0005-000000000001', 0.80),
    -- PG ↔ TV-Y7, TV-PG, PEGI 7
    ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000002', 0.80),
    ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000004', 0.85),
    ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0004-000000000002', 0.80),
    -- PG-13 ↔ TV-14, T, PEGI 12
    ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000005', 0.90),
    ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0003-000000000003', 0.85),
    ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0004-000000000003', 0.80),
    -- R ↔ TV-MA, M, PEGI 16
    ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000006', 0.90),
    ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0003-000000000004', 0.85),
    ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0004-000000000004', 0.80),
    -- NC-17 ↔ AO, PEGI 18
    ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0003-000000000005', 0.90),
    ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0004-000000000005', 0.85);

-- Age-to-Rating Map
INSERT INTO age_rating_map (min_age, max_age, system_id, rating_id) VALUES
    -- Ages 0-6
    (0, 6, 'mpaa', '00000000-0000-0000-0001-000000000001'),   -- G
    (0, 6, 'tvpg', '00000000-0000-0000-0002-000000000001'),   -- TV-Y
    (0, 6, 'esrb', '00000000-0000-0000-0003-000000000001'),   -- E
    (0, 6, 'pegi', '00000000-0000-0000-0004-000000000001'),   -- 3
    (0, 6, 'csm', '00000000-0000-0000-0005-000000000002'),    -- 5+
    -- Ages 7-9
    (7, 9, 'mpaa', '00000000-0000-0000-0001-000000000002'),   -- PG
    (7, 9, 'tvpg', '00000000-0000-0000-0002-000000000002'),   -- TV-Y7
    (7, 9, 'esrb', '00000000-0000-0000-0003-000000000001'),   -- E
    (7, 9, 'pegi', '00000000-0000-0000-0004-000000000002'),   -- 7
    (7, 9, 'csm', '00000000-0000-0000-0005-000000000003'),    -- 7+
    -- Ages 10-12
    (10, 12, 'mpaa', '00000000-0000-0000-0001-000000000002'),  -- PG
    (10, 12, 'tvpg', '00000000-0000-0000-0002-000000000004'),  -- TV-PG
    (10, 12, 'esrb', '00000000-0000-0000-0003-000000000002'),  -- E10+
    (10, 12, 'pegi', '00000000-0000-0000-0004-000000000002'),  -- 7
    (10, 12, 'csm', '00000000-0000-0000-0005-000000000004'),   -- 10+
    -- Ages 13-16
    (13, 16, 'mpaa', '00000000-0000-0000-0001-000000000003'),  -- PG-13
    (13, 16, 'tvpg', '00000000-0000-0000-0002-000000000005'),  -- TV-14
    (13, 16, 'esrb', '00000000-0000-0000-0003-000000000003'),  -- T
    (13, 16, 'pegi', '00000000-0000-0000-0004-000000000003'),  -- 12
    (13, 16, 'csm', '00000000-0000-0000-0005-000000000005'),   -- 13+
    -- Age 17
    (17, 17, 'mpaa', '00000000-0000-0000-0001-000000000004'),  -- R
    (17, 17, 'tvpg', '00000000-0000-0000-0002-000000000006'),  -- TV-MA
    (17, 17, 'esrb', '00000000-0000-0000-0003-000000000004'),  -- M
    (17, 17, 'pegi', '00000000-0000-0000-0004-000000000004'),  -- 16
    (17, 17, 'csm', '00000000-0000-0000-0005-000000000007'),   -- 17+
    -- Age 18+
    (18, 99, 'mpaa', '00000000-0000-0000-0001-000000000005'),  -- NC-17
    (18, 99, 'tvpg', '00000000-0000-0000-0002-000000000006'),  -- TV-MA
    (18, 99, 'esrb', '00000000-0000-0000-0003-000000000005'),  -- AO
    (18, 99, 'pegi', '00000000-0000-0000-0004-000000000005'),  -- 18
    (18, 99, 'csm', '00000000-0000-0000-0005-000000000008');   -- 18+

-- Content Descriptors
INSERT INTO content_descriptors (system_id, code, name, category) VALUES
    ('esrb', 'violence', 'Violence', 'violence'),
    ('esrb', 'blood', 'Blood', 'violence'),
    ('esrb', 'language', 'Language', 'language'),
    ('esrb', 'sexual', 'Sexual Content', 'sexual'),
    ('esrb', 'drugs', 'Drug Reference', 'substance'),
    ('esrb', 'gambling', 'Simulated Gambling', 'gambling'),
    ('pegi', 'violence', 'Violence', 'violence'),
    ('pegi', 'bad_language', 'Bad Language', 'language'),
    ('pegi', 'fear', 'Fear', 'fear'),
    ('pegi', 'sex', 'Sex', 'sexual'),
    ('pegi', 'drugs', 'Drugs', 'substance'),
    ('pegi', 'discrimination', 'Discrimination', 'discrimination'),
    ('pegi', 'gambling', 'Gambling', 'gambling'),
    ('pegi', 'in_game_purchases', 'In-Game Purchases', 'purchase');

-- Providers
INSERT INTO providers (id, name, category, tier, description, auth_type) VALUES
    ('nextdns', 'NextDNS', 'dns', 'live', 'DNS-level content filtering and parental controls', 'api_key'),
    ('cleanbrowsing', 'CleanBrowsing', 'dns', 'live', 'DNS-based content filtering service', 'api_key'),
    ('android', 'Android (Google Family Link)', 'device', 'live', 'Android device management via Google Family Link / Android Management API', 'oauth2'),
    ('microsoft', 'Microsoft Family Safety', 'device', 'partial', 'Microsoft Family Safety parental controls', 'oauth2'),
    ('apple', 'Apple Screen Time (MDM)', 'device', 'partial', 'Apple device management via MDM configuration profiles', 'manual'),
    ('netflix', 'Netflix', 'streaming', 'stub', 'Netflix streaming service parental controls', 'manual'),
    ('disney_plus', 'Disney+', 'streaming', 'stub', 'Disney+ streaming service parental controls', 'manual'),
    ('prime_video', 'Amazon Prime Video', 'streaming', 'stub', 'Amazon Prime Video parental controls', 'manual'),
    ('youtube', 'YouTube / YouTube Kids', 'streaming', 'stub', 'YouTube and YouTube Kids content controls', 'manual'),
    ('hulu', 'Hulu', 'streaming', 'stub', 'Hulu streaming service parental controls', 'manual'),
    ('max', 'Max (HBO)', 'streaming', 'stub', 'Max streaming service parental controls', 'manual'),
    ('xbox', 'Xbox', 'gaming', 'stub', 'Xbox console and Xbox Live parental controls', 'manual'),
    ('playstation', 'PlayStation', 'gaming', 'stub', 'PlayStation console and PSN parental controls', 'manual'),
    ('nintendo', 'Nintendo', 'gaming', 'stub', 'Nintendo Switch parental controls', 'manual'),
    ('roku', 'Roku', 'streaming', 'stub', 'Roku device parental controls', 'manual');
