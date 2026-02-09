-- Migration 015: Rename clerk_id to external_auth_id for WorkOS migration
-- This is backward-compatible: the column stores the external auth provider's user ID
-- (was Clerk user ID, now WorkOS user ID)

ALTER TABLE users RENAME COLUMN clerk_id TO external_auth_id;

-- Recreate index with new column name
DROP INDEX IF EXISTS idx_users_clerk_id;
CREATE INDEX idx_users_external_auth_id ON users(external_auth_id) WHERE deleted_at IS NULL;
