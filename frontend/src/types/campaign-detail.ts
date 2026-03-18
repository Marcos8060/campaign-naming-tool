import type { Campaign, Taxonomy } from './index';

export interface CampaignUpdatePayload {
  name: string;
  objective: string;
  budget_total: number | null;
  budget_daily: number | null;
  start_date: string | null;
  end_date: string | null;
  taxonomy_values: Record<string, string>;
}

export interface EditModalProps {
  campaign: Campaign;
  taxonomies: Taxonomy[];
  onClose: () => void;
  onSave: (data: CampaignUpdatePayload) => void;
  isPending: boolean;
}
