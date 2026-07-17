-- Phase 2 (Deploy): tracks whether/how a campaign has been pushed to its ad
-- platform. platform_id already existed but was never populated by anything —
-- this adds the status/timestamp/error columns needed to show that in the UI
-- and to distinguish "never deployed" from "deploy attempted and failed".
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS platform_status TEXT NOT NULL DEFAULT 'not_deployed'
    CHECK (platform_status IN ('not_deployed', 'deploying', 'deployed', 'failed')),
  ADD COLUMN IF NOT EXISTS platform_deployed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS platform_error TEXT;

CREATE INDEX IF NOT EXISTS idx_campaigns_platform_status ON campaigns(workspace_id, platform_status);
