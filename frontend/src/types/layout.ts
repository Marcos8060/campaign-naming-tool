import { type LucideIcon } from 'lucide-react';

export interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  indent?: boolean;
  collapsed?: boolean;
  active: boolean;
  onClick?: () => void;
}
