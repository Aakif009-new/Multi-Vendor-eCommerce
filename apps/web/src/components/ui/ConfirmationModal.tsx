'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle, X, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      icon: <Trash2 className="h-6 w-6 text-rose-600" />,
      bg: 'bg-rose-100',
      buttonVariant: 'danger' as const,
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
      bg: 'bg-amber-100',
      buttonVariant: 'primary' as const,
    },
    primary: {
      icon: <HelpCircle className="h-6 w-6 text-brand-600" />,
      bg: 'bg-brand-100',
      buttonVariant: 'primary' as const,
    },
    success: {
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
      bg: 'bg-emerald-100',
      buttonVariant: 'primary' as const,
    },
  };

  const currentIcon = iconConfig[variant];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/60 backdrop-blur-xs animate-fade-in text-left"
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-surface-200 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-7 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0', currentIcon.bg)}>
              {currentIcon.icon}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <h3 id="modal-headline" className="font-display text-lg font-bold text-surface-950">
              {title}
            </h3>
            <p className="text-xs text-surface-600 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isLoading}
              className="font-semibold text-xs"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={currentIcon.buttonVariant}
              size="md"
              onClick={onConfirm}
              isLoading={isLoading}
              className="font-bold text-xs shadow-sm"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
