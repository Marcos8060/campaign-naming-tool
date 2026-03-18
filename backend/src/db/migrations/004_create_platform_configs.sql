CREATE TABLE IF NOT EXISTS platform_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google_ads', 'tiktok', 'dv360', 'linkedin')),
  naming_template TEXT NOT NULL,
  id_format TEXT,
  separator TEXT DEFAULT '_',
  max_length INTEGER DEFAULT 255,
  validation_rules JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workspace_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_platform_configs_workspace ON platform_configs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_platform_configs_platform ON platform_configs(platform);
