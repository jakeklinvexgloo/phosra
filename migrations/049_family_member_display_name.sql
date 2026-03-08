-- 049: Add display_name column to family_members
-- Allows families to customize how a member appears (e.g., "Mom", "Grandpa Joe")
-- independently of their account name in the users table.

ALTER TABLE family_members ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
