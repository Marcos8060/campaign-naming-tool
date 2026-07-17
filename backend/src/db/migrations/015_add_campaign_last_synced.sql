-- Phase 3 (Report): tracks when a campaign's performance was last pulled
-- from its ad platform, so the UI can show "Last synced" without relying on
-- component state that disappears on reload.
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP;
