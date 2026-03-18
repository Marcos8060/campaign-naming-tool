CREATE TABLE IF NOT EXISTS campaign_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_campaign ON campaign_assets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_assets_workspace ON campaign_assets(workspace_id);
