'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Shield, Sparkles, User, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, login } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to role destination
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'VENDOR') {
        router.push('/vendor');
      } else {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'ADMIN') {
        router.push('/admin');
      } else if (loggedInUser.role === 'VENDOR') {
        router.push('/vendor');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setQuickCredentials = (role: 'CUSTOMER' | 'VENDOR' | 'ADMIN') => {
    if (role === 'CUSTOMER') {
      setEmail('customer@bazaarone.com');
      setPassword('Market@123');
    } else if (role === 'VENDOR') {
      setEmail('apex@bazaarone.com');
      setPassword('Market@123');
    } else {
      setEmail('admin@bazaarone.com');
      setPassword('Market@123');
    }
    setError(null);
  };

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
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-accent-cyan p-8 text-white relative">
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
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold animate-shake">
                  {error}
                </div>
              )}

              {/* 1-Click Role Login Helper for Localhost Testing */}
              <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500 block">
                  Quick 1-Click Role Testing:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickCredentials('CUSTOMER')}
                    className="px-2 py-1.5 rounded-xl bg-white border border-surface-200 hover:border-brand-500 text-[11px] font-bold text-surface-700 hover:text-brand-600 transition-colors shadow-2xs text-center"
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCredentials('VENDOR')}
                    className="px-2 py-1.5 rounded-xl bg-white border border-surface-200 hover:border-amber-500 text-[11px] font-bold text-surface-700 hover:text-amber-600 transition-colors shadow-2xs text-center flex items-center justify-center gap-1"
                  >
                    <Store className="h-3 w-3 text-amber-500" /> Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCredentials('ADMIN')}
                    className="px-2 py-1.5 rounded-xl bg-white border border-surface-200 hover:border-purple-500 text-[11px] font-bold text-surface-700 hover:text-purple-600 transition-colors shadow-2xs text-center flex items-center justify-center gap-1"
                  >
                    <Shield className="h-3 w-3 text-purple-600" /> Admin
                  </button>
                </div>
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="user@bazaarone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-surface-400 hover:text-surface-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md shadow-brand-600/20 mt-2"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In & Enter
              </Button>
            </form>
          ) : (
            <RegisterForm
              onSuccess={() => {
                router.push('/');
              }}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
