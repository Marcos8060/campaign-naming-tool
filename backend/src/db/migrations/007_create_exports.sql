CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('csv', 'guide', 'bulk')),
  platform TEXT,
  campaign_ids UUID[],
  file_path TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exports_workspace ON exports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_created_by ON exports(created_by);
