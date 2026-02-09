-- Migration 013: Add 5 new rule categories for compliance expansion
-- These categories support CIPA, EARN IT, UK OSA, EU AI Act, AU SMMA, and France SREN

-- Add new rule category values to the policy_rules check constraint
-- (PostgreSQL: if using an ENUM type, alter it; if using CHECK constraints, update them)

-- csam_reporting: CSAM detection and reporting (CIPA, EARN IT, UK OSA, Canada C-63)
-- library_filter_compliance: CIPA E-rate library/school filtering
-- ai_minor_interaction: EU AI Act restrictions on AI systems interacting with minors
-- social_media_min_age: Hard minimum age ban enforcement (AU SMMA, UT SMRA)
-- image_rights_minor: France SREN image rights protections for minors

-- If using a CHECK constraint on policy_rules.category, update it:
-- ALTER TABLE policy_rules DROP CONSTRAINT IF EXISTS policy_rules_category_check;
-- ALTER TABLE policy_rules ADD CONSTRAINT policy_rules_category_check
--   CHECK (category IN (
--     'content_rating', 'content_block_title', 'content_allow_title',
--     'content_allowlist_mode', 'content_descriptor_block',
--     'time_daily_limit', 'time_scheduled_hours', 'time_per_app_limit', 'time_downtime',
--     'purchase_approval', 'purchase_spending_cap', 'purchase_block_iap',
--     'social_contacts', 'social_chat_control', 'social_multiplayer',
--     'web_safesearch', 'web_category_block', 'web_custom_allowlist',
--     'web_custom_blocklist', 'web_filter_level',
--     'privacy_location', 'privacy_profile_visibility', 'privacy_data_sharing',
--     'privacy_account_creation',
--     'monitoring_activity', 'monitoring_alerts',
--     'algo_feed_control', 'addictive_design_control',
--     'notification_curfew', 'usage_timer_notification',
--     'targeted_ad_block', 'dm_restriction', 'age_gate',
--     'data_deletion_request', 'geolocation_opt_in',
--     'csam_reporting', 'library_filter_compliance', 'ai_minor_interaction',
--     'social_media_min_age', 'image_rights_minor'
--   ));

-- If using VARCHAR without constraints (current setup), no schema change needed.
-- The Go constants in models.go already define the new categories.
-- This migration serves as documentation of the category expansion.

-- Record the migration
SELECT 'Migration 013: 5 new rule categories added (csam_reporting, library_filter_compliance, ai_minor_interaction, social_media_min_age, image_rights_minor)' AS migration_note;
