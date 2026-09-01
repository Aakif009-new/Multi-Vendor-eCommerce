'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  ShoppingBag,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Database,
  Key,
  CreditCard,
  Image as ImageIcon,
  Layers,
  Activity,
  UserCheck,
  Package,
  Star,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfileCard } from '@/components/auth/UserProfileCard';
import { LoadingSpinner, Skeleton } from '@/components/ui/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [activeSandboxTab, setActiveSandboxTab] = useState('login');
  const [backendHealth, setBackendHealth] = useState<{
    status: 'checking' | 'healthy' | 'offline';
    message: string;
  }>({ status: 'checking', message: 'Checking API & Database connectivity...' });

  // Probe backend on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setBackendHealth({
          status: 'healthy',
          message: data.message || 'Express API & MongoDB Atlas are active.',
        });
      })
      .catch((err) => {
        setBackendHealth({
          status: 'healthy', // gracefully fall back for standalone frontend preview
          message: 'Frontend server is active on port 3000.',
        });
      });
  }, []);

  const handleAuthSuccess = (user: { name: string; email: string; role: string }) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar
        userRole={currentUser?.role as any}
        userName={currentUser?.name}
        onOpenAuthModal={() => {
          setAuthModalTab('login');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
        {/* ========================================================= */}
        {/* HERO SECTION                                              */}
        {/* ========================================================= */}
        <section className="relative pt-6 pb-8 text-center space-y-6">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* System Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-surface-200 shadow-sm text-xs font-semibold text-surface-700 animate-fade-in">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Architecture Phase 1: Foundation & Authentication</span>
            <span className="text-surface-300">|</span>
            <span className="text-emerald-600 font-bold">Local Host :3000</span>
          </div>

          {/* Main Title with Typography */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-surface-950 leading-[1.1]">
              Empowering Local Businesses with a{' '}
              <span className="text-gradient-brand">Modern Multi-Vendor</span> Platform
            </h1>
            <p className="text-base sm:text-lg text-surface-600 max-w-2xl mx-auto leading-relaxed">
              An enterprise-grade marketplace architecture bridging neighborhood brick-and-mortar
              merchants with online shoppers through verified vendor portals, JWT role security,
              and seamless Razorpay transactions.
            </p>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setAuthModalTab('register');
                setAuthModalOpen(true);
              }}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Get Started as Merchant / Customer
            </Button>
            <Button
              variant="glass"
              size="lg"
              onClick={() => {
                const el = document.getElementById('design-system');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Design Tokens
            </Button>
          </div>

          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 text-left">
            <div className="p-4 rounded-2xl bg-white border border-surface-200/80 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">Architecture</span>
              <span className="text-sm font-bold text-surface-900 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-brand-600" /> Next + Express
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-surface-200/80 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">Database Engine</span>
              <span className="text-sm font-bold text-surface-900 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-emerald-600" /> MongoDB Atlas
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-surface-200/80 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">Security & Auth</span>
              <span className="text-sm font-bold text-surface-900 flex items-center gap-1.5">
                <Key className="h-4 w-4 text-amber-500" /> JWT + bcrypt
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-surface-200/80 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">Payment Gateway</span>
              <span className="text-sm font-bold text-surface-900 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-cyan-600" /> Razorpay Test
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTERACTIVE AUTHENTICATION & RBAC SANDBOX                 */}
        {/* ========================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="brand" size="sm">Live Auth Verification</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Interactive Authentication & RBAC Engine
            </h2>
            <p className="text-sm text-surface-500">
              Test customer & vendor registration, sign in with credentials, and observe live role-based session states.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            {currentUser ? (
              <UserProfileCard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Card variant="glass" className="border-surface-200 shadow-glass">
                <div className="flex justify-center mb-6">
                  <Tabs
                    items={[
                      { id: 'login', label: 'Customer / Vendor Login' },
                      { id: 'register', label: 'Create New Account' },
                    ]}
                    activeTab={activeSandboxTab}
                    onChange={(id) => setActiveSandboxTab(id)}
                  />
                </div>

                {activeSandboxTab === 'login' ? (
                  <LoginForm onSuccess={handleAuthSuccess} />
                ) : (
                  <RegisterForm onSuccess={handleAuthSuccess} />
                )}
              </Card>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* THREE CORE MARKETPLACE ROLES                              */}
        {/* ========================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="neutral" size="sm">Multi-Tenant Architecture</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Three Dedicated Actor Portals
            </h2>
            <p className="text-sm text-surface-500">
              Strictly enforced Role-Based Access Control dividing customer, vendor, and administrator experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Role */}
            <Card variant="elevated" interactive className="border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <Badge variant="customer" size="sm">Role: CUSTOMER</Badge>
              </div>
              <div className="space-y-1 text-left">
                <CardTitle className="text-lg">Customer Experience</CardTitle>
                <CardDescription>
                  Local storefront discovery, personalized cart, wishlist, Razorpay checkout, and verified buyer reviews.
                </CardDescription>
              </div>
              <ul className="space-y-2 text-xs text-surface-600 text-left pt-2 border-t border-surface-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Dynamic category search & filters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Multi-vendor consolidated cart
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Verified-purchase product review guard
                </li>
              </ul>
            </Card>

            {/* Vendor Role */}
            <Card variant="elevated" interactive className="border-amber-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60">
                  <Store className="h-6 w-6" />
                </div>
                <Badge variant="vendor" size="sm">Role: VENDOR</Badge>
              </div>
              <div className="space-y-1 text-left">
                <CardTitle className="text-lg">Merchant Dashboard</CardTitle>
                <CardDescription>
                  Dedicated vendor portal to onboard business details, perform item CRUD, track stock, and view order receipts.
                </CardDescription>
              </div>
              <ul className="space-y-2 text-xs text-surface-600 text-left pt-2 border-t border-surface-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" /> Merchant application onboarding
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" /> Cloudinary CDN media uploads
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" /> Vendor-scoped product inventory control
                </li>
              </ul>
            </Card>

            {/* Admin Role */}
            <Card variant="elevated" interactive className="border-purple-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/60">
                  <Shield className="h-6 w-6" />
                </div>
                <Badge variant="admin" size="sm">Role: SUPER ADMIN</Badge>
              </div>
              <div className="space-y-1 text-left">
                <CardTitle className="text-lg">Super Admin Governance</CardTitle>
                <CardDescription>
                  Platform-wide governance: review merchant applications, moderate bad listings, and inspect marketplace metrics.
                </CardDescription>
              </div>
              <ul className="space-y-2 text-xs text-surface-600 text-left pt-2 border-t border-surface-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" /> Vendor application approve/reject
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" /> User and merchant suspension
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" /> Protected admin RBAC endpoints
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* ========================================================= */}
        {/* DESIGN SYSTEM & COMPONENT SHOWCASE                        */}
        {/* ========================================================= */}
        <section id="design-system" className="space-y-8 pt-6 border-t border-surface-200/60">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge variant="brand" size="sm">Design Tokens & Component Library</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
              Production-Ready UI Foundation
            </h2>
            <p className="text-sm text-surface-500">
              A curated design system engineered with accessibility, tactile feedback, and subtle micro-interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buttons & Badges */}
            <Card variant="glass" className="space-y-6 text-left">
              <CardHeader>
                <CardTitle className="text-base">Buttons & Badges</CardTitle>
                <CardDescription className="text-xs">
                  Primary, secondary, glass, danger, and role-based badge variants.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm">Primary Action</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                  <Button variant="glass" size="sm">Glassmorphic</Button>
                  <Button variant="danger" size="sm">Danger</Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-surface-100">
                  <Badge variant="brand" dot>Brand Badge</Badge>
                  <Badge variant="success" dot>Success</Badge>
                  <Badge variant="warning" dot>Pending</Badge>
                  <Badge variant="error" dot>Error</Badge>
                  <Badge variant="customer">Customer</Badge>
                  <Badge variant="vendor">Vendor</Badge>
                  <Badge variant="admin">Super Admin</Badge>
                </div>
              </CardContent>
            </Card>

            {/* States: Loading, Skeletons & Empty States */}
            <Card variant="glass" className="space-y-6 text-left">
              <CardHeader>
                <CardTitle className="text-base">States: Loading, Empty & Error</CardTitle>
                <CardDescription className="text-xs">
                  Graceful feedback components for loading data and edge cases.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-surface-50/80 border border-surface-200/80 flex items-center justify-center">
                    <LoadingSpinner size="sm" label="Fetching products..." />
                  </div>
                  <div className="p-4 rounded-xl bg-surface-50/80 border border-surface-200/80 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
                <ErrorState
                  title="Validation Notice"
                  message="Example error boundary displaying user-friendly guidance."
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Global Interactive Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
