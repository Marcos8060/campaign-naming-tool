import { type LucideIcon } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  color: string;
}

export interface OverlapPair {
  campaign_a_id: string;
  campaign_a_name: string;
  campaign_b_id: string;
  campaign_b_name: string;
  overlap_percentage: number;
  wasted_spend_estimate: number;
  shared_taxonomy?: Record<string, unknown>;
}
