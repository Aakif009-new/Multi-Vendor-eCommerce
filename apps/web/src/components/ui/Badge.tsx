import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'neutral' | 'customer' | 'vendor' | 'admin' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'brand',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200/60',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
    error: 'bg-rose-50 text-rose-700 border-rose-200/60',
    neutral: 'bg-surface-100 text-surface-700 border-surface-200',
    customer: 'bg-blue-50 text-blue-700 border-blue-200',
    vendor: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    admin: 'bg-purple-50 text-purple-700 border-purple-300 font-bold',
    outline: 'bg-transparent text-surface-700 border-surface-300',
  };

  const dotColors = {
    brand: 'bg-brand-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    neutral: 'bg-surface-400',
    customer: 'bg-blue-500',
    vendor: 'bg-amber-500',
    admin: 'bg-purple-600',
    outline: 'bg-surface-500',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-colors select-none shadow-2xs',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full animate-pulse',
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};
