-- Add clerk_id column for Clerk user mapping
ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_users_clerk_id ON users(clerk_id) WHERE deleted_at IS NULL;

-- password_hash becomes nullable (Clerk handles passwords now)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET DEFAULT '';
