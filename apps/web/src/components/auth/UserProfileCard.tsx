'use client';

import React from 'react';
import { User, Shield, Store, ShoppingBag, LogOut, CheckCircle2, Key, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface UserProfileCardProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | string;
    status?: string;
  };
  onLogout: () => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onLogout }) => {
  const getRoleIcon = () => {
    switch (user.role) {
      case 'ADMIN':
        return <Shield className="h-5 w-5 text-purple-600" />;
      case 'VENDOR':
        return <Store className="h-5 w-5 text-amber-500" />;
      default:
        return <ShoppingBag className="h-5 w-5 text-blue-600" />;
    }
  };

  const getRoleBadgeVariant = () => {
    switch (user.role) {
      case 'ADMIN':
        return 'admin';
      case 'VENDOR':
        return 'vendor';
      default:
        return 'customer';
    }
  };

  return (
    <Card variant="glass" className="w-full max-w-lg mx-auto border-brand-200/80 shadow-glass animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-md shadow-brand-500/20">
              <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center font-bold text-brand-700 text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-extrabold text-surface-900">{user.name}</CardTitle>
              <CardDescription className="text-xs text-surface-500">{user.email}</CardDescription>
            </div>
          </div>
          <Badge variant={getRoleBadgeVariant() as any} size="md" dot>
            {user.role}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
              Account Status
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Active & Verified
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
              Auth Mechanism
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
              <Key className="h-3.5 w-3.5 text-brand-600" />
              Signed JWT Session
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100/70 border border-surface-200 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500 block mb-1.5">
            Role-Based Permissions Activated
          </span>
          <p className="text-xs text-surface-700 leading-relaxed">
            {user.role === 'ADMIN' && 'Super Admin privileges: Merchant application review, catalog controls, user moderation.'}
            {user.role === 'VENDOR' && 'Merchant privileges: Storefront catalog access, product CRUD, inventory adjustments.'}
            {user.role === 'CUSTOMER' && 'Customer privileges: Product discovery, cart management, verified reviews, checkout.'}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <span className="text-[11px] text-surface-400 font-medium">
          Session secured via HTTP-only token
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          leftIcon={<LogOut className="h-3.5 w-3.5" />}
        >
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
};
