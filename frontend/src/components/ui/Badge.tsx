import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

const badgeStyles = cva('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize', {
  variants: {
    tone: {
      neutral: 'bg-gray-100 text-gray-700',
      primary: 'bg-primary-soft text-primary',
      success: 'bg-positive-soft text-positive',
      danger: 'bg-red-100 text-red-700',
      warning: 'bg-amber-100 text-amber-700',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyles> {}

export function Badge({ tone, className, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)} {...props} />;
}
