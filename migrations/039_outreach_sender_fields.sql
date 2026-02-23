-- 039_outreach_sender_fields.sql
-- Add phone and LinkedIn fields to outreach config for richer email signatures.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_outreach_config' AND column_name = 'sender_phone') THEN
        ALTER TABLE admin_outreach_config ADD COLUMN sender_phone VARCHAR(30) NOT NULL DEFAULT '';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_outreach_config' AND column_name = 'sender_linkedin') THEN
        ALTER TABLE admin_outreach_config ADD COLUMN sender_linkedin VARCHAR(255) NOT NULL DEFAULT '';
    END IF;
END $$;
