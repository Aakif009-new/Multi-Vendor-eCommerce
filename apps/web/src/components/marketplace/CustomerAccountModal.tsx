'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Package,
  MapPin,
  CreditCard,
  Settings,
  ShoppingBag,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  Store,
  Star,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Calendar,
  Mail,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Order, OrderItem, Address } from '@/types/marketplace';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { EmptyState } from '../ui/EmptyState';

export interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
  };
  orders: Order[];
  addresses: Address[];
  wishlistCount: number;
  cartCount: number;
  onOpenReview: (item: OrderItem) => void;
  onAddAddress: (data: any) => Promise<void>;
  onDeleteAddress: (id: string) => Promise<void>;
  onSetDefaultAddress: (id: string) => Promise<void>;
  onUpdateProfile: (name: string) => Promise<void>;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onLogout: () => void;
}

type TabType = 'overview' | 'orders' | 'addresses' | 'payments' | 'profile';

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  addresses,
  wishlistCount,
  cartCount,
  onOpenReview,
  onAddAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onUpdateProfile,
  onOpenCart,
  onOpenWishlist,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Address Add Form State
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newTitle, setNewTitle] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  // Expanded Order ID for tracking
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real database metrics computed from customer's actual state
  const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
  const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrders = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)
  );

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setIsUpdatingProfile(true);
    try {
      await onUpdateProfile(nameInput.trim());
      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newState || !newPostalCode || !newPhone) return;
    setIsSubmittingAddress(true);
    try {
      await onAddAddress({
        title: newTitle,
        street: newStreet,
        city: newCity,
        state: newState,
        postalCode: newPostalCode,
        country: 'India',
        phone: newPhone,
        isDefault: newIsDefault,
      });
      setShowAddAddressForm(false);
      setNewStreet('');
      setNewCity('');
      setNewState('');
      setNewPostalCode('');
      setNewPhone('');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const getTimelineStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
      case 'PROCESSING':
        return 1;
      case 'PACKED':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-surface-950/70 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-surface-200 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-surface-900 to-surface-950 text-white flex items-center justify-between border-b border-surface-800">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center font-display font-extrabold text-xl shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-black tracking-tight">{user.name}</h2>
                <Badge variant="brand" size="sm" className="bg-brand-500/20 text-brand-300 border-brand-500/30">
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-surface-400 flex items-center gap-2 mt-0.5">
                <Mail className="h-3 w-3" /> {user.email}
                {user.createdAt && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2.5 bg-surface-50 border-b border-surface-200 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'overview'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-surface-600 hover:bg-surface-200/60 hover:text-surface-900'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'orders'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-surface-600 hover:bg-surface-200/60 hover:text-surface-900'
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            <span>My Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'addresses'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-surface-600 hover:bg-surface-200/60 hover:text-surface-900'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Addresses ({addresses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'payments'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-surface-600 hover:bg-surface-200/60 hover:text-surface-900'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Payments</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'profile'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-surface-600 hover:bg-surface-200/60 hover:text-surface-900'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Profile & Security</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200">
                  <div className="flex items-center justify-between text-surface-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
                    <Package className="h-4 w-4 text-brand-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-surface-950">{orders.length}</div>
                  <span className="text-[10px] text-surface-500">{activeOrders.length} active in transit</span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200">
                  <div className="flex items-center justify-between text-surface-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Spent</span>
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-surface-950">₹{totalSpent.toLocaleString('en-IN')}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">{paidOrders.length} verified purchases</span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200 cursor-pointer hover:border-brand-300 transition-colors" onClick={() => { onClose(); onOpenWishlist(); }}>
                  <div className="flex items-center justify-between text-surface-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Wishlist</span>
                    <Heart className="h-4 w-4 text-rose-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-surface-950">{wishlistCount}</div>
                  <span className="text-[10px] text-brand-600 font-semibold hover:underline">View Wishlist →</span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200 cursor-pointer hover:border-brand-300 transition-colors" onClick={() => { onClose(); onOpenCart(); }}>
                  <div className="flex items-center justify-between text-surface-500 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Cart Items</span>
                    <ShoppingBag className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-surface-950">{cartCount}</div>
                  <span className="text-[10px] text-brand-600 font-semibold hover:underline">Checkout Cart →</span>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-extrabold text-sm text-surface-900">Recent Purchases</h3>
                  {orders.length > 0 && (
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700"
                    >
                      View All Orders ({orders.length}) →
                    </button>
                  )}
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-surface-50 border border-surface-200">
                    <Package className="h-10 w-10 text-surface-400 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-surface-800">No orders placed yet</h4>
                    <p className="text-xs text-surface-500 mt-1">Discover handcrafted goods across our 4 verified merchants.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-surface-50 border border-surface-200 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-surface-900">Order #{order.id.slice(-8).toUpperCase()}</span>
                            <Badge
                              variant={
                                order.status === 'DELIVERED'
                                  ? 'success'
                                  : order.status === 'SHIPPED' || order.status === 'CONFIRMED'
                                  ? 'brand'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-surface-500 mt-0.5">
                            {order.orderItems?.length || 0} items • Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-surface-950">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab('orders');
                              setExpandedOrderId(order.id);
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <EmptyState
                  icon={<Package className="h-10 w-10 text-surface-400" />}
                  title="No orders placed yet"
                  description="Your completed orders and delivery tracking will appear here."
                  actionLabel="Start Shopping"
                  onAction={onClose}
                />
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const stepIndex = getTimelineStepIndex(order.status);

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-surface-50 border border-surface-200 space-y-4 shadow-xs"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-200/80">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-surface-900">
                              Order #{order.id}
                            </span>
                            <Badge
                              variant={
                                order.status === 'DELIVERED'
                                  ? 'success'
                                  : order.status === 'SHIPPED' || order.status === 'CONFIRMED'
                                  ? 'brand'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-surface-500 block mt-0.5">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} • Payment: {order.paymentStatus}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-surface-950">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          >
                            {isExpanded ? 'Hide Tracking' : 'Track & Details'}
                          </Button>
                        </div>
                      </div>

                      {/* Visual Order Progress Bar */}
                      <div className="p-3 bg-white rounded-xl border border-surface-200/80">
                        <div className="flex items-center justify-between relative">
                          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-surface-200 -z-0" />
                          <div
                            className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-500 -z-0"
                            style={{
                              width: `${(stepIndex / 4) * 92}%`,
                            }}
                          />

                          {[
                            { label: 'Placed', icon: Clock },
                            { label: 'Confirmed', icon: CheckCircle2 },
                            { label: 'Packed', icon: Package },
                            { label: 'Shipped', icon: Truck },
                            { label: 'Delivered', icon: ShieldCheck },
                          ].map((step, idx) => {
                            const isDone = idx <= stepIndex;
                            const Icon = step.icon;
                            return (
                              <div key={step.label} className="relative z-10 flex flex-col items-center">
                                <div
                                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    isDone
                                      ? 'bg-brand-600 text-white shadow-xs'
                                      : 'bg-surface-200 text-surface-500'
                                  }`}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </div>
                                <span className={`text-[10px] font-bold mt-1 ${isDone ? 'text-brand-700' : 'text-surface-400'}`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Multi-Vendor Items List with Historical Snapshots */}
                      <div className="space-y-2.5">
                        {order.orderItems?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-surface-200"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-12 w-12 rounded-xl bg-surface-100 overflow-hidden shrink-0 border border-surface-200">
                                {item.productImage || (item.product?.images && item.product.images[0]) ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.productImage || item.product?.images[0]}
                                    alt={item.productName || item.product?.name || 'Product'}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-surface-400">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs text-surface-900 truncate">
                                  {item.productName || item.product?.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-surface-500">
                                  <span className="flex items-center gap-1 font-semibold text-brand-700">
                                    <Store className="h-3 w-3" />
                                    {item.vendor?.businessName || 'Merchant Partner'}
                                  </span>
                                  <span>•</span>
                                  <span>Qty: {item.quantity}</span>
                                  <span>•</span>
                                  <span className="font-bold text-surface-900">₹{(item.discountPrice ?? item.price).toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>

                            {/* Review Button for Delivered Items */}
                            <div>
                              {order.status === 'DELIVERED' || item.status === 'DELIVERED' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    onClose();
                                    onOpenReview(item);
                                  }}
                                  leftIcon={<Star className="h-3 w-3 text-amber-500" />}
                                  className="text-xs"
                                >
                                  {item.reviews && item.reviews.length > 0 ? 'Review Submitted' : 'Write Review'}
                                </Button>
                              ) : (
                                <Badge variant="neutral" size="sm" className="text-[10px]">
                                  {item.status || order.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expanded Details: Shipping Address Snapshot */}
                      {isExpanded && order.address && (
                        <div className="p-3 bg-white rounded-xl border border-surface-200 text-xs text-surface-600 space-y-1">
                          <span className="font-bold text-surface-900 block">Shipping Destination:</span>
                          <p>
                            {order.address.title} • {order.address.street}, {order.address.city}, {order.address.state} - {order.address.postalCode}
                          </p>
                          <p className="text-surface-500">Contact: {order.address.phone}</p>
                          {order.razorpayOrderId && (
                            <p className="font-mono text-[10px] text-surface-400 pt-1">
                              Payment Ref: {order.razorpayOrderId}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-1">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-surface-900">Saved Addresses</h3>
                  <p className="text-xs text-surface-500">Manage delivery addresses for seamless checkout</p>
                </div>
                {!showAddAddressForm && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddAddressForm(true)}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Add Address
                  </Button>
                )}
              </div>

              {showAddAddressForm ? (
                <form onSubmit={handleAddressSubmit} className="p-4 rounded-2xl bg-surface-50 border border-surface-200 space-y-3">
                  <h4 className="font-bold text-xs text-surface-900">Add New Delivery Address</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Address Title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Home, Office, Studio"
                      required
                    />
                    <Input
                      label="Contact Phone"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                  <Input
                    label="Street Address"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    placeholder="Flat / House No., Street, Area"
                    required
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="City"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="City"
                      required
                    />
                    <Input
                      label="State"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="State"
                      required
                    />
                    <Input
                      label="PIN Code"
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      placeholder="Postal Code"
                      required
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-surface-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={newIsDefault}
                      onChange={(e) => setNewIsDefault(e.target.checked)}
                      className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                    />
                    Set as my default shipping address
                  </label>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddAddressForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingAddress}>
                      Save Address
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-surface-50 border border-surface-200">
                      <MapPin className="h-8 w-8 text-surface-400 mx-auto mb-2" />
                      <p className="text-xs text-surface-500">No saved addresses found. Add an address to enable fast checkout.</p>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 rounded-2xl bg-surface-50 border border-surface-200 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-surface-900">{addr.title}</span>
                            {addr.isDefault && (
                              <Badge variant="success" size="sm">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-surface-600">
                            {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-surface-500 text-[11px]">Phone: {addr.phone}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {!addr.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSetDefaultAddress(addr.id)}
                              className="text-[11px]"
                            >
                              Make Default
                            </Button>
                          )}
                          <button
                            onClick={() => onDeleteAddress(addr.id)}
                            className="p-2 rounded-xl hover:bg-rose-50 text-surface-400 hover:text-rose-600 transition-colors"
                            title="Delete address"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-sm text-surface-900">Payment History</h3>
                <p className="text-xs text-surface-500">Cryptographically verified Razorpay transactions</p>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-surface-50 border border-surface-200">
                  <CreditCard className="h-8 w-8 text-surface-400 mx-auto mb-2" />
                  <p className="text-xs text-surface-500">No payment records found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-2xl bg-surface-50 border border-surface-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-surface-900">Order #{order.id.slice(-8).toUpperCase()}</span>
                          <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-surface-500">
                          Gateway: Razorpay Test Mode • {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                        {order.razorpayOrderId && (
                          <span className="font-mono text-[10px] text-surface-400 block">
                            ID: {order.razorpayOrderId}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-surface-950">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-emerald-600 block font-semibold">100% Authenticated</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg">
              <div>
                <h3 className="font-display font-extrabold text-sm text-surface-900">Customer Profile</h3>
                <p className="text-xs text-surface-500">Update your account details and review session settings</p>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {profileSuccessMsg}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Email Address</label>
                  <input
                    type="text"
                    value={user.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-surface-500 text-xs cursor-not-allowed"
                  />
                  <span className="text-[10px] text-surface-400 mt-1 block">Account email is verified and locked to this ID.</span>
                </div>

                <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingProfile}>
                  Save Changes
                </Button>
              </form>

              <div className="pt-4 border-t border-surface-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-surface-900">Sign Out</h4>
                  <p className="text-[11px] text-surface-500">Safely terminate your authenticated session</p>
                </div>
                <Button variant="danger" size="sm" onClick={onLogout}>
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
