'use client';

import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { evaluatePasswordStrength } from '@/lib/passwordStrength';
import { cn } from '@/lib/utils';

export interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  className,
}) => {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);

  return (
    <div className={cn('space-y-2.5 pt-1 animate-fade-in text-left', className)} aria-live="polite">
      {/* Visual 4-Segment Strength Bar & Label */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-surface-600 flex items-center gap-1.5">
            {strength.score >= 3 ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            )}
            Password Strength:
          </span>
          <span
            className={cn('font-bold text-xs uppercase tracking-wider', strength.textColor)}
            role="status"
          >
            {strength.label}
          </span>
        </div>

        <div
          className="grid grid-cols-4 gap-1.5 h-1.5 w-full rounded-full overflow-hidden bg-surface-100"
          role="progressbar"
          aria-valuenow={strength.score}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label={`Password strength: ${strength.label}`}
        >
          {[1, 2, 3, 4].map((step) => {
            const isActive = strength.score >= step;
            return (
              <div
                key={step}
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isActive ? strength.barColor : 'bg-surface-200'
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Helpful feedback if short or common */}
      {strength.feedback && (
        <p className={cn('text-[11px] font-medium leading-tight', strength.textColor)}>
          {strength.feedback}
        </p>
      )}

      {/* Password Requirements Checklist */}
      <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-200/80 space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500 block">
          Password Requirements:
        </span>
        <ul className="space-y-1 text-xs">
          {strength.requirements.map((req) => (
            <li
              key={req.id}
              className={cn(
                'flex items-center gap-2 text-[11px] transition-colors',
                req.met ? 'text-emerald-700 font-medium' : 'text-surface-500'
              )}
            >
              {req.met ? (
                <span className="h-3.5 w-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5" />
                </span>
              ) : (
                <span className="h-3.5 w-3.5 rounded-full bg-surface-200 text-surface-400 flex items-center justify-center shrink-0">
                  <span className="h-1 w-1 rounded-full bg-surface-400" />
                </span>
              )}
              {req.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
