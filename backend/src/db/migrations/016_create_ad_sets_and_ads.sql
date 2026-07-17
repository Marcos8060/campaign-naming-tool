-- Meta requires a campaign to have at least one ad set (targeting/budget/
-- schedule) and at least one ad (creative) under it before anything can
-- actually deliver — Phase 2's Deploy only ever created the campaign shell.
-- These two tables track that next layer down, mirroring the same
-- draft/deployed/failed pattern already used on campaigns for Deploy.
CREATE TABLE IF NOT EXISTS campaign_ad_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform_ad_set_id TEXT,
  name TEXT NOT NULL,
  optimization_goal TEXT,
  -- Deliberately minimal targeting for v1: a country list, an age range, and
  -- Meta's own Advantage+ audience automation fills in the rest (interests,
  -- placements, etc.) rather than Camparc building a full targeting builder.
  countries TEXT[] NOT NULL DEFAULT '{}',
  age_min INTEGER NOT NULL DEFAULT 18,
  age_max INTEGER NOT NULL DEFAULT 65,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'deployed', 'failed')),
  platform_error TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_sets_campaign ON campaign_ad_sets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_sets_workspace ON campaign_ad_sets(workspace_id);

CREATE TABLE IF NOT EXISTS campaign_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_set_id UUID NOT NULL REFERENCES campaign_ad_sets(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  -- Reuses Camparc's existing Assets library rather than a separate upload
  -- path — this is the "where do I use an asset" answer made real.
  asset_id UUID REFERENCES campaign_assets(id),
  platform_creative_id TEXT,
  platform_ad_id TEXT,
  headline TEXT,
  primary_text TEXT,
  link_url TEXT,
  call_to_action TEXT NOT NULL DEFAULT 'LEARN_MORE',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'deployed', 'failed')),
  platform_error TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ads_ad_set ON campaign_ads(ad_set_id);
CREATE INDEX IF NOT EXISTS idx_ads_workspace ON campaign_ads(workspace_id);

-- Every Meta ad must be attributed to a Facebook Page (a hard platform rule,
-- not a Camparc choice). Stored per-connection as the workspace's default
-- Page rather than per-campaign, keeping ad creation simpler for v1.
ALTER TABLE platform_connections
  ADD COLUMN IF NOT EXISTS page_id TEXT,
  ADD COLUMN IF NOT EXISTS page_name TEXT;
