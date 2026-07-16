
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkspaceTheme {
  id: string;
  workspace_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  custom_css: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Campaign {
  id: string;
  workspace_id: string;
  name: string;
  platform: string;
  platform_id: string | null;
  objective: string | null;
  budget_total: number | null;
  budget_daily: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  taxonomy_values: Record<string, string>;
  configuration: Record<string, unknown>;
  created_by: string;
  created_by_name?: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Taxonomy {
  id: string;
  workspace_id: string;
  name: string;
  code: string;
  type: string;
  level: number;
  parent_id: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CampaignsListResponse {
  campaigns: Campaign[];
  total: number;
  limit: number;
  offset: number;
}

export interface OnboardingStatus {
  workspace_created: boolean;
  taxonomies_configured: boolean;
  platforms_configured: boolean;
  first_campaign_created: boolean;
}

export interface PerformanceSummary {
  total_spend: number;
  total_impressions: number;
  total_conversions: number;
  avg_roas: number;
}

export interface PlatformStat {
  platform: string;
  count: number;
  total_budget: number;
}

export interface AnalyticsOverview {
  total_campaigns: number;
  active_campaigns: number;
  total_budget: number;
  platforms: PlatformStat[];
  performance: PerformanceSummary;
  onboarding: OnboardingStatus;
}

export interface TopCampaign {
  id: string;
  name: string;
  platform: string;
  total_spend: number;
  avg_roas: number;
  total_conversions: number;
}

export interface PerformanceDataPoint {
  date: string;
  spend: number;
  conversions: number;
  impressions: number;
}

export interface BudgetAllocation {
  platform: string;
  total_budget: number;
}

export interface ApiErrorResponse {
  detail: string;
}
