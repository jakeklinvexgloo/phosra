-- Expand contact_type to include investor and think_tank categories.
ALTER TABLE admin_outreach_contacts DROP CONSTRAINT IF EXISTS admin_outreach_contacts_contact_type_check;
ALTER TABLE admin_outreach_contacts ADD CONSTRAINT admin_outreach_contacts_contact_type_check
  CHECK (contact_type IN ('advocacy','tech_company','legislator','academic','investor','think_tank','other'));
