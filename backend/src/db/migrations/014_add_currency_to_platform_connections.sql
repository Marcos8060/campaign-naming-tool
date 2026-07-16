-- Meta ad accounts (and eventually other platforms) don't all bill in the
-- same currency as this app's UI assumes ($). Storing the ad account's real
-- currency here lets budget fields be labeled correctly instead of always
-- showing a $ sign regardless of what's actually being spent.
ALTER TABLE platform_connections
  ADD COLUMN IF NOT EXISTS currency TEXT;
