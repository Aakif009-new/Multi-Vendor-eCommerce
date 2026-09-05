'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  CreditCard,
  UserCheck,
  Building2,
  Lock,
  Layers,
  Sparkles,
  Heart,
  Package,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-950 text-surface-300 border-t border-surface-900 pt-16 pb-12 text-left">
      {/* Platform Value Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-surface-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-900/50 border border-surface-800">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Approved Merchants</h4>
              <p className="text-xs text-surface-400 leading-snug">
                4 specialized partner stores covering 12 curated categories.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-900/50 border border-surface-800">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Verified Reviews</h4>
              <p className="text-xs text-surface-400 leading-snug">
                Feedback strictly verified from authentic delivered purchases.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-900/50 border border-surface-800">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Razorpay Sandbox</h4>
              <p className="text-xs text-surface-400 leading-snug">
                256-bit encrypted checkout with test mode payment simulation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-900/50 border border-surface-800">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Data Isolation</h4>
              <p className="text-xs text-surface-400 leading-snug">
                Strict customer account privacy and JWT session security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Identity Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
                <Store className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                BAZAAR<span className="text-brand-400">ONE</span>
              </span>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed max-w-sm">
              Modern multi-vendor e-commerce platform connecting customers with specialized independent merchants across electronics, fashion, living, and fitness.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                MongoDB Atlas Connected
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-400 text-[11px] font-semibold border border-brand-500/20">
                12 Curated Categories
              </span>
            </div>
          </div>

          {/* Column 1: Featured Merchants */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Our Merchants</h5>
            <ul className="space-y-2 text-xs text-surface-400">
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <Store className="h-3 w-3 text-amber-500" /> Apex Electronics (26)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <Store className="h-3 w-3 text-amber-500" /> UrbanCart (26)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <Store className="h-3 w-3 text-amber-500" /> HomeNest (22)
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <Store className="h-3 w-3 text-amber-500" /> PlaySphere (26)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Account */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Customer Hub</h5>
            <ul className="space-y-2 text-xs text-surface-400">
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <Package className="h-3 w-3 text-brand-400" /> Order History & Tracking
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <Heart className="h-3 w-3 text-rose-400" /> Saved Wishlist Items
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3 text-emerald-400" /> Payment Transactions
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-purple-400" /> Account & Profile Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Governance */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Portals & Access</h5>
            <ul className="space-y-2 text-xs text-surface-400">
              <li>
                <Link href="/vendor" className="hover:text-brand-400 transition-colors">
                  Vendor Partner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-400 transition-colors">
                  Super Admin Governance
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-400 transition-colors">
                  Authentication Gate
                </Link>
              </li>
              <li>
                <a href="/api/health" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">
                  API Health Status
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & Sub-footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-surface-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-surface-500">
        <p>&copy; {new Date().getFullYear()} BazaarOne Multi-Vendor Marketplace Inc. All rights reserved.</p>
        <div className="flex items-center gap-6 text-[11px]">
          <span className="hover:text-surface-400 transition-colors">Privacy Policy</span>
          <span className="hover:text-surface-400 transition-colors">Terms of Service</span>
          <span className="hover:text-surface-400 transition-colors">Payment Security</span>
          <a href="/api/health" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">
            System Status
          </a>
        </div>
      </div>
    </footer>
  );
};
