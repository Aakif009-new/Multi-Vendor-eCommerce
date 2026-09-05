'use client';

import React, { useState } from 'react';
import {
  Shield,
  Users,
  Store,
  Package,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  Star,
  MapPin,
  Phone,
} from 'lucide-react';
import { AdminStats, VendorApplication, Product, Category, Brand, VendorSummary } from '@/types/marketplace';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { Input } from '../ui/Input';

export interface AdminDashboardProps {
  stats: AdminStats;
  applications: VendorApplication[];
  products: Product[];
  categories: Category[];
  brands: Brand[];
  vendors?: (VendorSummary & { productCount?: number; description?: string; businessAddress?: string; phone?: string; rating?: number; createdAt?: string })[];
  onReviewApplication: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  onModerateProduct: (id: string, status: 'ACTIVE' | 'SUSPENDED') => Promise<void>;
  onCreateCategory: (data: { name: string; description?: string }) => Promise<void>;
  onCreateBrand: (data: { name: string; description?: string }) => Promise<void>;
  onDeactivateCategory: (id: string) => Promise<void>;
  onSeed100Products?: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  applications,
  products,
  categories,
  brands,
  vendors = [],
  onReviewApplication,
  onModerateProduct,
  onCreateCategory,
  onCreateBrand,
  onDeactivateCategory,
  onSeed100Products,
}) => {
  const [activeTab, setActiveTab] = useState('vendors');
  const [isSeeding, setIsSeeding] = useState(false);

  // Category / Brand creation state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    await onCreateCategory({ name: newCatName, description: newCatDesc });
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    await onCreateBrand({ name: newBrandName, description: newBrandDesc });
    setNewBrandName('');
    setNewBrandDesc('');
  };

  const handleTriggerSeed = async () => {
    if (!onSeed100Products) return;
    setIsSeeding(true);
    try {
      await onSeed100Products();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-600/10 via-purple-500/5 to-transparent border border-purple-200/60 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-extrabold text-surface-950">Super Admin Console</h2>
              <Badge variant="admin" size="sm" dot>Platform Governance</Badge>
            </div>
            <p className="text-xs text-surface-500">Marketplace Metrics, Vendor Directory, Catalog Moderation & 100-Product Seeder</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSeed100Products && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerSeed}
              isLoading={isSeeding}
              leftIcon={<Sparkles className="h-4 w-4 text-purple-600" />}
              className="bg-white border-purple-200 hover:border-purple-300 text-purple-900 font-bold"
            >
              Reseed 100 Products
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4 space-y-1">
          <span className="text-xs font-semibold text-surface-500">Verified Vendors</span>
          <span className="text-2xl font-extrabold text-surface-950 flex items-center gap-2">
            <Store className="h-5 w-5 text-amber-500" /> {vendors.length > 0 ? vendors.length : stats.totalVendors}
          </span>
        </Card>
        <Card variant="glass" className="p-4 space-y-1">
          <span className="text-xs font-semibold text-surface-500">Standard Categories</span>
          <span className="text-2xl font-extrabold text-surface-950 flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand-600" /> {categories.length > 0 ? categories.length : stats.totalCategories}
          </span>
        </Card>
        <Card variant="glass" className="p-4 space-y-1">
          <span className="text-xs font-semibold text-surface-500">Pending Applications</span>
          <span className="text-2xl font-extrabold text-surface-950 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" /> {applications.filter((a) => a.status === 'PENDING').length}
          </span>
        </Card>
        <Card variant="glass" className="p-4 space-y-1">
          <span className="text-xs font-semibold text-surface-500">Live Active Products</span>
          <span className="text-2xl font-extrabold text-surface-950 flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" /> {products.length > 0 ? products.length : stats.totalProducts}
          </span>
        </Card>
      </div>

      {/* Admin Module Tabs */}
      <div className="flex justify-start">
        <Tabs
          items={[
            { id: 'vendors', label: 'Approved Vendors', count: vendors.length || 4 },
            { id: 'applications', label: 'Vendor Applications', count: applications.filter((a) => a.status === 'PENDING').length },
            { id: 'products', label: 'Catalog Moderation', count: products.length },
            { id: 'taxonomy', label: 'Categories & Brands' },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
        />
      </div>

      {/* Tab 0: Approved Vendors Directory */}
      {activeTab === 'vendors' && (
        <Card variant="glass" className="p-0 overflow-hidden">
          <div className="p-5 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Approved Multi-Vendor Merchant Directory</CardTitle>
              <CardDescription className="text-xs">
                Real-time inventory and catalog distribution across verified marketplace vendors.
              </CardDescription>
            </div>
            <Badge variant="success" size="sm">
              4 Active Stores
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 text-surface-500 font-semibold border-b border-surface-200">
                <tr>
                  <th className="py-3 px-4">Merchant Store</th>
                  <th className="py-3 px-4">Contact & Location</th>
                  <th className="py-3 px-4">Assigned Products</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-sm shrink-0">
                          <Store className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-surface-900 text-sm block">{v.businessName}</span>
                          <span className="text-[11px] text-surface-500 line-clamp-1">{v.description || 'Specialized merchant store'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-surface-600">
                      <div className="space-y-0.5">
                        <span className="flex items-center gap-1 font-medium text-surface-800">
                          <Phone className="h-3 w-3 text-surface-400" /> {v.phone || '+91 98765 43210'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-surface-500">
                          <MapPin className="h-3 w-3 text-surface-400" /> {v.businessAddress || 'Bengaluru, Karnataka'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-surface-900 text-sm">
                        {v.productCount ?? products.filter((p) => p.vendorId === v.id).length}
                      </span>{' '}
                      <span className="text-surface-400 text-xs">products</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200/80">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{(v.rating || 4.9).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="success" size="sm">
                        APPROVED
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 1: Vendor Applications Review */}
      {activeTab === 'applications' && (
        <Card variant="glass" className="p-0 overflow-hidden">
          <div className="p-5 border-b border-surface-200">
            <CardTitle className="text-base">Merchant Onboarding Queue</CardTitle>
            <CardDescription className="text-xs">
              Review and approve storefronts to sell on the marketplace.
            </CardDescription>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center text-surface-400">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500 opacity-60" />
              <p className="text-sm font-semibold">No pending vendor applications</p>
              <p className="text-xs text-surface-400 mt-1">All applicant storefronts have been evaluated.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 text-surface-500 font-semibold border-b border-surface-200">
                  <tr>
                    <th className="py-3 px-4">Business Name</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Contact & Address</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-surface-50/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-surface-900 block">{app.businessName}</span>
                        <span className="text-[10px] text-surface-500 line-clamp-1">{app.description || 'No description'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-surface-800 block">{app.user?.name || 'Applicant'}</span>
                        <span className="text-[10px] text-surface-400">{app.user?.email}</span>
                      </td>
                      <td className="py-3 px-4 text-surface-600">
                        <span>{app.phone}</span>
                        <span className="block text-[10px] text-surface-400">{app.businessAddress}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={app.status === 'APPROVED' ? 'success' : app.status === 'PENDING' ? 'warning' : 'error'}
                          size="sm"
                          dot={app.status === 'PENDING'}
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {app.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onReviewApplication(app.id, 'APPROVED')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => onReviewApplication(app.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-surface-400 font-semibold uppercase">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Product Moderation */}
      {activeTab === 'products' && (
        <Card variant="glass" className="p-0 overflow-hidden">
          <div className="p-5 border-b border-surface-200">
            <CardTitle className="text-base">Platform Product Moderation</CardTitle>
            <CardDescription className="text-xs">
              Audit listings across all vendors and toggle catalog visibility.
            </CardDescription>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 text-surface-500 font-semibold border-b border-surface-200 sticky top-0">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Merchant</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-surface-50/50">
                    <td className="py-3 px-4 font-bold text-surface-900 max-w-xs truncate">
                      {prod.name}
                    </td>
                    <td className="py-3 px-4 text-surface-600 font-medium">
                      {prod.vendor?.businessName || 'Apex Electronics'}
                    </td>
                    <td className="py-3 px-4 text-surface-600 font-medium">
                      {prod.category?.name || 'Category'}
                    </td>
                    <td className="py-3 px-4 font-bold text-surface-900">
                      ₹{(prod.discountPrice ?? prod.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={prod.status === 'ACTIVE' ? 'success' : prod.status === 'SUSPENDED' ? 'error' : 'neutral'}
                        size="sm"
                      >
                        {prod.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {prod.status === 'ACTIVE' ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onModerateProduct(prod.id, 'SUSPENDED')}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onModerateProduct(prod.id, 'ACTIVE')}
                        >
                          Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Taxonomy (Categories & Brands) */}
      {activeTab === 'taxonomy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Manager */}
          <Card variant="glass" className="space-y-4">
            <CardHeader>
              <CardTitle className="text-base">12 Standard Categories ({categories.length})</CardTitle>
              <CardDescription className="text-xs">
                Manage global taxonomy tree.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <Input
                  placeholder="New Category Name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" size="md">
                  Add
                </Button>
              </form>

              <div className="divide-y divide-surface-100 max-h-60 overflow-y-auto">
                {categories.map((c) => (
                  <div key={c.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-surface-900 text-xs block">{c.name}</span>
                      <span className="text-[10px] text-surface-400">Slug: {c.slug}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.isActive ? 'success' : 'neutral'} size="sm">
                        {c.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                      {c.isActive && (
                        <button
                          onClick={() => onDeactivateCategory(c.id)}
                          className="text-surface-400 hover:text-rose-600 p-1"
                          title="Deactivate safely"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Brands Manager */}
          <Card variant="glass" className="space-y-4">
            <CardHeader>
              <CardTitle className="text-base">Verified Merchant Brands ({brands.length})</CardTitle>
              <CardDescription className="text-xs">
                Register verified artisan guilds and brands.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddBrand} className="flex gap-2">
                <Input
                  placeholder="New Brand Name"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" size="md">
                  Add
                </Button>
              </form>

              <div className="divide-y divide-surface-100 max-h-60 overflow-y-auto">
                {brands.map((b) => (
                  <div key={b.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-surface-900 text-xs block">{b.name}</span>
                      <span className="text-[10px] text-surface-400">Slug: {b.slug}</span>
                    </div>
                    <Badge variant={b.isActive ? 'success' : 'neutral'} size="sm">
                      {b.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
