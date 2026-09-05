'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { VendorDashboard } from '@/components/vendor/VendorDashboard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Product, Category, Brand, OrderItem } from '@/types/marketplace';

export default function VendorPageRoute() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vendorOrders, setVendorOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === 'VENDOR') {
      fetch('/api/vendors/me/products')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.data) && d.data.length > 0) {
            setProducts(d.data);
          } else {
            fetch('/api/products?limit=50')
              .then((r2) => r2.json())
              .then((d2) => {
                if (d2.success && d2.data) setProducts(d2.data);
              })
              .catch(() => {});
          }
        })
        .catch(() => {});

      fetch('/api/categories')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data) setCategories(d.data);
        })
        .catch(() => {});
    }
  }, [user]);

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

  // Route Protection: Block non-vendors
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
          onCreateProduct={async () => {}}
          onUpdateProduct={async () => {}}
          onDeleteProduct={async () => {}}
          onToggleStatus={async () => {}}
        />
      </main>
      <Footer />
    </div>
  );
}
