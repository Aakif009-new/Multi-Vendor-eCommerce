import React from 'react';
import { cn } from '@/lib/utils';
import { PackageOpen, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-surface-200 bg-surface-50/50',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-surface-200 shadow-sm text-surface-400 mb-4">
        {icon || <PackageOpen className="h-7 w-7 text-surface-400" />}
      </div>
      <h3 className="text-base font-bold text-surface-900 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-rose-200 bg-rose-50/40 text-rose-900',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-bold text-rose-900 mb-1">{title}</h4>
      <p className="text-xs text-rose-700 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
