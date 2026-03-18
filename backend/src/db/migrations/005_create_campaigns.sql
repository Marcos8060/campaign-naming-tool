CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_id TEXT,
  taxonomy_values JSONB NOT NULL DEFAULT '{}',
  objective TEXT,
  budget_total DECIMAL(12, 2),
  budget_daily DECIMAL(12, 2),
  start_date DATE,
  end_date DATE,
  configuration JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_workspace ON campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(workspace_id, platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);
