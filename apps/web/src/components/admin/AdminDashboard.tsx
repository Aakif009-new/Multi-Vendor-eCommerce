'use client';

import React, { useState, useMemo } from 'react';
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
  FileText,
  ExternalLink,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { AdminStats, VendorApplication, Product, Category, Brand, VendorSummary } from '@/types/marketplace';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Toast } from '../ui/Toast';

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

  // Search State for each module
  const [vendorSearch, setVendorSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  // Category / Brand creation state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'primary' | 'success';
    action: () => Promise<void>;
  } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // 1. Filtered Vendors
  const filteredVendors = useMemo(() => {
    if (!vendorSearch.trim()) return vendors;
    const q = vendorSearch.toLowerCase().trim();
    return vendors.filter((v) => {
      const matchName = v.businessName?.toLowerCase().includes(q);
      const matchDesc = v.description?.toLowerCase().includes(q);
      const matchPhone = v.phone?.toLowerCase().includes(q);
      const matchAddress = v.businessAddress?.toLowerCase().includes(q);
      return matchName || matchDesc || matchPhone || matchAddress;
    });
  }, [vendors, vendorSearch]);

  // 2. Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (appStatusFilter !== 'ALL' && app.status !== appStatusFilter) return false;
      if (appSearch.trim()) {
        const q = appSearch.toLowerCase().trim();
        const matchBusiness = app.businessName?.toLowerCase().includes(q);
        const matchApplicant = app.user?.name?.toLowerCase().includes(q);
        const matchEmail = app.user?.email?.toLowerCase().includes(q);
        const matchGstin = app.gstin?.toLowerCase().includes(q);
        const matchPhone = app.phone?.toLowerCase().includes(q);
        const matchAddress = app.businessAddress?.toLowerCase().includes(q);
        if (!matchBusiness && !matchApplicant && !matchEmail && !matchGstin && !matchPhone && !matchAddress) {
          return false;
        }
      }
      return true;
    });
  }, [applications, appSearch, appStatusFilter]);

  // 3. Filtered Products
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase().trim();
    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.category?.name?.toLowerCase().includes(q);
      const matchVendor = p.vendor?.businessName?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      return matchName || matchCat || matchVendor || matchSku;
    });
  }, [products, productSearch]);

  // 4. Filtered Categories
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, categorySearch]);

  // 5. Filtered Brands
  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    const q = brandSearch.toLowerCase().trim();
    return brands.filter((b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q));
  }, [brands, brandSearch]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await onCreateCategory({ name: newCatName.trim(), description: newCatDesc.trim() });
      setToast({ isOpen: true, message: `Category "${newCatName}" created successfully!`, type: 'success' });
      setNewCatName('');
      setNewCatDesc('');
    } catch (err: any) {
      setToast({ isOpen: true, message: err.message || 'Failed to create category', type: 'error' });
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      await onCreateBrand({ name: newBrandName.trim(), description: newBrandDesc.trim() });
      setToast({ isOpen: true, message: `Brand "${newBrandName}" registered successfully!`, type: 'success' });
      setNewBrandName('');
      setNewBrandDesc('');
    } catch (err: any) {
      setToast({ isOpen: true, message: err.message || 'Failed to register brand', type: 'error' });
    }
  };

  const handleViewPanDocument = async (appId: string) => {
    try {
      const res = await fetch(`/api/admin/vendor-applications/${appId}/pan-document`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not retrieve PAN document access URL');
      }
      if (data.data?.accessUrl) {
        window.open(data.data.accessUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      setToast({ isOpen: true, message: err.message || 'Failed to open document', type: 'error' });
    }
  };

  const requestReviewAppConfirmation = (app: VendorApplication, status: 'APPROVED' | 'REJECTED') => {
    setConfirmModal({
      isOpen: true,
      title: status === 'APPROVED' ? `Approve "${app.businessName}"?` : `Reject "${app.businessName}"?`,
      description:
        status === 'APPROVED'
          ? `Are you sure you want to approve this merchant application? This will promote "${app.user?.name || 'Applicant'}" (${app.user?.email}) to VENDOR status and grant full access to merchant catalog and payout tools.`
          : `Are you sure you want to reject the merchant application for "${app.businessName}"? The storefront will not be activated.`,
      confirmText: status === 'APPROVED' ? 'Yes, Approve Vendor' : 'Yes, Reject Application',
      variant: status === 'APPROVED' ? 'success' : 'danger',
      action: async () => {
        setIsActionLoading(true);
        try {
          await onReviewApplication(app.id, status);
          setToast({
            isOpen: true,
            message: `Vendor application for "${app.businessName}" has been ${status.toLowerCase()} successfully!`,
            type: status === 'APPROVED' ? 'success' : 'info',
          });
          setConfirmModal(null);
        } catch (err: any) {
          setToast({ isOpen: true, message: err.message || 'Failed to process application review', type: 'error' });
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  const requestModerateProductConfirmation = (prod: Product, nextStatus: 'ACTIVE' | 'SUSPENDED') => {
    setConfirmModal({
      isOpen: true,
      title: nextStatus === 'SUSPENDED' ? `Suspend "${prod.name}"?` : `Reactivate "${prod.name}"?`,
      description:
        nextStatus === 'SUSPENDED'
          ? `Are you sure you want to suspend "${prod.name}"? It will be immediately delisted from the public marketplace.`
          : `Are you sure you want to reactivate "${prod.name}"? It will become publicly visible and purchasable again.`,
      confirmText: nextStatus === 'SUSPENDED' ? 'Suspend Listing' : 'Reactivate Listing',
      variant: nextStatus === 'SUSPENDED' ? 'danger' : 'success',
      action: async () => {
        setIsActionLoading(true);
        try {
          await onModerateProduct(prod.id, nextStatus);
          setToast({
            isOpen: true,
            message: `Product "${prod.name}" has been ${nextStatus.toLowerCase()}!`,
            type: 'success',
          });
          setConfirmModal(null);
        } catch (err: any) {
          setToast({ isOpen: true, message: err.message || 'Failed to moderate product', type: 'error' });
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  const requestDeactivateCategoryConfirmation = (cat: Category) => {
    setConfirmModal({
      isOpen: true,
      title: `Deactivate Category "${cat.name}"?`,
      description: `Are you sure you want to deactivate "${cat.name}"? New products cannot be assigned to this category while deactivated.`,
      confirmText: 'Deactivate Category',
      variant: 'danger',
      action: async () => {
        setIsActionLoading(true);
        try {
          await onDeactivateCategory(cat.id);
          setToast({ isOpen: true, message: `Category "${cat.name}" has been deactivated.`, type: 'info' });
          setConfirmModal(null);
        } catch (err: any) {
          setToast({ isOpen: true, message: err.message || 'Failed to deactivate category', type: 'error' });
        } finally {
          setIsActionLoading(false);
        }
      },
    });
  };

  const handleTriggerSeed = async () => {
    if (!onSeed100Products) return;
    setIsSeeding(true);
    try {
      await onSeed100Products();
      setToast({ isOpen: true, message: 'Marketplace catalog reseeded with 100 products!', type: 'success' });
    } catch (err: any) {
      setToast({ isOpen: true, message: err.message || 'Reseeding failed', type: 'error' });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-left">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-600/10 via-purple-500/5 to-transparent border border-purple-200/60 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-surface-950 truncate">Super Admin Console</h2>
              <Badge variant="admin" size="sm" dot className="shrink-0">Platform Governance</Badge>
            </div>
            <p className="text-xs text-surface-500 truncate">Marketplace Metrics, Vendor Directory, Catalog Moderation & Taxonomy</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onSeed100Products && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerSeed}
              isLoading={isSeeding}
              leftIcon={<Sparkles className="h-4 w-4 text-purple-600" />}
              className="bg-white border-purple-200 hover:border-purple-300 text-purple-900 font-bold w-full sm:w-auto"
            >
              Reseed 100 Products
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass" className="p-3.5 sm:p-4 space-y-1">
          <span className="text-xs font-semibold text-surface-500">Verified Vendors</span>
          <span className="text-xl sm:text-2xl font-extrabold text-surface-950 flex items-center gap-2">
            <Store className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0" /> {vendors.length > 0 ? vendors.length : stats.totalVendors}
          </span>
        </Card>
        <Card variant="glass" className="p-3.5 sm:p-4 space-y-1">
          <span className="text-xs font-semibold text-surface-500">Standard Categories</span>
          <span className="text-xl sm:text-2xl font-extrabold text-surface-950 flex items-center gap-2">
            <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-brand-600 shrink-0" /> {categories.length > 0 ? categories.length : stats.totalCategories}
          </span>
        </Card>
        <Card variant="glass" className="p-3.5 sm:p-4 space-y-1">
          <span className="text-xs font-semibold text-surface-500">Pending Applications</span>
          <span className="text-xl sm:text-2xl font-extrabold text-surface-950 flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0" /> {applications.filter((a) => a.status === 'PENDING').length}
          </span>
        </Card>
        <Card variant="glass" className="p-3.5 sm:p-4 space-y-1">
          <span className="text-xs font-semibold text-surface-500">Live Active Products</span>
          <span className="text-xl sm:text-2xl font-extrabold text-surface-950 flex items-center gap-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0" /> {products.length > 0 ? products.length : stats.totalProducts}
          </span>
        </Card>
      </div>

      {/* Admin Module Tabs */}
      <div className="flex justify-start w-full overflow-x-auto scrollbar-none overscroll-contain">
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
          <div className="p-4 sm:p-5 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Approved Multi-Vendor Merchant Directory</CardTitle>
              <CardDescription className="text-xs">
                Real-time inventory and catalog distribution across verified marketplace vendors.
              </CardDescription>
            </div>
            <Badge variant="success" size="sm" className="self-start sm:self-auto">
              Showing {filteredVendors.length} of {vendors.length} Stores
            </Badge>
          </div>

          {/* Search Bar for Approved Vendors */}
          <div className="p-4 border-b border-surface-200 bg-surface-50/70 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search vendor stores by business name, phone, address..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-white border border-surface-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-surface-900 placeholder:text-surface-400 transition-all"
              />
              {vendorSearch && (
                <button
                  type="button"
                  onClick={() => setVendorSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar overscroll-contain">
            {filteredVendors.length === 0 ? (
              <div className="p-12 text-center text-surface-400 space-y-2">
                <Store className="h-10 w-10 mx-auto text-surface-300" />
                <p className="text-sm font-bold text-surface-700">No merchant stores matched your search</p>
                <p className="text-xs text-surface-400">Clear the search bar to see all active stores.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs min-w-[620px]">
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
                  {filteredVendors.map((v) => (
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
            )}
          </div>
        </Card>
      )}

      {/* Tab 1: Vendor Applications Review */}
      {activeTab === 'applications' && (
        <Card variant="glass" className="p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Merchant Onboarding Queue</CardTitle>
              <CardDescription className="text-xs">
                Review and approve or reject applicant storefronts to sell on BazaarOne.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-surface-500">
              Showing {filteredApplications.length} of {applications.length} applications
            </span>
          </div>

          {/* Search & Status Filters for Applications */}
          <div className="p-4 border-b border-surface-200 bg-surface-50/70 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search by store name, applicant name, email, GSTIN..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-white border border-surface-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-surface-900 placeholder:text-surface-400 transition-all"
              />
              {appSearch && (
                <button
                  type="button"
                  onClick={() => setAppSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 font-semibold shrink-0">Filter Status:</span>
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value as any)}
                className="text-xs py-2 px-3 rounded-xl bg-white border border-surface-200 text-surface-700 focus:outline-none focus:border-purple-600 font-medium"
              >
                <option value="ALL">All Applications</option>
                <option value="PENDING">Pending Review ({applications.filter((a) => a.status === 'PENDING').length})</option>
                <option value="APPROVED">Approved ({applications.filter((a) => a.status === 'APPROVED').length})</option>
                <option value="REJECTED">Rejected ({applications.filter((a) => a.status === 'REJECTED').length})</option>
              </select>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center text-surface-400 space-y-2">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 opacity-60" />
              <p className="text-sm font-semibold text-surface-700">No applications found</p>
              <p className="text-xs text-surface-400">
                {appSearch || appStatusFilter !== 'ALL'
                  ? 'No vendor applications match your filter criteria.'
                  : 'All applicant storefronts have been evaluated.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar overscroll-contain">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-surface-50 text-surface-500 font-semibold border-b border-surface-200">
                  <tr>
                    <th className="py-3 px-4">Business Name</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Tax & Compliance</th>
                    <th className="py-3 px-4">Contact & Address</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-surface-50/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-surface-900 block">{app.businessName}</span>
                        <span className="text-[10px] text-surface-500 line-clamp-1">{app.description || 'No description'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-surface-800 block">{app.user?.name || 'Applicant'}</span>
                        <span className="text-[10px] text-surface-400">{app.user?.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {app.gstin ? (
                            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-surface-900">
                              <span className="text-[10px] text-surface-400">GST:</span>
                              <span className="bg-amber-100/70 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                                {app.gstin}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-surface-500 italic block">
                              Sole Prop. / No GSTIN
                            </span>
                          )}

                          {app.panDocumentKey || app.panDocumentUrl ? (
                            <button
                              type="button"
                              onClick={() => handleViewPanDocument(app.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100 text-[10px] font-bold border border-brand-200 transition-colors"
                              title="View uploaded Business PAN Card"
                            >
                              <FileText className="h-3 w-3" />
                              <span>View PAN Card</span>
                              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-surface-400 block">No PAN document</span>
                          )}
                        </div>
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
                              onClick={() => requestReviewAppConfirmation(app, 'APPROVED')}
                              className="font-bold shadow-2xs"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => requestReviewAppConfirmation(app, 'REJECTED')}
                              className="font-bold shadow-2xs"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-surface-400 font-semibold uppercase">{app.status}</span>
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
          <div className="p-4 sm:p-5 border-b border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Platform Product Moderation</CardTitle>
              <CardDescription className="text-xs">
                Audit listings across all vendors and toggle catalog visibility.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-surface-500">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>

          {/* Search Bar for Product Moderation */}
          <div className="p-4 border-b border-surface-200 bg-surface-50/70">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search products by title, vendor, category, SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-white border border-surface-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-surface-900 placeholder:text-surface-400 transition-all"
              />
              {productSearch && (
                <button
                  type="button"
                  onClick={() => setProductSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar overscroll-contain">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-surface-400">
                <Package className="h-10 w-10 mx-auto mb-2 text-surface-300" />
                <p className="text-sm font-bold text-surface-700">No products match your search</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-surface-50 text-surface-500 font-semibold border-b border-surface-200 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
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
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-surface-50/50">
                      <td className="py-3 px-4 font-bold text-surface-900 max-w-xs truncate">
                        {prod.name}
                      </td>
                      <td className="py-3 px-4 text-surface-600 font-medium">
                        {prod.vendor?.businessName || 'Merchant'}
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
                            onClick={() => requestModerateProductConfirmation(prod, 'SUSPENDED')}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => requestModerateProductConfirmation(prod, 'ACTIVE')}
                          >
                            Reactivate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* Tab 3: Taxonomy (Categories & Brands) */}
      {activeTab === 'taxonomy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Categories Manager */}
          <Card variant="glass" className="space-y-4 p-4 sm:p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-base">Standard Categories ({categories.length})</CardTitle>
              <CardDescription className="text-xs">
                Search taxonomy hierarchy or add new marketplace categories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              {/* Dedicated Category Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search categories by name or slug..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-surface-900 placeholder:text-surface-400"
                />
                {categorySearch && (
                  <button
                    type="button"
                    onClick={() => setCategorySearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-surface-100">
                <Input
                  placeholder="New Category Name (e.g. Pet Supplies)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="primary" size="md" className="shrink-0 font-bold">
                  Add Category
                </Button>
              </form>

              {/* Filtered Categories List */}
              <div className="divide-y divide-surface-100 max-h-60 overflow-y-auto custom-scrollbar overscroll-contain pr-1">
                {filteredCategories.length === 0 ? (
                  <p className="py-4 text-center text-xs text-surface-400">No categories match &ldquo;{categorySearch}&rdquo;</p>
                ) : (
                  filteredCategories.map((c) => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-surface-900 text-xs block truncate">{c.name}</span>
                        <span className="text-[10px] text-surface-400 truncate">Slug: {c.slug}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={c.isActive ? 'success' : 'neutral'} size="sm">
                          {c.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                        {c.isActive && (
                          <button
                            type="button"
                            onClick={() => requestDeactivateCategoryConfirmation(c)}
                            className="text-surface-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                            title="Deactivate safely"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Brands Manager */}
          <Card variant="glass" className="space-y-4 p-4 sm:p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-base">Product Brands &amp; Manufacturers ({brands.length})</CardTitle>
              <CardDescription className="text-xs">
                Product brand labels and manufacturers (e.g. Apex Audio, Urban Stitch) that merchant vendors assign to products.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              {/* Dedicated Brand Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search brands by name or slug..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-surface-900 placeholder:text-surface-400"
                />
                {brandSearch && (
                  <button
                    type="button"
                    onClick={() => setBrandSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Add New Brand Form */}
              <form onSubmit={handleAddBrand} className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-surface-100">
                <Input
                  placeholder="New Brand Name (e.g. Royal Silk Guild)"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" variant="primary" size="md" className="shrink-0 font-bold">
                  Register Brand
                </Button>
              </form>

              {/* Filtered Brands List */}
              <div className="divide-y divide-surface-100 max-h-60 overflow-y-auto custom-scrollbar overscroll-contain pr-1">
                {filteredBrands.length === 0 ? (
                  <p className="py-4 text-center text-xs text-surface-400">No brands match &ldquo;{brandSearch}&rdquo;</p>
                ) : (
                  filteredBrands.map((b) => (
                    <div key={b.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-surface-900 text-xs block truncate">{b.name}</span>
                        <span className="text-[10px] text-surface-400 truncate">Slug: {b.slug}</span>
                      </div>
                      <Badge variant={b.isActive ? 'success' : 'neutral'} size="sm" className="shrink-0">
                        {b.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.action}
          title={confirmModal.title}
          description={confirmModal.description}
          confirmText={confirmModal.confirmText}
          cancelText="Cancel"
          variant={confirmModal.variant}
          isLoading={isActionLoading}
        />
      )}

      {/* Floating Feedback Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
