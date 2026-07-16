import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return <Loader2 className={cn('w-4 h-4 animate-spin', className)} aria-hidden="true" />;
}
