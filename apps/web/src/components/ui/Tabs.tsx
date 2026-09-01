'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'pills' | 'underline' | 'glass';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onChange,
  className,
  variant = 'pills',
}) => {
  if (variant === 'underline') {
    return (
      <div className={cn('flex border-b border-surface-200 gap-6', className)}>
        {items.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 pb-3 pt-1 text-sm font-semibold transition-all relative',
                isActive
                  ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-600'
                  : 'text-surface-500 hover:text-surface-900'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-surface-100 text-surface-600">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex p-1 rounded-2xl bg-surface-100/90 border border-surface-200/80 gap-1',
        variant === 'glass' && 'glass',
        className
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 select-none',
              isActive
                ? 'bg-white text-surface-900 shadow-sm shadow-surface-900/5'
                : 'text-surface-600 hover:text-surface-900 hover:bg-white/50'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'bg-surface-200 text-surface-600'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
