'use client';

import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Store, ShoppingBag } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

export interface RegisterFormProps {
  onSuccess?: (user: { name: string; email: string; role: string }) => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // Call Phase 1 /api/auth/register endpoint
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      if (onSuccess) {
        onSuccess(data.data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Could not complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 animate-shake">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Role Selection Selector */}
      <div className="space-y-1.5 text-left">
        <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600">
          Select Your Account Type
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-surface-100 border border-surface-200">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all',
              role === 'CUSTOMER'
                ? 'bg-white text-surface-900 shadow-sm border border-surface-200/80'
                : 'text-surface-600 hover:text-surface-900'
            )}
          >
            <ShoppingBag className="h-4 w-4 text-blue-600" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('VENDOR')}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all',
              role === 'VENDOR'
                ? 'bg-white text-surface-900 shadow-sm border border-surface-200/80'
                : 'text-surface-600 hover:text-surface-900'
            )}
          >
            <Store className="h-4 w-4 text-amber-500" />
            Merchant / Vendor
          </button>
        </div>
      </div>

      <Input
        label="Full Name / Business Owner"
        placeholder="Sarah Jenkins"
        value={name}
        onChange={(e) => setName(e.target.value)}
        leftIcon={<User className="h-4 w-4" />}
        required
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="sarah@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="h-4 w-4" />}
        required
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Create a strong password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock className="h-4 w-4" />}
        helperText="Must be at least 6 characters."
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
        className="w-full"
        isLoading={isLoading}
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        {role === 'VENDOR' ? 'Create Vendor Account' : 'Create Customer Account'}
      </Button>

      {onSwitchToLogin && (
        <p className="text-xs text-center text-surface-500 pt-2">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-brand-600 hover:text-brand-700"
          >
            Sign in
          </button>
        </p>
      )}
    </form>
  );
};
