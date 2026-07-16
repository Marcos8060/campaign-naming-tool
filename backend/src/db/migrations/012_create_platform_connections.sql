CREATE TABLE IF NOT EXISTS platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google_ads', 'tiktok', 'dv360', 'linkedin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'expired', 'revoked')),
  external_account_id TEXT,
  external_account_name TEXT,
  access_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMP,
  scopes TEXT,
  connected_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workspace_id, platform, external_account_id)
);

CREATE INDEX IF NOT EXISTS idx_platform_connections_workspace ON platform_connections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_status ON platform_connections(workspace_id, status);
