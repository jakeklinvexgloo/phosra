-- Add email_status column for tracking email outreach workflow
-- Separate from pipeline status (which tracks overall relationship)

-- First, widen the status check to include 'draft_ready'
ALTER TABLE admin_outreach_contacts DROP CONSTRAINT admin_outreach_contacts_status_check;
ALTER TABLE admin_outreach_contacts ADD CONSTRAINT admin_outreach_contacts_status_check
  CHECK (status IN ('not_contacted', 'draft_ready', 'reached_out', 'in_conversation', 'partnership', 'declined'));

-- Add email_status to track email-specific workflow
ALTER TABLE admin_outreach_contacts ADD COLUMN email_status VARCHAR(30) DEFAULT 'none'
  CHECK (email_status IN ('none', 'draft_ready', 'emailed', 'awaiting_reply', 'replied', 'bounced'));

-- Add priority_tier for ordering (1 = reach out immediately, 2 = within 2 weeks, 3 = within 1 month)
ALTER TABLE admin_outreach_contacts ADD COLUMN priority_tier INTEGER DEFAULT 3
  CHECK (priority_tier >= 1 AND priority_tier <= 3);
