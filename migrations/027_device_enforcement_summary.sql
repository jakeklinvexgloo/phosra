-- Migration 027: Add device capabilities and enforcement summary
-- Enables devices to advertise which Apple frameworks they support
-- and store per-category enforcement results for the parent dashboard.

ALTER TABLE device_registrations
    ADD COLUMN IF NOT EXISTS capabilities TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE device_registrations
    ADD COLUMN IF NOT EXISTS enforcement_summary JSONB NOT NULL DEFAULT '{}';
