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
  Heart,
  MapPin,
  Shield,
  Layers,
  Package,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

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
}

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
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-surface-200/80 shadow-xs">
      {/* Top Banner with Active Persona Indicator */}
      <div className="bg-gradient-to-r from-surface-950 via-brand-950 to-surface-900 text-white text-[11px] font-medium py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent-gold animate-pulse" />
            <span className="hidden sm:inline">
              BazaarOne Verified Multi-Vendor Marketplace &bull; Indian Handcrafted & Consumer Goods
            </span>
            <span className="sm:hidden">BazaarOne Marketplace</span>
          </div>

          {/* Authenticated Role Status Tag */}
          <div className="flex items-center gap-2">
            {userRole ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-bold">
                <span
                  className={`h-2 w-2 rounded-full ${
                    userRole === 'ADMIN'
                      ? 'bg-purple-400'
                      : userRole === 'VENDOR'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                Signed in as {userRole} ({userName?.split(' ')[0] || 'User'})
              </span>
            ) : (
              <span className="text-[10px] text-surface-300">Guest Visitor</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => onSelectView && onSelectView(userRole === 'ADMIN' ? 'admin' : userRole === 'VENDOR' ? 'vendor' : 'customer')}
            className="flex items-center gap-2.5 group select-none cursor-pointer"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="h-full w-full bg-surface-950 rounded-[14px] flex items-center justify-center">
                {userRole === 'ADMIN' ? (
                  <Shield className="h-5 w-5 text-purple-400" />
                ) : userRole === 'VENDOR' ? (
                  <Store className="h-5 w-5 text-amber-400" />
                ) : (
                  <Store className="h-5 w-5 text-emerald-400" />
                )}
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display text-lg font-extrabold tracking-tight text-surface-900 leading-tight flex items-center gap-1">
                BAZAAR<span className="text-brand-600 font-normal">ONE</span>
              </span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-surface-400">
                {userRole === 'ADMIN'
                  ? 'Super Admin Portal'
                  : userRole === 'VENDOR'
                  ? 'Merchant Portal'
                  : 'Multi-Vendor Marketplace'}
              </span>
            </div>
          </div>

          {/* Dynamic Navigation Links based on Authenticated Role */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-surface-700">
            {/* 1. CUSTOMER OR GUEST NAVIGATION */}
            {(!userRole || userRole === 'CUSTOMER') && (
              <>
                <button
                  onClick={() => onSelectView && onSelectView('customer')}
                  className={`hover:text-brand-600 transition-colors ${
                    activeView === 'customer' ? 'text-brand-600' : ''
                  }`}
                >
                  Marketplace
                </button>
                <button
                  onClick={() => {
                    onSelectView && onSelectView('customer');
                    const el = document.getElementById('catalog-filters');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-brand-600 transition-colors"
                >
                  Categories (12)
                </button>
                {userRole === 'CUSTOMER' && onOpenOrders && (
                  <button
                    onClick={onOpenOrders}
                    className="hover:text-brand-600 transition-colors flex items-center gap-1"
                  >
                    <Package className="h-3.5 w-3.5 text-brand-600" /> My Orders ({ordersCount})
                  </button>
                )}
                {userRole === 'CUSTOMER' && onOpenAddresses && (
                  <button
                    onClick={onOpenAddresses}
                    className="hover:text-brand-600 transition-colors flex items-center gap-1"
                  >
                    <MapPin className="h-3.5 w-3.5 text-brand-600" /> Saved Addresses
                  </button>
                )}
                {!userRole && onOpenVendorApply && (
                  <button
                    onClick={onOpenVendorApply}
                    className="hover:text-amber-600 transition-colors text-amber-700 font-semibold"
                  >
                    Become a Seller
                  </button>
                )}
              </>
            )}

            {/* 2. VENDOR NAVIGATION (Strictly Merchant Tools) */}
            {userRole === 'VENDOR' && (
              <>
                <Link
                  href="/vendor"
                  className="flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <Store className="h-3.5 w-3.5" /> Merchant Dashboard
                </Link>
              </>
            )}

            {/* 3. ADMIN NAVIGATION (Strictly Platform Governance) */}
            {userRole === 'ADMIN' && (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 font-bold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" /> Admin Console
                </Link>
              </>
            )}
          </nav>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Customer Only Icons: Wishlist & Cart */}
            {(!userRole || userRole === 'CUSTOMER') && (
              <>
                {onOpenWishlist && (
                  <button
                    onClick={onOpenWishlist}
                    className="relative p-2 rounded-xl text-surface-600 hover:text-rose-600 hover:bg-rose-50/50 transition-colors"
                    title="Wishlist"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                )}

                {onOpenCart && (
                  <button
                    onClick={onOpenCart}
                    className="relative p-2 rounded-xl text-surface-600 hover:text-brand-600 hover:bg-brand-50/50 transition-colors"
                    title="Shopping Cart"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}
              </>
            )}

            {/* Authenticated User Profile Chip / Sign In Button */}
            {userRole ? (
              <div className="flex items-center gap-2 pl-2 border-l border-surface-200">
                <button
                  type="button"
                  onClick={onOpenAccount}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200/80 border border-surface-200 text-left transition-all cursor-pointer group"
                  title="Open Customer Account Hub"
                >
                  <div
                    className={`h-7 w-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-xs ${
                      userRole === 'ADMIN'
                        ? 'bg-purple-600'
                        : userRole === 'VENDOR'
                        ? 'bg-amber-600'
                        : 'bg-brand-600'
                    }`}
                  >
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-surface-900 group-hover:text-brand-600 leading-tight transition-colors">
                      {userName || 'User'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        userRole === 'ADMIN'
                          ? 'text-purple-700'
                          : userRole === 'VENDOR'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {userRole} Account
                    </span>
                  </div>
                </button>

                {onLogout && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    title="Sign Out"
                    className="text-surface-600 hover:text-rose-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-surface-200">
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

          {/* Mobile Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            {(!userRole || userRole === 'CUSTOMER') && onOpenCart && (
              <button onClick={onOpenCart} className="p-2 text-surface-700 relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-surface-700 hover:bg-surface-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-surface-200 bg-white/95 backdrop-blur-xl p-4 space-y-3 text-left animate-slide-down">
          {userRole ? (
            <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-surface-900 block">{userName}</span>
                <span className="text-[10px] text-surface-500 font-semibold">{userRole} &bull; {userEmail}</span>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-bold"
                >
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenAuthModal && onOpenAuthModal();
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onOpenAuthModal && onOpenAuthModal();
                  setMobileMenuOpen(false);
                }}
              >
                Register
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 text-xs">
            {(!userRole || userRole === 'CUSTOMER') && (
              <>
                <button
                  onClick={() => {
                    onSelectView && onSelectView('customer');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 font-semibold"
                >
                  <Store className="h-4 w-4 text-brand-600" /> Marketplace Catalog
                </button>
                {userRole === 'CUSTOMER' && onOpenOrders && (
                  <button
                    onClick={() => {
                      onOpenOrders();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 font-semibold"
                  >
                    <Package className="h-4 w-4 text-brand-600" /> My Orders ({ordersCount})
                  </button>
                )}
                {userRole === 'CUSTOMER' && onOpenAddresses && (
                  <button
                    onClick={() => {
                      onOpenAddresses();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 font-semibold"
                  >
                    <MapPin className="h-4 w-4 text-brand-600" /> Saved Shipping Addresses
                  </button>
                )}
              </>
            )}

            {userRole === 'VENDOR' && (
              <Link
                href="/vendor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 font-semibold text-amber-700"
              >
                <Store className="h-4 w-4 text-amber-600" /> Merchant Storefront & Orders
              </Link>
            )}

            {userRole === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 font-semibold text-purple-700"
              >
                <Shield className="h-4 w-4 text-purple-600" /> Super Admin Governance
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
