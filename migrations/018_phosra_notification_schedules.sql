-- Phosra Notification Service: manages notification curfews, usage timers, and parental event notifications
CREATE TABLE IF NOT EXISTS notification_schedules (
    id UUID PRIMARY KEY,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    rule_category VARCHAR(50) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_schedules_child ON notification_schedules(child_id);
CREATE INDEX idx_notification_schedules_family ON notification_schedules(family_id);
CREATE UNIQUE INDEX idx_notification_schedules_child_category ON notification_schedules(child_id, rule_category);
