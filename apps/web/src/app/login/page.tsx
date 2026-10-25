'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Tabs } from '@/components/ui/Tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleRoleRedirect = (authUser?: { role?: string }) => {
    const role = authUser?.role || user?.role;
    if (role === 'ADMIN') {
      router.push('/admin');
    } else if (role === 'VENDOR') {
      router.push('/vendor');
    } else {
      router.push('/');
    }
  };

  // If already authenticated, redirect to role destination
  useEffect(() => {
    if (!isLoading && user) {
      handleRoleRedirect(user);
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-surface-400 font-semibold tracking-wider uppercase">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface-950 via-brand-950 to-surface-900 text-surface-900">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-surface-200 overflow-hidden animate-slide-up text-left">
        {/* Decorative Header */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-accent-cyan p-6 sm:p-8 text-white relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">
              BAZAAR<span className="font-normal opacity-90">ONE</span>
            </span>
          </div>

          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            {activeTab === 'login' ? 'Sign in to Access Portal' : 'Create an Account'}
          </h2>
          <p className="text-xs text-white/80 mt-1">
            Authentication is required to access the marketplace, merchant tools, and governance console.
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex justify-center">
            <Tabs
              items={[
                { id: 'login', label: 'Sign In' },
                { id: 'register', label: 'Register' },
              ]}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as any)}
            />
          </div>

          {activeTab === 'login' ? (
            <LoginForm
              onSuccess={(loggedUser) => handleRoleRedirect(loggedUser)}
              onSwitchToRegister={() => setActiveTab('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={(registeredUser) => handleRoleRedirect(registeredUser)}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
