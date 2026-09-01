'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export interface LoginFormProps {
  onSuccess?: (user: { name: string; email: string; role: string }) => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Call Phase 1 /api/auth/login endpoint
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      if (onSuccess) {
        onSuccess(data.data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Could not log in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credential autofill for easy review
  const setDemoCredentials = (role: 'CUSTOMER' | 'VENDOR') => {
    if (role === 'CUSTOMER') {
      setEmail('customer@bazaarone.com');
      setPassword('Customer@12345');
    } else {
      setEmail('vendor@bazaarone.com');
      setPassword('Vendor@12345');
    }
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 animate-shake">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        placeholder="alex@example.com"
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

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-surface-600 select-none">
          <input
            type="checkbox"
            className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            defaultChecked
          />
          Remember device
        </label>
        <span className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer">
          Forgot password?
        </span>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        Sign In to Portal
      </Button>

      {/* Quick Demo Pre-fill for reviewers */}
      <div className="pt-2 border-t border-surface-100 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 mb-2">
          Or Quick Test with Role Credentials
        </p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setDemoCredentials('CUSTOMER')}
            className="px-2.5 py-1 text-xs rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-700 font-medium transition-colors"
          >
            Customer Demo
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('VENDOR')}
            className="px-2.5 py-1 text-xs rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-700 font-medium transition-colors"
          >
            Vendor Demo
          </button>
        </div>
      </div>

      {onSwitchToRegister && (
        <p className="text-xs text-center text-surface-500 pt-2">
          New to BazaarOne?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-brand-600 hover:text-brand-700"
          >
            Create an account
          </button>
        </p>
      )}
    </form>
  );
};
