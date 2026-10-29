'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isOpen,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />,
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    },
    error: {
      icon: <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />,
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
    },
    info: {
      icon: <Info className="h-4 w-4 text-brand-600 shrink-0" />,
      bg: 'bg-brand-50 border-brand-200 text-brand-900',
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />,
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
    },
  };

  const current = typeConfig[type];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up pointer-events-auto">
      <div
        className={cn(
          'flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all',
          current.bg
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {current.icon}
          <span className="text-xs font-semibold leading-snug break-words">{message}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-current opacity-60 hover:opacity-100 transition-opacity shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
