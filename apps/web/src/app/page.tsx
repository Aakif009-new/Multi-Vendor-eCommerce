'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Store,
  Shield,
  Heart,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Package,
  Lock,
  LogOut,
  Star,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard, ProductCardSkeleton } from '@/components/marketplace/ProductCard';
import { ProductFilters } from '@/components/marketplace/ProductFilters';
import { ProductDetailsModal } from '@/components/marketplace/ProductDetailsModal';
import { CartDrawer } from '@/components/marketplace/CartDrawer';
import { WishlistDrawer } from '@/components/marketplace/WishlistDrawer';
import { AddressManagerModal } from '@/components/marketplace/AddressManagerModal';
import { CheckoutModal } from '@/components/marketplace/CheckoutModal';
import { CustomerOrdersModal } from '@/components/marketplace/CustomerOrdersModal';
import { CustomerAccountModal } from '@/components/marketplace/CustomerAccountModal';
import { ProductReviewModal } from '@/components/marketplace/ProductReviewModal';
import { VendorDashboard } from '@/components/vendor/VendorDashboard';
import { VendorApplicationModal } from '@/components/vendor/VendorApplicationModal';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Product,
  Category,
  Brand,
  VendorSummary,
  CartData,
  WishlistItem,
  Address,
  AdminStats,
  VendorApplication,
  Order,
  OrderItem,
} from '@/types/marketplace';

export default function RootMarketplacePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout } = useAuth();

  // Root authentication gate & role redirect
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'VENDOR') {
        router.push('/vendor');
      } else if (user.role === 'ADMIN') {
        router.push('/admin');
      }
    }
  }, [user, isAuthLoading, router]);

  // Data Collections
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vendors, setVendors] = useState<(VendorSummary & { productCount?: number })[]>([]);
  const [cart, setCart] = useState<CartData>({
    id: 'cart-1',
    items: [],
    subtotal: 0,
    totalItems: 0,
  });
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorOrders, setVendorOrders] = useState<OrderItem[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 8,
    totalVendors: 4,
    pendingApplications: 0,
    totalProducts: 100,
    activeProducts: 100,
    totalCategories: 12,
    totalBrands: 6,
  });
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);

  // Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeReviewItem, setActiveReviewItem] = useState<OrderItem | null>(null);
  const [isVendorApplyOpen, setIsVendorApplyOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateProfile = async (name: string) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        showToast('Profile updated successfully!');
      }
    } catch {
      showToast('Failed to update profile.');
    }
  };

  const fetchLiveVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      const json = await res.json();
      if (json.success && json.data) {
        setVendors(json.data);
      }
    } catch {}
  };

  const fetchLiveProducts = React.useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (selectedVendor) params.set('vendorId', selectedVendor);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (selectedBrand) params.set('brandId', selectedBrand);
      if (search.trim()) params.set('search', search.trim());
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setProducts(data.data);
        setVendorProducts(data.data.slice(0, 12));
      }
    } catch {
    } finally {
      setIsLoadingProducts(false);
    }
  }, [selectedVendor, selectedCategory, selectedBrand, search, minPrice, maxPrice, sort]);

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      const timer = setTimeout(() => {
        fetchLiveProducts();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [user, fetchLiveProducts]);

  const fetchLiveCategories = () => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setCategories(data.data);
          setAdminStats((prev) => ({
            ...prev,
            totalCategories: data.data.length,
          }));
        }
      })
      .catch(() => {});
  };

  const fetchLiveCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const json = await res.json();
      if (json.success && json.data) {
        setCart(json.data);
      }
    } catch {}
  };

  const fetchLiveWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      const json = await res.json();
      if (json.success && json.data?.items) {
        setWishlist(json.data.items);
      }
    } catch {}
  };

  const fetchLiveAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      const json = await res.json();
      if (json.success && json.data) {
        setAddresses(json.data);
      }
    } catch {}
  };

  const fetchLiveOrders = async () => {
    try {
      const res = await fetch('/api/orders/me');
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
      }
    } catch {}
  };

  useEffect(() => {
    if (user) {
      fetchLiveVendors();
      fetchLiveProducts();
      fetchLiveCategories();
      fetchLiveCart();
      fetchLiveWishlist();
      fetchLiveAddresses();
      fetchLiveOrders();
    }
  }, [user]);

  // If still verifying session, unauthenticated, or non-customer, block marketplace rendering
  if (isAuthLoading || !user || user.role !== 'CUSTOMER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <h3 className="font-display font-bold text-lg">BazaarOne Gateway</h3>
            <p className="text-xs text-surface-400">
              {!user ? 'Verifying session credentials...' : `Redirecting to ${user.role} portal...`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filter & Search Logic (For Customer View)
  const filteredProducts = products.filter((product) => {
    if (search && !product.name.toLowerCase().includes(search.toLowerCase()) && !product.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCategory && product.category?.slug !== selectedCategory && product.category?.id !== selectedCategory) {
      return false;
    }
    if (minPrice && (product.discountPrice ?? product.price) < parseFloat(minPrice)) {
      return false;
    }
    if (maxPrice && (product.discountPrice ?? product.price) > parseFloat(maxPrice)) {
      return false;
    }
    return true;
  });

  // Cart Operations
  const handleAddToCart = async (product: Product, quantity = 1) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCart(json.data);
        showToast(`Added "${product.name}" to cart!`);
      } else {
        showToast(json.message || 'Failed to add to cart');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add to cart');
    }
  };

  const handleUpdateCartQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCart(json.data);
      }
    } catch {}
  };

  const handleRemoveCartItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCart(json.data);
        showToast('Item removed from cart');
      }
    } catch {}
  };

  // Wishlist Operations
  const handleAddToWishlist = async (product: Product) => {
    const exists = wishlist.some((item) => item.productId === product.id);
    try {
      if (exists) {
        await fetch(`/api/wishlist/${product.id}`, { method: 'DELETE' });
        showToast(`Removed "${product.name}" from wishlist.`);
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
        showToast(`Saved "${product.name}" to wishlist.`);
      }
      fetchLiveWishlist();
    } catch {}
  };

  const handleMoveWishlistToCart = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${productId}/move-to-cart`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        fetchLiveCart();
        fetchLiveWishlist();
        showToast('Moved item from wishlist to cart!');
      }
    } catch {}
  };

  // Address Operations
  const handleAddAddress = async (data: any) => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        fetchLiveAddresses();
        showToast('Shipping address saved!');
      } else {
        showToast(json.message || 'Failed to save address');
      }
    } catch {}
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchLiveAddresses();
        showToast('Address removed.');
      }
    } catch {}
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}/default`, { method: 'PATCH' });
      const json = await res.json();
      if (json.success) {
        fetchLiveAddresses();
        showToast('Default address updated.');
      }
    } catch {}
  };

  // Checkout Completion
  const handleOrderConfirmed = (confirmedOrder: Order) => {
    setOrders([confirmedOrder, ...orders]);
    if (confirmedOrder.orderItems) {
      setVendorOrders([...confirmedOrder.orderItems, ...vendorOrders]);
    }
    setCart({ id: cart.id, items: [], subtotal: 0, totalItems: 0 });
    fetchLiveCart();
    fetchLiveOrders();
    showToast('Payment verified! Order placed with local merchants.');
  };

  // Review Operations
  const handleReviewSubmit = async (data: { orderItemId: string; rating: number; comment?: string }) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.message || 'Failed to submit review');
      }

      showToast('Verified review published to product page!');
    } catch (err: any) {
      showToast(err.message || 'Review submitted!');
    }
  };

  // Vendor Operations
  const handleVendorCreateProduct = async (data: any) => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      price: data.price,
      discountPrice: data.discountPrice,
      stock: data.stock,
      images: data.images,
      status: data.status,
      rating: 5.0,
      numReviews: 0,
      category: categories.find((c) => c.id === data.categoryId) || categories[0],
      vendor: { id: user?.vendor?.id || 'v-me', businessName: user?.name || 'My Store', slug: 'my-store' },
    };
    setProducts([newProduct, ...products]);
    setVendorProducts([newProduct, ...vendorProducts]);
    showToast('New product published to catalog!');
  };

  const handleVendorUpdateProduct = async (id: string, data: any) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, ...data } : p)));
    setVendorProducts(vendorProducts.map((p) => (p.id === id ? { ...p, ...data } : p)));
    showToast('Product updated successfully!');
  };

  const handleVendorDeleteProduct = async (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    setVendorProducts(vendorProducts.filter((p) => p.id !== id));
    showToast('Product deleted.');
  };

  const handleVendorToggleStatus = async (id: string, status: string) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, status: status as any } : p)));
    setVendorProducts(vendorProducts.map((p) => (p.id === id ? { ...p, status: status as any } : p)));
  };

  const handleVendorUpdateOrderStatus = async (orderItemId: string, newStatus: string) => {
    setVendorOrders(vendorOrders.map((i) => (i.id === orderItemId ? { ...i, status: newStatus as any } : i)));
    setOrders(
      orders.map((o) => ({
        ...o,
        orderItems: o.orderItems.map((i) => (i.id === orderItemId ? { ...i, status: newStatus as any } : i)),
      }))
    );
    showToast(`Order item marked as ${newStatus}!`);
  };

  // Admin Actions
  const handleAdminReviewApplication = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setApplications(applications.map((a) => (a.id === id ? { ...a, status } : a)));
    if (status === 'APPROVED') {
      setAdminStats({
        ...adminStats,
        pendingApplications: Math.max(0, adminStats.pendingApplications - 1),
        totalVendors: adminStats.totalVendors + 1,
      });
      showToast('Vendor approved! Storefront is now live.');
    } else {
      setAdminStats({
        ...adminStats,
        pendingApplications: Math.max(0, adminStats.pendingApplications - 1),
      });
      showToast('Vendor application rejected.');
    }
  };

  const handleAdminModerateProduct = async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    setProducts(products.map((p) => (p.id === id ? { ...p, status } : p)));
    showToast(`Product listing ${status === 'ACTIVE' ? 'approved' : 'suspended'}.`);
  };

  const handleAdminCreateCategory = async (data: { name: string; description?: string }) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      isActive: true,
    };
    setCategories([...categories, newCat]);
    showToast(`Category "${data.name}" added.`);
  };

  const handleAdminCreateBrand = async (data: { name: string; description?: string }) => {
    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      isActive: true,
    };
    setBrands([...brands, newBrand]);
    showToast(`Brand "${data.name}" registered.`);
  };

  const handleAdminDeactivateCategory = async (id: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, isActive: false } : c)));
    showToast('Category deactivated safely.');
  };

  const handleSeed100Products = async () => {
    const res = await fetch('/api/seed/100-products', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      fetchLiveProducts();
      fetchLiveCategories();
      showToast('100 Products Catalog Seeded Successfully across 12 Categories!');
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-50/50">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-surface-950 text-white shadow-2xl flex items-center gap-2.5 animate-slide-up border border-surface-800 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dynamic Navbar with Role-Aware Navigation */}
      <Navbar
        userRole={user.role}
        userName={user.name}
        userEmail={user.email}
        cartCount={cart.totalItems}
        wishlistCount={wishlist.length}
        ordersCount={orders.length}
        activeView="customer"
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => setIsAccountModalOpen(true)}
        onOpenAddresses={() => setIsAddressModalOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        onOpenVendorApply={() => setIsVendorApplyOpen(true)}
        onLogout={handleLogoutClick}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* ========================================================= */}
        {/* DESTINATION 1: CUSTOMER MARKETPLACE (Role: CUSTOMER)     */}
        {/* ========================================================= */}
        {user.role === 'CUSTOMER' && (
          <div className="space-y-10 animate-fade-in">
            {/* Value Proposition Hero Banner */}
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-surface-950 text-white overflow-hidden shadow-2xl text-left">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold tracking-wide backdrop-blur-xs">
                  <Sparkles className="h-3.5 w-3.5 text-accent-gold" />
                  Curated Multi-Vendor Marketplace &bull; 12 Specialized Categories
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
                  Discover Top Brands & Curated Merchant Stores
                </h1>
                <p className="text-sm text-surface-300 leading-relaxed max-w-xl">
                  Shop trusted products from specialized merchants across technology, fashion, home, fitness and everyday living with secure Razorpay test protection.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      const el = document.getElementById('catalog-filters');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Explore Catalogue
                  </Button>
                  <Button
                    variant="glass"
                    size="md"
                    className="text-white border-white/20 hover:bg-white/10"
                    onClick={() => setIsAccountModalOpen(true)}
                    leftIcon={<Package className="h-4 w-4" />}
                  >
                    My Past Orders ({orders.length})
                  </Button>
                </div>
              </div>
            </div>

            {/* Featured Merchant Partners Showcase */}
            <div className="space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h2 className="text-xl font-extrabold text-surface-950 tracking-tight flex items-center gap-2">
                    <Store className="h-5 w-5 text-amber-500" />
                    Featured Merchant Partners
                  </h2>
                  <p className="text-xs text-surface-500">
                    Specialized independent businesses verified for quality and catalog excellence
                  </p>
                </div>
                <span className="text-xs font-semibold text-surface-600 bg-surface-100 px-3 py-1.5 rounded-xl border border-surface-200">
                  4 Approved Merchants
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {vendors.map((v) => {
                  const isSelected = selectedVendor === v.id || selectedVendor === v.slug;
                  return (
                    <div
                      key={v.id}
                      className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-4 hover:shadow-lg ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                          : 'border-surface-200/80 hover:border-amber-400/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-xs">
                            <Store className="h-5 w-5" />
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span>{v.rating && v.rating > 0 ? v.rating.toFixed(1) : '4.8'}</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-display font-extrabold text-sm text-surface-950">
                            {v.businessName}
                          </h3>
                          <p className="text-[11px] text-surface-500 line-clamp-2 mt-1 leading-snug">
                            {v.description || 'Specialized catalog partner on BazaarOne'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-surface-700">
                          {v.productCount ?? 0} Products
                        </span>
                        <Button
                          variant={isSelected ? 'primary' : 'outline'}
                          size="sm"
                          className="text-xs font-bold rounded-xl"
                          onClick={() => {
                            setSelectedVendor(isSelected ? '' : v.id);
                            const el = document.getElementById('catalog-filters');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {isSelected ? 'Viewing Store' : 'Visit Store'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catalog Filters & Search */}
            <div id="catalog-filters" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
                <div>
                  <h2 className="text-2xl font-extrabold text-surface-950 tracking-tight">
                    Curated Marketplace Catalogue
                  </h2>
                  <p className="text-xs text-surface-500">
                    Real-time inventory and verified products across 12 categories
                  </p>
                </div>
                <span className="text-xs font-semibold text-surface-600 bg-surface-100 px-3 py-1.5 rounded-xl border border-surface-200">
                  Showing {filteredProducts.length} products
                </span>
              </div>

              <ProductFilters
                categories={categories}
                brands={brands}
                vendors={vendors}
                search={search}
                selectedCategory={selectedCategory}
                selectedVendor={selectedVendor}
                selectedBrand={selectedBrand}
                minPrice={minPrice}
                maxPrice={maxPrice}
                sort={sort}
                totalResults={filteredProducts.length}
                onSearchChange={setSearch}
                onCategoryChange={setSelectedCategory}
                onVendorChange={setSelectedVendor}
                onBrandChange={setSelectedBrand}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onSortChange={setSort}
                onReset={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedVendor('');
                  setSelectedBrand('');
                  setMinPrice('');
                  setMaxPrice('');
                  setSort('newest');
                }}
              />
            </div>

            {/* Product Grid */}
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={<Package className="h-10 w-10 text-surface-400" />}
                title="No matching products found"
                description="Try clearing your search query or adjusting your price filters."
                actionLabel="Reset All Filters"
                onAction={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedVendor('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onAddToWishlist={(p) => handleAddToWishlist(p)}
                    isInWishlist={wishlist.some((w) => w.productId === product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onAddToWishlist={(p) => handleAddToWishlist(p)}
        isInWishlist={selectedProduct ? wishlist.some((w) => w.productId === selectedProduct.id) : false}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCart({ id: cart.id, items: [], subtotal: 0, totalItems: 0 })}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutModalOpen(true);
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlist}
        onMoveToCart={handleMoveWishlistToCart}
        onRemove={(pId) => setWishlist(wishlist.filter((w) => w.productId !== pId))}
      />

      <AddressManagerModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        onAddAddress={handleAddAddress}
        onDeleteAddress={handleDeleteAddress}
        onSetDefaultAddress={handleSetDefaultAddress}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        addresses={addresses}
        onOpenAddressManager={() => {
          setIsCheckoutModalOpen(false);
          setIsAddressModalOpen(true);
        }}
        onOrderConfirmed={handleOrderConfirmed}
      />

      <CustomerOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        orders={orders}
        onOpenReview={(item) => {
          setActiveReviewItem(item);
          setIsReviewModalOpen(true);
        }}
      />

      <CustomerAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        orders={orders}
        addresses={addresses}
        wishlistCount={wishlist.length}
        cartCount={cart.totalItems}
        onOpenReview={(item) => {
          setActiveReviewItem(item);
          setIsReviewModalOpen(true);
        }}
        onAddAddress={handleAddAddress}
        onDeleteAddress={handleDeleteAddress}
        onSetDefaultAddress={handleSetDefaultAddress}
        onUpdateProfile={handleUpdateProfile}
        onOpenCart={() => {
          setIsAccountModalOpen(false);
          setIsCartOpen(true);
        }}
        onOpenWishlist={() => {
          setIsAccountModalOpen(false);
          setIsWishlistOpen(true);
        }}
        onLogout={handleLogoutClick}
      />

      <ProductReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setActiveReviewItem(null);
        }}
        orderItem={activeReviewItem}
        onSubmitReview={handleReviewSubmit}
      />

      <VendorApplicationModal
        isOpen={isVendorApplyOpen}
        onClose={() => setIsVendorApplyOpen(false)}
        onSubmitApplication={async (data) => {
          setApplications([
            ...applications,
            {
              id: `app-${Date.now()}`,
              userId: user?.id || 'u-new',
              user: { name: user?.name || 'Applicant', email: user?.email || 'app@test.com' },
              businessName: data.businessName,
              businessAddress: data.businessAddress,
              phone: data.phone,
              description: data.description,
              status: 'PENDING',
              createdAt: new Date().toISOString(),
            },
          ]);
          setAdminStats({
            ...adminStats,
            pendingApplications: adminStats.pendingApplications + 1,
          });
          showToast('Vendor application submitted for review!');
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
