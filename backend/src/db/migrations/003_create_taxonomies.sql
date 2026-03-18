CREATE TABLE IF NOT EXISTS taxonomies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('brand', 'product', 'region', 'objective', 'promotion', 'custom')),
  parent_id UUID REFERENCES taxonomies(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 0,
  code TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_taxonomies_workspace ON taxonomies(workspace_id);
CREATE INDEX IF NOT EXISTS idx_taxonomies_parent ON taxonomies(parent_id);
CREATE INDEX IF NOT EXISTS idx_taxonomies_type ON taxonomies(workspace_id, type);
CREATE INDEX IF NOT EXISTS idx_taxonomies_code ON taxonomies(workspace_id, code);
CREATE INDEX IF NOT EXISTS idx_taxonomies_level ON taxonomies(level);
