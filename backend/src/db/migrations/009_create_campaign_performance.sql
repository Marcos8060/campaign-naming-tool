CREATE TABLE IF NOT EXISTS campaign_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  spend DECIMAL(12, 2),
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  revenue DECIMAL(12, 2),
  cpc DECIMAL(10, 4),
  ctr DECIMAL(5, 4),
  cpa DECIMAL(10, 2),
  roas DECIMAL(10, 2),
  synced_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

CREATE INDEX IF NOT EXISTS idx_perf_campaign ON campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_perf_date ON campaign_performance(date);
