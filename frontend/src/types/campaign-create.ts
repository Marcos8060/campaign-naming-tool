export interface PlatformConfig {
  id: string;
  platform: string;
  naming_template: string;
  max_length: number;
  separator: string;
  is_active: boolean;
}

export interface CampaignFormData {
  platform: string;
  name: string;
  objective: string;
  budget_total: string;
  budget_daily: string;
  start_date: string;
  end_date: string;
  status: string;
  taxonomy_values: Record<string, string>;
}

export interface ValidationCheck {
  label: string;
  pass: boolean;
  required: boolean;
}

export interface LivePreviewProps {
  generatedName: string;
  platformConfig: PlatformConfig | null | undefined;
  form: CampaignFormData;
}
