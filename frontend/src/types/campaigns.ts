import type { Campaign } from './index';

export interface SortButtonProps {
  column: string;
  current: string;
  order: string;
  onClick: (col: string) => void;
}

export interface ActionMenuProps {
  campaign: Campaign;
  onAction: (action: string, id: string) => void;
}
