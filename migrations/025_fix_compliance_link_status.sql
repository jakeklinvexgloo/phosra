-- Fix compliance_links status CHECK constraint
-- Migration 010 renamed status values (connected→verified, disconnected→unverified)
-- but did not update the CHECK constraint, causing INSERT failures

-- First update any remaining old values
UPDATE compliance_links SET status = 'verified' WHERE status = 'connected';
UPDATE compliance_links SET status = 'unverified' WHERE status = 'disconnected';

-- Drop old constraint and add new one
ALTER TABLE compliance_links DROP CONSTRAINT IF EXISTS provider_connections_status_check;
ALTER TABLE compliance_links DROP CONSTRAINT IF EXISTS compliance_links_status_check;

ALTER TABLE compliance_links ADD CONSTRAINT compliance_links_status_check
    CHECK (status IN ('verified', 'unverified', 'error'));
