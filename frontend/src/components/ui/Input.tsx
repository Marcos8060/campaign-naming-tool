import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

/**
 * Matches the "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
 * focus:ring-primary" string that was hand-typed on every text/number/date
 * input across the app (modals, forms, filters — dozens of call sites).
 */
const inputStyles = cva(
  'w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors',
  {
    variants: {
      uiSize: {
        sm: 'px-2 py-1 text-xs focus:ring-1',
        md: 'px-3 py-2 text-sm',
      },
    },
    defaultVariants: { uiSize: 'md' },
  },
);

// Native <input> already has a numeric `size` attribute (visible character
// width), so the variant is named `uiSize` to avoid clobbering it.
export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputStyles> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, uiSize, ...props }, ref) {
  return <input ref={ref} className={cn(inputStyles({ uiSize }), className)} {...props} />;
});
