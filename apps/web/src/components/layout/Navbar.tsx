'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  User,
  Store,
  Shield,
  Menu,
  X,
  Heart,
  MapPin,
  Package,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface NavbarProps {
  userRole?: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | null;
  userName?: string | null;
  userEmail?: string | null;
  cartCount?: number;
  wishlistCount?: number;
  ordersCount?: number;
  activeView?: 'customer' | 'vendor' | 'admin';
  onSelectView?: (view: 'customer' | 'vendor' | 'admin') => void;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onOpenOrders?: () => void;
  onOpenAddresses?: () => void;
  onOpenAccount?: () => void;
  onOpenVendorApply?: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
}

const CANONICAL_CATEGORIES = [
  { name: 'All Categories', slug: '' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Computers', slug: 'computers' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Home & Kitchen', slug: 'home-kitchen' },
  { name: 'Beauty', slug: 'beauty' },
  { name: 'Grocery', slug: 'grocery' },
  { name: 'Sports & Fitness', slug: 'sports-fitness' },
  { name: 'Books', slug: 'books' },
  { name: 'Toys & Games', slug: 'toys-games' },
  { name: 'Automotive', slug: 'automotive' },
  { name: 'Mobile Accessories', slug: 'mobile-accessories' },
];

export const Navbar: React.FC<NavbarProps> = ({
  userRole = null,
  userName = null,
  userEmail = null,
  cartCount = 0,
  wishlistCount = 0,
  ordersCount = 0,
  activeView = 'customer',
  onSelectView,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenAddresses,
  onOpenAccount,
  onOpenVendorApply,
  onOpenAuthModal,
  onLogout,
  search = '',
  onSearchChange,
  selectedCategory = '',
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    const el = document.getElementById('catalog-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-surface-200/70 transition-all">
      {/* 1. Subtle Utility Topbar */}
      <div className="border-b border-surface-100 bg-surface-50/80 text-[11px] text-surface-600 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Curated products &bull; Trusted independent merchants</span>
          </div>

          <div className="flex items-center gap-4">
            {userRole ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-surface-200 font-semibold text-surface-700 text-[10px]">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      userRole === 'ADMIN'
                        ? 'bg-purple-600'
                        : userRole === 'VENDOR'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  {userRole} Account ({userName?.split(' ')[0] || 'User'})
                </span>
              </div>
            ) : (
              <span className="text-surface-500 font-medium">Welcome to BazaarOne</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={() => onSelectView && onSelectView('customer')}
            className="flex items-center gap-2.5 select-none shrink-0 group"
          >
            <div className="h-9 w-9 rounded-xl bg-surface-900 flex items-center justify-center text-white shadow-xs group-hover:bg-brand-600 transition-colors">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display text-lg font-black tracking-tight text-surface-900 leading-none">
                BAZAAR<span className="text-brand-600 font-medium">ONE</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-surface-400 mt-0.5">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Central Search Bar */}
          {onSearchChange ? (
            <div className="hidden md:flex flex-1 max-w-xl relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products, brands and stores..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-surface-100/80 border border-surface-200/80 text-surface-900 placeholder:text-surface-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-surface-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="hidden md:block flex-1" />
          )}

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customer Navigation */}
            {(!userRole || userRole === 'CUSTOMER') && (
              <>
                {/* Wishlist Icon Button */}
                {onOpenWishlist && (
                  <button
                    type="button"
                    onClick={onOpenWishlist}
                    className="relative p-2.5 rounded-xl text-surface-600 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
                    title="Wishlist"
                    aria-label="View Saved Wishlist"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute 0.5 top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Cart Icon Button */}
                {onOpenCart && (
                  <button
                    type="button"
                    onClick={onOpenCart}
                    className="relative p-2.5 rounded-xl text-surface-600 hover:text-brand-600 hover:bg-brand-50/60 transition-colors"
                    title="Shopping Cart"
                    aria-label="View Shopping Cart"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute 0.5 top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}
              </>
            )}

            {/* Authenticated User Account Chip / Sign In */}
            {userRole ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-surface-200">
                <button
                  type="button"
                  onClick={onOpenAccount}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-surface-50 hover:bg-surface-100 border border-surface-200/80 text-left transition-all cursor-pointer group"
                  title="Open Customer Account Hub"
                >
                  <div
                    className={`h-7 w-7 rounded-lg text-white flex items-center justify-center text-xs font-bold shadow-xs ${
                      userRole === 'ADMIN'
                        ? 'bg-purple-600'
                        : userRole === 'VENDOR'
                        ? 'bg-amber-600'
                        : 'bg-surface-900 group-hover:bg-brand-600'
                    } transition-colors`}
                  >
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-bold text-surface-900 group-hover:text-brand-600 leading-tight transition-colors truncate max-w-[100px]">
                      {userName || 'Account'}
                    </span>
                    <span className="text-[10px] font-medium text-surface-500">
                      {userRole === 'CUSTOMER' ? 'Account Hub' : userRole}
                    </span>
                  </div>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl text-surface-400 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
                    aria-label="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-surface-200">
                <Button variant="ghost" size="sm" onClick={onOpenAuthModal}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={onOpenAuthModal}>
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <div className="flex md:hidden items-center ml-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-surface-700 hover:bg-surface-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Navigation Rail (Desktop) */}
      {(!userRole || userRole === 'CUSTOMER') && (
        <div className="hidden md:block border-t border-surface-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none text-xs font-medium text-surface-600">
              {CANONICAL_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors select-none ${
                      isActive
                        ? 'text-brand-600 font-bold bg-brand-50'
                        : 'hover:text-surface-900 hover:bg-surface-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white p-4 space-y-4 text-left animate-slide-down shadow-xl">
          {/* Mobile Search */}
          {onSearchChange && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products, brands and stores..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-50 border border-surface-200 text-surface-900 focus:outline-none focus:border-brand-500"
              />
            </div>
          )}

          {/* User Status in Mobile Menu */}
          {userRole && (
            <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-surface-900 block">{userName}</span>
                <span className="text-[10px] text-surface-500 font-medium">{userEmail}</span>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-bold hover:underline"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}

          {/* Category Rail (Mobile) */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 px-2 block">
              Shop Categories
            </span>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {CANONICAL_CATEGORIES.slice(1).map((cat) => {
                const isActive = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      handleCategoryClick(cat.slug);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left p-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-700 font-bold' : 'hover:bg-surface-50 text-surface-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Action Links */}
          {userRole === 'CUSTOMER' && (
            <div className="pt-2 border-t border-surface-100 space-y-1 text-xs">
              {onOpenOrders && (
                <button
                  onClick={() => {
                    onOpenOrders();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-surface-50 text-surface-700 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-brand-600" /> My Orders
                  </span>
                  <span className="text-surface-400 text-xs">({ordersCount})</span>
                </button>
              )}

              {onOpenAddresses && (
                <button
                  onClick={() => {
                    onOpenAddresses();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-50 text-surface-700 font-medium"
                >
                  <MapPin className="h-4 w-4 text-brand-600" /> Saved Addresses
                </button>
              )}

              {onOpenAccount && (
                <button
                  onClick={() => {
                    onOpenAccount();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface-50 text-surface-700 font-medium"
                >
                  <User className="h-4 w-4 text-brand-600" /> Account Settings
                </button>
              )}
            </div>
          )}

          {userRole === 'VENDOR' && (
            <Link
              href="/vendor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold"
            >
              <Store className="h-4 w-4 text-amber-600" /> Go to Vendor Dashboard
            </Link>
          )}

          {userRole === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 text-purple-800 text-xs font-bold"
            >
              <Shield className="h-4 w-4 text-purple-600" /> Go to Admin Console
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

