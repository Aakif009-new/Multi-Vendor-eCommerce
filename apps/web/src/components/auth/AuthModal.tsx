'use client';

import React, { useState } from 'react';
import { X, Sparkles, Store, Shield } from 'lucide-react';
import { Tabs } from '../ui/Tabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onAuthSuccess?: (user: { name: string; email: string; role: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onAuthSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-surface-200/80 overflow-hidden animate-slide-up">
        {/* Modal Header & Decorative Top Accent */}
        <div className="bg-gradient-to-r from-brand-600 to-accent-cyan p-6 text-white text-left relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-semibold tracking-wide backdrop-blur-xs mb-3">
            <Sparkles className="h-3.5 w-3.5 text-accent-gold" />
            BazaarOne Marketplace Identity
          </div>
          <h3 className="font-display text-2xl font-extrabold tracking-tight">
            {activeTab === 'login' ? 'Welcome Back' : 'Join Our Network'}
          </h3>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            {activeTab === 'login'
              ? 'Access your unified customer, vendor, or admin dashboard.'
              : 'Empowering neighborhood merchants & shoppers nationwide.'}
          </p>
        </div>

        {/* Modal Body & Tab Switcher */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex justify-center">
            <Tabs
              items={[
                { id: 'login', label: 'Sign In' },
                { id: 'register', label: 'New Account' },
              ]}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as 'login' | 'register')}
            />
          </div>

          {activeTab === 'login' ? (
            <LoginForm
              onSuccess={(user) => {
                if (onAuthSuccess) onAuthSuccess(user);
                onClose();
              }}
              onSwitchToRegister={() => setActiveTab('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={(user) => {
                if (onAuthSuccess) onAuthSuccess(user);
                onClose();
              }}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
