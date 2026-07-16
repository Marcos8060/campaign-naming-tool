import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

const cardStyles = cva('bg-white', {
  variants: {
    variant: {
      elevated: 'rounded-2xl card-shadow',
      outlined: 'rounded-xl border border-gray-200',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    },
  },
  defaultVariants: { variant: 'outlined', padding: 'md' },
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardStyles> {}

export function Card({ variant, padding, className, ...props }: CardProps) {
  return <div className={cn(cardStyles({ variant, padding }), className)} {...props} />;
}
