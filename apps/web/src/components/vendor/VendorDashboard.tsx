'use client';

import React, { useState, useMemo } from 'react';
import {
  Store,
  Package,
  AlertTriangle,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  X,
  UploadCloud,
  Truck,
  ShoppingCart,
  Search,
  Filter,
} from 'lucide-react';
import { Product, Category, Brand, OrderItem } from '@/types/marketplace';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Tabs } from '../ui/Tabs';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Toast } from '../ui/Toast';

export interface VendorDashboardProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  vendorOrders?: OrderItem[];
  stats: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    totalInventoryValue: number;
  };
  vendorName: string;
  onCreateProduct: (data: any) => Promise<void>;
  onUpdateProduct: (id: string, data: any) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onToggleStatus: (id: string, status: string) => Promise<void>;
  onUpdateOrderStatus?: (orderItemId: string, status: string) => Promise<void>;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({
  products,
  categories,
  brands,
  vendorOrders = [],
  stats,
  vendorName,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus,
  onUpdateOrderStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Confirmation Modals State
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{ product: Product; nextStatus: string } | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT'>('ACTIVE');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filtered Products Memo
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesSku = prod.sku?.toLowerCase().includes(q);
        const matchesCat = prod.category?.name?.toLowerCase().includes(q);
        const matchesDesc = prod.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesCat && !matchesDesc) return false;
      }
      // 2. Category Filter
      if (selectedCategory && selectedCategory !== 'all') {
        const catId = prod.categoryId || prod.category?.id;
        if (catId !== selectedCategory) return false;
      }
      // 3. Status Filter
      if (selectedStatus === 'ACTIVE') {
        if (prod.status !== 'ACTIVE') return false;
      } else if (selectedStatus === 'DRAFT') {
        if (prod.status !== 'DRAFT') return false;
      } else if (selectedStatus === 'LOW_STOCK') {
        if (prod.stock >= 5) return false;
      }
      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setStock('10');
    setCategoryId(categories[0]?.id || '');
    setBrandId('');
    setImageUrl('');
    setStatus('ACTIVE');
    setShowProductModal(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setDiscountPrice(prod.discountPrice ? prod.discountPrice.toString() : '');
    setStock(prod.stock.toString());
    setCategoryId(prod.categoryId || prod.category?.id || '');
    setBrandId(prod.brandId || prod.brand?.id || '');
    setImageUrl(prod.images && prod.images.length > 0 ? prod.images[0] : '');
    setStatus(prod.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT');
    setShowProductModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.url) {
        setImageUrl(data.data.url);
        setToast({ isOpen: true, message: 'Image uploaded successfully to Cloudinary!', type: 'success' });
      } else {
        const errorMsg = data.message || 'Cloudinary image upload failed. Please try again.';
        setToast({ isOpen: true, message: errorMsg, type: 'error' });
      }
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      setToast({ isOpen: true, message: err?.message || 'Failed to connect to image upload service.', type: 'error' });
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock, 10),
        categoryId: categoryId || categories[0]?.id,
        brandId: brandId || null,
        images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
        status,
      };

      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, payload);
        setToast({
          isOpen: true,
          message: `Product "${payload.name}" updated successfully!`,
          type: 'success',
        });
      } else {
        await onCreateProduct(payload);
        setToast({
          isOpen: true,
          message: `Product "${payload.name}" created and added to catalog!`,
          type: 'success',
        });
      }
      setShowProductModal(false);
    } catch (err: any) {
      console.error(err);
      setToast({
        isOpen: true,
        message: err.message || 'Failed to save product.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteProduct(deleteTarget.id);
      setToast({
        isOpen: true,
        message: `Product "${deleteTarget.name}" has been permanently deleted.`,
        type: 'success',
      });
      setDeleteTarget(null);
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || 'Failed to delete product.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!statusTarget) return;
    setIsChangingStatus(true);
    try {
      await onToggleStatus(statusTarget.product.id, statusTarget.nextStatus);
      setToast({
        isOpen: true,
        message: `Product status updated to ${statusTarget.nextStatus}.`,
        type: 'success',
      });
      setStatusTarget(null);
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || 'Failed to update product status.',
        type: 'error',
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleOrderStatusUpdate = async (orderItemId: string, nextStatus: string) => {
    if (!onUpdateOrderStatus) return;
    try {
      await onUpdateOrderStatus(orderItemId, nextStatus);
      setToast({
        isOpen: true,
        message: `Fulfillment status updated to ${nextStatus}.`,
        type: 'success',
      });
    } catch (err: any) {
      setToast({
        isOpen: true,
        message: err.message || 'Failed to update order status.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-left">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/60 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Store className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-surface-950 truncate">{vendorName}</h2>
              <Badge variant="vendor" size="sm" dot className="shrink-0">Approved Merchant</Badge>
            </div>
            <p className="text-xs text-surface-500 truncate">Merchant Storefront, Product Catalog & Order Fulfillment</p>
          </div>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />} className="w-full sm:w-auto shrink-0 font-bold">
          Add New Product
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass" className="p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
            Total Products
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-surface-950 flex items-center gap-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-brand-600 shrink-0" /> {stats.totalProducts}
          </span>
        </Card>

        <Card variant="glass" className="p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
            Active in Catalog
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" /> {stats.activeProducts}
          </span>
        </Card>

        <Card variant="glass" className="p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
            Low Stock Alerts
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" /> {stats.lowStockProducts}
          </span>
        </Card>

        <Card variant="glass" className="p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
            Total Inventory Value
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-surface-950 flex items-center gap-1.5 truncate">
            ₹{stats.totalInventoryValue.toLocaleString('en-IN')}
          </span>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-start w-full overflow-x-auto scrollbar-none overscroll-contain">
        <Tabs
          items={[
            { id: 'catalog', label: 'Store Catalog & Inventory', count: products.length },
            { id: 'orders', label: 'Incoming Customer Orders', count: vendorOrders.length },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'catalog' && (
        <Card variant="glass" className="overflow-hidden p-0">
          <div className="p-4 sm:p-5 border-b border-surface-200 flex flex-wrap justify-between items-center gap-2">
            <div>
              <CardTitle className="text-base">Store Catalog & Inventory</CardTitle>
              <CardDescription className="text-xs">
                Manage product pricing, stock availability, and Cloudinary media assets.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-surface-500">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>

          {/* Interactive Search & Filter Controls */}
          <div className="p-4 border-b border-surface-200 bg-surface-50/70 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search products by title, SKU, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-white border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-surface-900 placeholder:text-surface-400 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-surface-500 font-semibold shrink-0">
                <Filter className="h-3.5 w-3.5 text-surface-400" /> Filter:
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl bg-white border border-surface-200 text-surface-700 focus:outline-none focus:border-brand-500 font-medium"
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl bg-white border border-surface-200 text-surface-700 focus:outline-none focus:border-brand-500 font-medium"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active in Catalog</option>
                <option value="DRAFT">Draft / Inactive</option>
                <option value="LOW_STOCK">Low Stock (&lt; 5)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar overscroll-contain">
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-surface-400 space-y-2">
                <Package className="h-10 w-10 mx-auto text-surface-300" />
                <p className="text-sm font-bold text-surface-700">No matching products found</p>
                <p className="text-xs text-surface-400">
                  {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'Try clearing your search keyword or resetting category filters.'
                    : 'Click "Add New Product" to list your first merchant item.'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-surface-50 text-surface-500 font-semibold border-b border-surface-200">
                  <tr>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">

                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-surface-100 overflow-hidden shrink-0 border border-surface-200">
                          {prod.images && prod.images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={prod.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-surface-400">
                              <Store className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-surface-900 block max-w-xs truncate">{prod.name}</span>
                          <span className="text-[10px] text-surface-400">SKU: {prod.sku || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-surface-600 font-medium">
                        {prod.category?.name || 'General'}
                      </td>
                      <td className="py-3 px-4 font-bold text-surface-900">
                        ₹{(prod.discountPrice ?? prod.price).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] ${prod.stock <= 0
                            ? 'bg-rose-100 text-rose-700'
                            : prod.stock <= 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                            }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() =>
                            setStatusTarget({
                              product: prod,
                              nextStatus: prod.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE',
                            })
                          }
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          title="Click to toggle status"
                        >
                          <Badge
                            variant={prod.status === 'ACTIVE' ? 'success' : 'neutral'}
                            size="sm"
                            dot={prod.status === 'ACTIVE'}
                          >
                            {prod.status}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-lg text-surface-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(prod)}
                            className="p-1.5 rounded-lg text-surface-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* Tab 2: Incoming Customer Orders */}
      {activeTab === 'orders' && (
        <Card variant="glass" className="overflow-hidden p-0">
          <div className="p-4 sm:p-5 border-b border-surface-200">
            <CardTitle className="text-base">Multi-Vendor Order Fulfillment</CardTitle>
            <CardDescription className="text-xs">
              Orders partitioned specifically for your storefront with strict vendor isolation.
            </CardDescription>
          </div>

          {vendorOrders.length === 0 ? (
            <div className="p-12 text-center text-surface-400">
              <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-surface-300" />
              <p className="text-sm font-bold text-surface-700">No active customer orders</p>
              <p className="text-xs text-surface-400">When shoppers purchase your products, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar overscroll-contain">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-surface-50 text-surface-500 font-semibold border-b border-surface-200">
                  <tr>
                    <th className="py-3.5 px-4">Item & Product</th>
                    <th className="py-3.5 px-4">Quantity</th>
                    <th className="py-3.5 px-4">Unit Price</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4 text-right">Fulfillment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {vendorOrders.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-50/50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-surface-900 block">{item.productName || item.product?.name}</span>
                        <span className="text-[10px] text-surface-400">Item ID: {item.id}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-surface-800">{item.quantity}</td>
                      <td className="py-3 px-4 font-bold text-surface-900">
                        ₹{(item.discountPrice ?? item.price).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={item.status === 'DELIVERED' ? 'success' : item.status === 'SHIPPED' ? 'brand' : 'warning'}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {onUpdateOrderStatus && (
                          <select
                            value={item.status}
                            onChange={(e) => handleOrderStatusUpdate(item.id, e.target.value)}
                            className="rounded-lg border border-surface-200 bg-white px-2.5 py-1 text-xs font-semibold text-surface-800 focus:outline-none focus:border-brand-500"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PACKED">PACKED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
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

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-surface-950/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-surface-200 overflow-hidden animate-slide-up max-h-[92vh] sm:max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-surface-200 flex justify-between items-center shrink-0">
              <div className="min-w-0 pr-2">
                <h3 className="font-display text-base sm:text-lg font-bold text-surface-900 truncate">
                  {editingProduct ? 'Edit Product' : 'Add New Marketplace Product'}
                </h3>
                <p className="text-xs text-surface-500 truncate">Provide product specifications and Cloudinary imagery.</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="p-2 rounded-xl hover:bg-surface-100 text-surface-500 shrink-0" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-4 sm:p-6 space-y-4 text-left overflow-y-auto custom-scrollbar overscroll-contain flex-1">
              <Input
                label="Product Name"
                placeholder="e.g. Handmade Ceramic Tea Set"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed product story, craftsmanship, dimensions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Selling Price (₹)"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="2499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <Input
                  label="Discount Price (₹)"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Stock Inventory"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {brands.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600">
                    Brand (Optional)
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 p-2.5 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none bg-white"
                  >
                    <option value="">No specific brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cloudinary Image Upload Section */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-surface-50 border border-surface-200">
                <label className="block text-xs font-bold text-surface-800">
                  Product Image (Cloudinary CDN)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-surface-300 hover:border-brand-500 text-xs font-bold text-surface-800 transition-colors shadow-2xs">
                    <UploadCloud className="h-4 w-4 text-brand-600" />
                    <span>{isUploadingImage ? 'Uploading to Cloudinary...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>

                  <span className="text-[11px] text-surface-400">or paste URL below</span>
                </div>

                <Input
                  placeholder="https://res.cloudinary.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />

                {imageUrl && (
                  <div className="h-24 w-24 rounded-xl overflow-hidden border border-surface-200 relative mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="md" onClick={() => setShowProductModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="font-bold">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Product Deletion"
        description={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.name}" (₹${(deleteTarget.discountPrice ?? deleteTarget.price).toLocaleString('en-IN')})? This action cannot be undone and will remove it from the marketplace.`
            : ''
        }
        confirmText="Yes, Delete Product"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Confirmation Modal for Status Toggle */}
      <ConfirmationModal
        isOpen={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleConfirmStatusChange}
        title="Confirm Status Change"
        description={
          statusTarget
            ? `Are you sure you want to change the status of "${statusTarget.product.name}" to ${statusTarget.nextStatus}? ${statusTarget.nextStatus === 'ACTIVE'
              ? 'The product will become visible to shoppers on the marketplace storefront.'
              : 'The product will be hidden from public browsing as a draft.'
            }`
            : ''
        }
        confirmText={`Set to ${statusTarget?.nextStatus || 'Confirm'}`}
        cancelText="Cancel"
        variant="warning"
        isLoading={isChangingStatus}
      />

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
