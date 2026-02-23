DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_outreach_config' AND column_name = 'active_persona') THEN
        ALTER TABLE admin_outreach_config ADD COLUMN active_persona VARCHAR(50) NOT NULL DEFAULT 'alex';
    END IF;
END $$;
