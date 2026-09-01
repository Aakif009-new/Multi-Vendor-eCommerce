'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  User,
  Store,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Layers,
  Heart,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface NavbarProps {
  userRole?: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | null;
  userName?: string | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole = null,
  userName = null,
  onOpenAuthModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-surface-200/80 shadow-xs">
      {/* Top Value Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-surface-900 text-white text-[11px] font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-accent-gold animate-pulse" />
        <span>Direct-to-Consumer Local Artisan & Merchant Network &bull; Verified Local Businesses</span>
        <span className="hidden md:inline-block bg-white/10 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide">
          Phase 1 Foundation
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="h-full w-full bg-surface-950 rounded-[14px] flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-extrabold tracking-tight text-surface-900 leading-tight flex items-center gap-1.5">
                BAZAAR<span className="text-brand-600 font-normal">ONE</span>
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-surface-400">
                Multi-Vendor Marketplace
              </span>
            </div>
          </Link>

          {/* Center Search Input */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search products, local merchants, artisanal crafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2 text-xs rounded-xl bg-surface-100/80 border border-surface-200/80 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all duration-200 shadow-2xs"
              />
              <div className="absolute inset-y-1 right-1 flex items-center">
                <span className="text-[10px] uppercase font-bold text-surface-400 bg-surface-200/60 px-2 py-1 rounded-md tracking-wider">
                  Catalog
                </span>
              </div>
            </div>
          </div>

          {/* Right Navigation & Role Badges */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Vendor Onboarding Link Preview */}
            <div className="flex items-center gap-2 pr-2 border-r border-surface-200">
              <span className="text-xs font-semibold text-surface-600 hover:text-brand-600 cursor-pointer flex items-center gap-1 transition-colors">
                <Store className="h-3.5 w-3.5 text-amber-500" />
                Sell as Vendor
              </span>
            </div>

            {/* Authenticated User Status vs Public Auth Buttons */}
            {userRole ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-200">
                  <div className="h-6 w-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-surface-800 leading-tight">
                      {userName || 'User'}
                    </span>
                    <span className="text-[10px] text-surface-500 font-medium">
                      {userRole}
                    </span>
                  </div>
                  <Badge
                    variant={
                      userRole === 'ADMIN'
                        ? 'admin'
                        : userRole === 'VENDOR'
                        ? 'vendor'
                        : 'customer'
                    }
                    size="sm"
                    dot
                  >
                    {userRole}
                  </Badge>
                </div>
                {onLogout && (
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    Sign Out
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenAuthModal}
                  leftIcon={<User className="h-4 w-4" />}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenAuthModal}
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-surface-700 hover:bg-surface-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6 text-surface-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-200 bg-white/95 backdrop-blur-xl p-4 space-y-4 animate-slide-down">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search marketplace..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-surface-100 border border-surface-200"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
              <span className="text-xs font-semibold text-surface-700">Vendor Portal</span>
              <Badge variant="vendor" size="sm">Merchants</Badge>
            </div>

            {userRole ? (
              <div className="p-3 rounded-xl bg-brand-50/50 border border-brand-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-surface-900">{userName || 'Active User'}</p>
                  <p className="text-[10px] text-surface-500">Role: {userRole}</p>
                </div>
                {onLogout && (
                  <Button variant="danger" size="sm" onClick={onLogout}>
                    Logout
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" size="md" onClick={onOpenAuthModal}>
                  Sign In
                </Button>
                <Button variant="primary" size="md" onClick={onOpenAuthModal}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
