import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

    const variants = {
      primary:
        'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white shadow-md shadow-brand-500/20 hover:shadow-lg hover:shadow-brand-500/30 focus:ring-brand-500',
      secondary:
        'bg-surface-900 hover:bg-surface-800 text-white shadow-sm focus:ring-surface-900',
      outline:
        'border border-surface-200 bg-white hover:bg-surface-50 text-surface-800 hover:border-surface-300 focus:ring-brand-500 shadow-sm',
      ghost:
        'bg-transparent hover:bg-surface-100 text-surface-700 hover:text-surface-900 focus:ring-surface-400',
      glass:
        'glass hover:bg-white/90 text-surface-900 border border-white/60 shadow-glass hover:shadow-glass-hover focus:ring-brand-500',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 focus:ring-rose-500',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2.5 gap-2 h-10',
      lg: 'text-base px-6 py-3.5 gap-2.5 h-12 rounded-2xl',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
