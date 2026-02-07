-- Migration 010: Regulatory standard rebrand
-- Renames tables and columns from provider/sync terminology to platform/enforcement terminology

-- Rename tables
ALTER TABLE providers RENAME TO platforms;
ALTER TABLE provider_connections RENAME TO compliance_links;
ALTER TABLE sync_jobs RENAME TO enforcement_jobs;
ALTER TABLE sync_job_results RENAME TO enforcement_results;

-- Rename columns in compliance_links (formerly provider_connections)
ALTER TABLE compliance_links RENAME COLUMN provider_id TO platform_id;
ALTER TABLE compliance_links RENAME COLUMN last_sync_at TO last_enforcement_at;
ALTER TABLE compliance_links RENAME COLUMN last_sync_status TO last_enforcement_status;
ALTER TABLE compliance_links RENAME COLUMN connected_at TO verified_at;

-- Rename columns in enforcement_results (formerly sync_job_results)
ALTER TABLE enforcement_results RENAME COLUMN sync_job_id TO enforcement_job_id;
ALTER TABLE enforcement_results RENAME COLUMN connection_id TO compliance_link_id;
ALTER TABLE enforcement_results RENAME COLUMN provider_id TO platform_id;

-- Update tier values in platforms
UPDATE platforms SET tier = 'compliant' WHERE tier = 'live';
UPDATE platforms SET tier = 'provisional' WHERE tier = 'partial';
UPDATE platforms SET tier = 'pending' WHERE tier = 'stub';

-- Update connection status values in compliance_links
UPDATE compliance_links SET status = 'verified' WHERE status = 'connected';
UPDATE compliance_links SET status = 'unverified' WHERE status = 'disconnected';
