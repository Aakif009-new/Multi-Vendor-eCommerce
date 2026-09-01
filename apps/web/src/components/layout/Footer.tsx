import React from 'react';
import Link from 'next/link';
import {
  Store,
  ShieldCheck,
  CreditCard,
  Truck,
  HeartHandshake,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-950 text-surface-300 border-t border-surface-900 pt-16 pb-12">
      {/* Value Proposition Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-surface-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Local Business First</h4>
              <p className="text-xs text-surface-400">
                Direct community storefronts supporting neighborhood merchants and artisans.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Verified Merchant Hub</h4>
              <p className="text-xs text-surface-400">
                All vendors reviewed and verified through strict Super Admin onboarding.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Razorpay Verified</h4>
              <p className="text-xs text-surface-400">
                Secure checkout with encrypted card, UPI, and net-banking transactions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Authentic Reviews</h4>
              <p className="text-xs text-surface-400">
                Verified purchase policy ensuring only real buyers leave feedback.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center text-white">
                <Store className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-extrabold tracking-tight text-white">
                BAZAAR<span className="text-brand-400 font-normal">ONE</span>
              </span>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed max-w-sm">
              An enterprise-grade multi-tenant e-commerce architecture designed to bridge
              physical mom-and-pop storefronts with digital national marketplaces.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="brand" size="sm">Phase 1: Architecture Foundation</Badge>
              <Badge variant="success" size="sm" dot>MongoDB Atlas Online</Badge>
            </div>
          </div>

          {/* Column 1: Marketplace */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h5>
            <ul className="space-y-2 text-xs text-surface-400">
              <li><Link href="/" className="hover:text-brand-400 transition-colors">Merchant Directory</Link></li>
              <li><Link href="/" className="hover:text-brand-400 transition-colors">Category Catalog</Link></li>
              <li><Link href="/" className="hover:text-brand-400 transition-colors">Local Deals</Link></li>
              <li><Link href="/" className="hover:text-brand-400 transition-colors">Artisan Spotlight</Link></li>
            </ul>
          </div>

          {/* Column 2: Roles & Portals */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Portals & Roles</h5>
            <ul className="space-y-2 text-xs text-surface-400">
              <li><span className="text-surface-300 font-medium">Customer Portal</span> (Discovery, Cart, Orders)</li>
              <li><span className="text-surface-300 font-medium">Vendor Portal</span> (Storefront, Item CRUD)</li>
              <li><span className="text-surface-300 font-medium">Super Admin</span> (Moderation & Approvals)</li>
              <li><span className="text-surface-300 font-medium">RBAC Engine</span> (JWT & Middleware)</li>
            </ul>
          </div>

          {/* Column 3: Architecture Stack */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Engineering Stack</h5>
            <ul className="space-y-2 text-xs text-surface-400 font-mono text-[11px]">
              <li>Next.js (App Router)</li>
              <li>Express.js + TypeScript</li>
              <li>MongoDB Atlas + Prisma</li>
              <li>JWT + bcrypt Security</li>
              <li>Cloudinary CDN & Razorpay</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & Bottom Sub-footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-surface-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-surface-500">
        <p>&copy; {new Date().getFullYear()} BazaarOne Multi-Vendor Marketplace. University Project & Engineering Implementation.</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-surface-400 cursor-pointer">Security Policy</span>
          <span className="hover:text-surface-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-surface-400 cursor-pointer">Architecture Blueprint</span>
        </div>
      </div>
    </footer>
  );
};
