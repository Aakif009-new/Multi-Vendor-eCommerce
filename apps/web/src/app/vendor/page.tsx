'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  ShieldAlert,
  ArrowLeft,
  Clock,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Building2,
  Mail,
  ShieldCheck,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { VendorDashboard } from '@/components/vendor/VendorDashboard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Product, Category, Brand, OrderItem } from '@/types/marketplace';

export default function VendorPageRoute() {
  const router = useRouter();
  const { user, isLoading, logout, refreshUser } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vendorOrders, setVendorOrders] = useState<OrderItem[]>([]);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchVendorProducts = async () => {
    try {
      const res = await fetch('/api/vendors/me/products', { credentials: 'include' });
      const d = await res.json();
      if (d.success && Array.isArray(d.data)) {
        setProducts(d.data);
      }
    } catch {}
  };

  const fetchVendorOrders = async () => {
    try {
      const res = await fetch('/api/orders/vendor', { credentials: 'include' });
      const d = await res.json();
      if (d.success && Array.isArray(d.data)) {
        setVendorOrders(d.data);
      }
    } catch {}
  };

  // Only fetch operational vendor resources if the vendor is officially APPROVED
  useEffect(() => {
    if (user && user.role === 'VENDOR' && user.vendor?.status === 'APPROVED') {
      fetchVendorProducts();
      fetchVendorOrders();

      fetch('/api/categories', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data) setCategories(d.data);
        })
        .catch(() => {});

      fetch('/api/brands', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data) setBrands(d.data);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleCreateProduct = async (data: any) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create product');
    }
    await fetchVendorProducts();
  };

  const handleUpdateProduct = async (id: string, data: any) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update product');
    }
    await fetchVendorProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete product');
    }
    await fetchVendorProducts();
  };

  const handleToggleStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/products/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update product status');
    }
    await fetchVendorProducts();
  };

  const handleUpdateOrderStatus = async (orderItemId: string, status: string) => {
    const res = await fetch(`/api/orders/vendor/items/${orderItemId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update order status');
    }
    await fetchVendorOrders();
  };

  const handleCheckApprovalStatus = async () => {
    setIsCheckingStatus(true);
    setStatusMessage(null);
    try {
      const refreshed = await refreshUser(true);
      if (refreshed?.vendor?.status === 'APPROVED') {
        setStatusMessage('Congratulations! Your application has been APPROVED. Loading your dashboard...');
      } else if (refreshed?.vendor?.status === 'REJECTED') {
        setStatusMessage('Your application was not approved. Please see rejection details below.');
      } else {
        setStatusMessage('Your application is still under review by Super Admin. Please check back shortly.');
      }
    } catch {
      setStatusMessage('Unable to connect to verification server. Please try again.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 text-white">
        <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Route Protection 1: Block non-vendor roles (Customer, Guest)
  if (user.role !== 'VENDOR') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-surface-50">
        <Navbar userRole={user.role} userName={user.name} onLogout={handleLogout} />
        <div className="max-w-md mx-auto p-8 my-auto bg-white rounded-3xl border border-surface-200 shadow-xl text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-surface-900">Vendor Portal Restricted</h3>
          <p className="text-xs text-surface-500 leading-relaxed">
            You are signed in as <span className="font-bold text-surface-800">{user.role}</span>.
            Access to merchant product and order management requires an approved Vendor account.
          </p>
          <Button variant="primary" size="md" onClick={() => router.push('/')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Authorized Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Route Protection 2: Vendor Application PENDING Super Admin Review
  if (user.vendor && user.vendor.status === 'PENDING') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-surface-50">
        <Navbar userRole={user.role} userName={user.name} onLogout={handleLogout} />
        <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-amber-200/80 shadow-2xl overflow-hidden animate-slide-up text-left">
            {/* Top Amber Status Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-6 sm:p-8 text-white relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                  <span className="h-2 w-2 rounded-full bg-amber-200 animate-ping" />
                  Application Status: Pending Review
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight">
                Merchant Application Under Review
              </h2>
              <p className="text-xs text-amber-100 mt-1 max-w-lg leading-relaxed">
                Thank you for applying to sell on BazaarOne. Your merchant details and compliance documentation have been submitted successfully.
              </p>
            </div>

            {/* Application Information Card */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Administrator Verification in Progress</p>
                  <p className="text-amber-800 mt-0.5">
                    To maintain high buyer trust and tax compliance, all new vendor storefronts require manual verification by our Super Administrator. Product catalog CRUD, inventory controls, and order dispatch features will be enabled immediately upon approval.
                  </p>
                </div>
              </div>

              {/* Submitted Store Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500">
                  Application Summary Records
                </h4>
                <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200/80 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-surface-500">Business / Trade Name:</span>
                    <span className="font-bold text-surface-900">{user.vendor.businessName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-500">Registered Merchant Email:</span>
                    <span className="font-medium text-surface-800">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-500">Current Review Stage:</span>
                    <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Queue: Super Admin Document Inspection
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Message Feedback Alert */}
              {statusMessage && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-semibold flex items-center gap-2 animate-fade-in">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Interactive Actions */}
              <div className="pt-2 space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-md shadow-amber-600/20"
                  onClick={handleCheckApprovalStatus}
                  isLoading={isCheckingStatus}
                  leftIcon={<RefreshCw className={`h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />}
                >
                  Check Approval Status
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full text-xs font-semibold"
                    onClick={() => router.push('/')}
                    leftIcon={<ShoppingBag className="h-4 w-4" />}
                  >
                    Browse Marketplace
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="h-4 w-4" />}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Route Protection 3: Vendor Application REJECTED
  if (user.vendor && user.vendor.status === 'REJECTED') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-surface-50">
        <Navbar userRole={user.role} userName={user.name} onLogout={handleLogout} />
        <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl overflow-hidden animate-slide-up text-left">
            <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 p-6 sm:p-8 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                  <XCircle className="h-3.5 w-3.5 text-white" />
                  Application Status: Not Approved
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight">
                Vendor Application Rejected
              </h2>
              <p className="text-xs text-rose-100 mt-1 max-w-lg leading-relaxed">
                Your merchant application to sell on BazaarOne was reviewed by the Super Administrator and was not approved.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
                <p className="font-bold">Reason &amp; Next Steps:</p>
                <p className="mt-1">
                  Applications may be rejected due to document mismatches, invalid tax identification numbers, or platform compliance policy restrictions. If you believe this decision was made in error or wish to provide updated compliance documentation, please contact administrator support.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-surface-500">Store Name:</span>
                  <span className="font-bold text-surface-900">{user.vendor.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Registered Email:</span>
                  <span className="font-medium text-surface-800">{user.email}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1 font-bold"
                  onClick={() => router.push('/')}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Return to Marketplace
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="font-semibold text-rose-600 hover:bg-rose-50"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-4 w-4" />}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fully Approved Vendor: Grant access to full VendorDashboard
  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-50">
      <Navbar userRole={user.role} userName={user.name} onLogout={handleLogout} />
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <VendorDashboard
          products={products}
          categories={categories}
          brands={brands}
          vendorOrders={vendorOrders}
          stats={{
            totalProducts: products.length,
            activeProducts: products.filter((p) => p.status === 'ACTIVE').length,
            lowStockProducts: products.filter((p) => p.stock < 5).length,
            totalInventoryValue: products.reduce((acc, p) => acc + p.price * p.stock, 0),
          }}
          vendorName={user.name || 'Merchant Storefront'}
          onCreateProduct={handleCreateProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleStatus={handleToggleStatus}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      </main>
      <Footer />
    </div>
  );
}
