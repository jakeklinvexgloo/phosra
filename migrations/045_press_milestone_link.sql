-- Add milestone_id column to link press releases to fundraise milestones
ALTER TABLE press_releases ADD COLUMN IF NOT EXISTS milestone_id TEXT;

-- Index for querying releases by milestone
CREATE INDEX IF NOT EXISTS idx_press_releases_milestone_id ON press_releases(milestone_id) WHERE milestone_id IS NOT NULL;
