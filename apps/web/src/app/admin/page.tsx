'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Product, Category, Brand, AdminStats, VendorApplication } from '@/types/marketplace';

export default function AdminPageRoute() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 8,
    totalVendors: 4,
    pendingApplications: 0,
    totalProducts: 100,
    activeProducts: 100,
    totalCategories: 12,
    totalBrands: 6,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const fetchStats = async () => {
    try {
      const r = await fetch('/api/admin/stats');
      const d = await r.json();
      if (d.success && d.data) setStats(d.data);
    } catch {}
  };

  const fetchApplications = async () => {
    try {
      const r = await fetch('/api/admin/vendor-applications');
      const d = await r.json();
      if (d.success && Array.isArray(d.data)) setApplications(d.data);
    } catch {}
  };

  const fetchVendors = async () => {
    try {
      const r = await fetch('/api/vendors');
      const d = await r.json();
      if (d.success && Array.isArray(d.data)) setVendors(d.data);
    } catch {}
  };

  const fetchProducts = async () => {
    try {
      const r = await fetch('/api/products?limit=100');
      const d = await r.json();
      if (d.success && Array.isArray(d.data)) setProducts(d.data);
    } catch {}
  };

  const fetchCategories = async () => {
    try {
      const r = await fetch('/api/categories');
      const d = await r.json();
      if (d.success && Array.isArray(d.data)) setCategories(d.data);
    } catch {}
  };

  const fetchBrands = async () => {
    try {
      const r = await fetch('/api/brands');
      const d = await r.json();
      if (d.success && Array.isArray(d.data)) setBrands(d.data);
    } catch {}
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchStats();
      fetchApplications();
      fetchVendors();
      fetchProducts();
      fetchCategories();
      fetchBrands();
    }
  }, [user]);

  const handleReviewApplication = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const res = await fetch(`/api/admin/vendor-applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to review application');
    }
    await Promise.all([fetchApplications(), fetchVendors(), fetchStats()]);
  };

  const handleModerateProduct = async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    const res = await fetch(`/api/admin/products/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to moderate product');
    }
    await Promise.all([fetchProducts(), fetchStats()]);
  };

  const handleCreateCategory = async (data: { name: string; description?: string }) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create category');
    }
    await Promise.all([fetchCategories(), fetchStats()]);
  };

  const handleCreateBrand = async (data: { name: string; description?: string }) => {
    const res = await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create brand');
    }
    await Promise.all([fetchBrands(), fetchStats()]);
  };

  const handleDeactivateCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to deactivate category');
    }
    await Promise.all([fetchCategories(), fetchStats()]);
  };

  const handleSeed100Products = async () => {
    const res = await fetch('/api/seed/100-products', {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to reseed products');
    }
    await Promise.all([fetchProducts(), fetchCategories(), fetchStats()]);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 text-white">
        <div className="h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Route Protection: Block non-admins
  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-surface-50">
        <Navbar userRole={user.role} userName={user.name} onLogout={handleLogout} />
        <div className="max-w-md mx-auto p-8 my-auto bg-white rounded-3xl border border-surface-200 shadow-xl text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-surface-900">Super Admin Access Denied</h3>
          <p className="text-xs text-surface-500 leading-relaxed">
            You are signed in as <span className="font-bold text-surface-800">{user.role}</span>.
            Platform governance and system moderation controls require Super Administrator privileges.
          </p>
          <Button variant="primary" size="md" onClick={() => router.push('/')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Authorized Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-50">
      <Navbar userRole={user.role} userName={user.name} onLogout={handleLogout} />
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <AdminDashboard
          stats={stats}
          applications={applications}
          products={products}
          categories={categories}
          brands={brands}
          vendors={vendors}
          onReviewApplication={handleReviewApplication}
          onModerateProduct={handleModerateProduct}
          onCreateCategory={handleCreateCategory}
          onCreateBrand={handleCreateBrand}
          onDeactivateCategory={handleDeactivateCategory}
          onSeed100Products={handleSeed100Products}
        />
      </main>
      <Footer />
    </div>
  );
}
