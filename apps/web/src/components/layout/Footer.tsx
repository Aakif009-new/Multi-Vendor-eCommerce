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
  Package,
  Heart,
  Sparkles,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-950 text-surface-400 border-t border-surface-900 pt-16 pb-12 text-left">
      {/* Platform Value Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-surface-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-900/40 border border-surface-800/60">
            <div className="p-2 rounded-xl bg-surface-800 text-surface-200 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Trusted Merchants</h4>
              <p className="text-[11px] text-surface-400 leading-snug">
                Curated independent stores verified for catalog and shipping excellence.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-900/40 border border-surface-800/60">
            <div className="p-2 rounded-xl bg-surface-800 text-surface-200 shrink-0">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Verified Reviews</h4>
              <p className="text-[11px] text-surface-400 leading-snug">
                Customer feedback exclusively published from delivered purchases.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-900/40 border border-surface-800/60">
            <div className="p-2 rounded-xl bg-surface-800 text-surface-200 shrink-0">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Secure Checkout</h4>
              <p className="text-[11px] text-surface-400 leading-snug">
                Encrypted payment transactions with Razorpay sandbox test mode protection.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface-900/40 border border-surface-800/60">
            <div className="p-2 rounded-xl bg-surface-800 text-surface-200 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">Account Privacy</h4>
              <p className="text-[11px] text-surface-400 leading-snug">
                Isolated customer account data with strict JWT session security.
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
              <div className="h-8 w-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xs">
                <Store className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-black tracking-tight text-white">
                BAZAAR<span className="text-brand-400 font-medium">ONE</span>
              </span>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed max-w-sm">
              A modern multi-vendor marketplace connecting customers with trusted independent stores across electronics, fashion, home, beauty, and everyday essentials.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-900 text-emerald-400 text-[10px] font-semibold border border-surface-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Marketplace
              </span>
            </div>
          </div>

          {/* Column 1: Featured Stores */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-surface-200">Featured Stores</h5>
            <ul className="space-y-2 text-xs text-surface-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Store className="h-3 w-3 text-amber-500" /> Apex Electronics
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Store className="h-3 w-3 text-amber-500" /> UrbanCart
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Store className="h-3 w-3 text-amber-500" /> HomeNest
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Store className="h-3 w-3 text-amber-500" /> PlaySphere
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Hub */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-surface-200">Customer Hub</h5>
            <ul className="space-y-2 text-xs text-surface-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Package className="h-3 w-3 text-brand-400" /> Order History & Tracking
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Heart className="h-3 w-3 text-rose-400" /> Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3 text-emerald-400" /> Payment Transactions
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-purple-400" /> Account Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Governance */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-surface-200">Portals & System</h5>
            <ul className="space-y-2 text-xs text-surface-400">
              <li>
                <Link href="/vendor" className="hover:text-white transition-colors">
                  Merchant Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin Console
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Authentication Gate
                </Link>
              </li>
              <li>
                <a href="/api/health" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  API Health Status
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & Sub-footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-surface-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-surface-500">
        <p>&copy; {new Date().getFullYear()} BazaarOne Multi-Vendor Marketplace. All rights reserved.</p>
        <div className="flex items-center gap-6 text-[11px]">
          <span className="hover:text-surface-300 transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-surface-300 transition-colors cursor-pointer">Terms of Service</span>
          <span className="hover:text-surface-300 transition-colors cursor-pointer">Security Center</span>
          <a href="/api/health" target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors">
            System Status
          </a>
        </div>
      </div>
    </footer>
  );
};

