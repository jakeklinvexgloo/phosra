-- 004: Rating systems, ratings, equivalences, content descriptors, age mapping
CREATE TABLE rating_systems (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(10) NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id VARCHAR(20) NOT NULL REFERENCES rating_systems(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    min_age INT NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    restrictive_idx INT NOT NULL DEFAULT 0,
    UNIQUE(system_id, code)
);

CREATE INDEX idx_ratings_system ON ratings(system_id);

CREATE TABLE rating_equivalences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating_a UUID NOT NULL REFERENCES ratings(id) ON DELETE CASCADE,
    rating_b UUID NOT NULL REFERENCES ratings(id) ON DELETE CASCADE,
    strength NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (strength >= 0 AND strength <= 1),
    UNIQUE(rating_a, rating_b)
);

CREATE TABLE content_descriptors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id VARCHAR(20) NOT NULL REFERENCES rating_systems(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    UNIQUE(system_id, code)
);

CREATE TABLE age_rating_map (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_age INT NOT NULL,
    max_age INT NOT NULL,
    system_id VARCHAR(20) NOT NULL REFERENCES rating_systems(id) ON DELETE CASCADE,
    rating_id UUID NOT NULL REFERENCES ratings(id) ON DELETE CASCADE,
    UNIQUE(min_age, max_age, system_id)
);

CREATE INDEX idx_age_rating_map_age ON age_rating_map(min_age, max_age);
