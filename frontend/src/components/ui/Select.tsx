import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

/**
 * Same shell as `Input` — this app uses plain native `<select>` elements
 * everywhere (no custom-styled dropdown), so this just centralizes the
 * repeated className instead of introducing new interaction patterns.
 */
const selectStyles = cva(
  'w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors',
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

// Native <select> already has a numeric `size` attribute (visible option
// rows), so the variant is named `uiSize` to avoid clobbering it.
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, VariantProps<typeof selectStyles> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, uiSize, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn(selectStyles({ uiSize }), className)} {...props}>
      {children}
    </select>
  );
});
