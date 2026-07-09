import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { Spinner } from './Spinner';

/**
 * Variant/size -> class lookup, derived from the button styles already
 * hand-rolled across the app (CampaignEditModal's "Save Changes", the
 * settings page's "Cancel"/"Invite" pair, ConfirmDeleteModal's "Remove
 * member", the X close icon buttons). Consolidating them here means those
 * four call sites become `variant` props instead of four slightly-different
 * copies of the same Tailwind string.
 */
const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
        ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        text: 'text-primary hover:text-primary-hover',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        icon: 'p-1.5',
      },
    },
    compoundVariants: [
      // "text" buttons never carry the box padding a filled/outlined button
      // needs — this mirrors the original `disabledStylesMap.text` override
      // (`!text-primary px-0 py-0`) from the reference Button.
      { variant: 'text', size: ['sm', 'md', 'icon'], class: 'p-0' },
    ],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof buttonStyles> {
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant, size, loading = false, disabled, icon, iconPosition = 'left', className, type = 'button', ...props },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading ? <Spinner /> : icon && iconPosition === 'left' ? icon : null}
      {children}
      {!loading && icon && iconPosition === 'right' ? icon : null}
    </button>
  );
});
