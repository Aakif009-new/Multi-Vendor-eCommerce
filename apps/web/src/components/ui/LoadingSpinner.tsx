import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <Loader2
        className={cn('animate-spin text-brand-600', sizes[size], className)}
      />
      {label && (
        <p className="text-xs font-medium text-surface-500 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-surface-200/80', className)}
      {...props}
    />
  );
};
