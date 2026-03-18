CREATE TABLE IF NOT EXISTS audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  definition JSONB NOT NULL DEFAULT '{}',
  estimated_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audiences_workspace ON audiences(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audiences_platform ON audiences(workspace_id, platform);

CREATE TABLE IF NOT EXISTS campaign_audiences (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  audience_id UUID NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('include', 'exclude')),
  PRIMARY KEY (campaign_id, audience_id)
);

CREATE INDEX IF NOT EXISTS idx_camp_aud_campaign ON campaign_audiences(campaign_id);
CREATE INDEX IF NOT EXISTS idx_camp_aud_audience ON campaign_audiences(audience_id);
