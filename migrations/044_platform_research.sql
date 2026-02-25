-- Platform research results
CREATE TABLE IF NOT EXISTS platform_research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  screenshots JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT NULL,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  run_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_research_results_platform_id
  ON platform_research_results(platform_id);
CREATE INDEX IF NOT EXISTS idx_platform_research_results_status
  ON platform_research_results(status);

-- Individual screenshots
CREATE TABLE IF NOT EXISTS platform_research_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES platform_research_results(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL,
  label TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_research_screenshots_result_id
  ON platform_research_screenshots(result_id);

-- Research runs (bulk/scheduled sessions)
CREATE TABLE IF NOT EXISTS platform_research_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL DEFAULT 'bulk',
  status TEXT NOT NULL DEFAULT 'running',
  platform_ids JSONB DEFAULT '[]'::jsonb,
  completed_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
