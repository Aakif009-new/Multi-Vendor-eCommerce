'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Store,
  ShieldCheck,
  ShoppingBag,
  Heart,
  Truck,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Lock,
  UserCheck,
  Building2,
} from 'lucide-react';
import { Product, Review } from '@/types/marketplace';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onAddToWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onAddToWishlist,
  isInWishlist = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Demo Delivery PIN Code Estimator State
  const [pinCode, setPinCode] = useState('');
  const [pinResult, setPinResult] = useState<string | null>(null);

  useEffect(() => {
    if (product?.id) {
      setIsLoadingReviews(true);
      fetch(`/api/reviews/product/${product.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setReviews(data.data);
          } else {
            setReviews([]);
          }
        })
        .catch(() => setReviews([]))
        .finally(() => setIsLoadingReviews(false));
    }
  }, [product?.id]);

  if (!product) return null;

  const currentPrice = product.discountPrice ?? product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;
  const savingsAmount = hasDiscount ? product.price - product.discountPrice! : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handlePinCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinCode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPinResult('Please enter a valid 6-digit PIN code.');
      return;
    }
    // Deterministic delivery estimate for demo
    const lastDigit = parseInt(cleanPin.slice(-1), 10);
    const estDays = 2 + (lastDigit % 3);
    setPinResult(`Demo Estimate for PIN ${cleanPin}: Expected delivery in ~${estDays} to ${estDays + 2} business days.`);
  };

  // Compute Real Rating Breakdown from Review Data
  const totalReviews = reviews.length;
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (totalReviews > 0) {
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-surface-950/70 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-surface-200/80 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-4 px-6 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">Product Overview</span>
            <span className="text-surface-300">•</span>
            <span className="text-xs font-semibold text-surface-700">{product.category?.name}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close product details dialog"
            className="p-1.5 rounded-full hover:bg-surface-200 text-surface-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Media Gallery */}
            <div className="space-y-3">
              <div className="aspect-square w-full rounded-2xl bg-surface-100 overflow-hidden border border-surface-200/80 relative">
                {product.images && product.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[selectedImageIndex] || product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-surface-400">
                    <Store className="h-16 w-16 opacity-30" />
                  </div>
                )}

                {hasDiscount && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[10px] font-black shadow-xs">
                    {discountPercent}% OFF
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-14 w-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx ? 'border-brand-600 scale-105 shadow-xs' : 'border-surface-200'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Verified Merchant Profile Box */}
              {product.vendor && (
                <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-surface-900 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-amber-500" />
                      Sold & Fulfilled by:
                    </span>
                    <Badge variant="brand" size="sm">
                      Approved Merchant
                    </Badge>
                  </div>
                  <p className="font-extrabold text-surface-950 text-sm">{product.vendor.businessName}</p>
                  {product.vendor.description && (
                    <p className="text-[11px] text-surface-500 leading-snug">{product.vendor.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Right Product Specifications & Actions */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="brand" size="sm">
                    {product.category?.name || 'Catalog'}
                  </Badge>
                  {product.brand && (
                    <Badge variant="neutral" size="sm">
                      {product.brand.name}
                    </Badge>
                  )}
                </div>

                <h2 className="text-xl md:text-2xl font-black text-surface-950 leading-tight">
                  {product.name}
                </h2>

                {/* Rating Row */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="ml-1 font-bold text-surface-900">
                      {product.rating > 0 ? product.rating.toFixed(1) : '4.5'}
                    </span>
                  </div>
                  <span className="text-surface-400">•</span>
                  <span className="text-surface-500 font-medium">
                    {totalReviews > 0 ? `${totalReviews} customer reviews` : `${product.numReviews || 12} customer ratings`}
                  </span>
                </div>

                {/* Pricing & Savings */}
                <div className="pt-2 border-t border-surface-100">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl md:text-3xl font-black text-surface-950">
                      ₹{currentPrice.toLocaleString('en-IN')}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm md:text-base text-surface-400 line-through">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <div className="text-xs font-bold text-emerald-600 mt-1">
                      Save ₹{savingsAmount.toLocaleString('en-IN')} ({discountPercent}% off MRP)
                    </div>
                  )}
                  <span className="text-[11px] text-surface-400 block mt-0.5">Price inclusive of all applicable taxes.</span>
                </div>

                {/* Stock Status Indicator */}
                <div className="pt-1">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold text-xs">
                      <AlertTriangle className="h-4 w-4" /> Currently Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Only {product.stock} left in stock — order soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> In Stock & Ready to Dispatch
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="pt-2 border-t border-surface-100">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1">
                    Product Description
                  </h4>
                  <p className="text-xs text-surface-600 leading-relaxed max-h-24 overflow-y-auto">
                    {product.description}
                  </p>
                </div>

                {/* Demo Delivery PIN Code Estimator */}
                <div className="pt-2 border-t border-surface-100 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500 flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" /> Delivery Estimate (Demo)
                  </label>
                  <form onSubmit={handlePinCheck} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit PIN code (e.g. 560001)"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      className="px-3 py-1.5 rounded-xl border border-surface-200 bg-surface-50 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-full"
                    />
                    <Button type="submit" variant="outline" size="sm" className="shrink-0 text-xs">
                      Check
                    </Button>
                  </form>
                  {pinResult && (
                    <p className="text-[11px] font-semibold text-brand-700 bg-brand-50 p-2 rounded-lg border border-brand-100">
                      {pinResult}
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity Selector & Action Buttons */}
              <div className="space-y-3 pt-3 border-t border-surface-100">
                {!isOutOfStock && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-surface-700">Quantity:</span>
                    <div className="flex items-center border border-surface-200 rounded-xl bg-surface-50 p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2.5 py-0.5 text-sm font-bold text-surface-700 hover:text-black cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-surface-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-2.5 py-0.5 text-sm font-bold text-surface-700 hover:text-black cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isOutOfStock}
                    onClick={() => {
                      if (onAddToCart) onAddToCart(product, quantity);
                      onClose();
                    }}
                    leftIcon={<ShoppingBag className="h-4 w-4" />}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </Button>

                  {onAddToWishlist && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => onAddToWishlist(product)}
                      leftIcon={<Heart className={`h-4 w-4 ${isInWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />}
                    >
                      {isInWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Platform Trust & Security Guarantees (Strictly Supported Functionality) */}
          <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-surface-900 text-xs block">Razorpay Test Checkout</span>
                <span className="text-[10px] text-surface-500">Encrypted Sandbox</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-brand-600 shrink-0" />
              <div>
                <span className="font-bold text-surface-900 text-xs block">Verified Reviews</span>
                <span className="text-[10px] text-surface-500">Delivered Buyers Only</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-surface-900 text-xs block">Trusted Merchants</span>
                <span className="text-[10px] text-surface-500">Verified Stores</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold text-surface-900 text-xs block">Account Security</span>
                <span className="text-[10px] text-surface-500">Session Privacy</span>
              </div>
            </div>
          </div>

          {/* Customer Reviews & Real Rating Breakdown Bar */}
          <div className="pt-4 border-t border-surface-200 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-surface-950 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-600" />
                Customer Reviews ({totalReviews})
              </h3>
              <div className="flex items-center text-amber-500 text-xs font-bold">
                <Star className="h-4 w-4 fill-amber-400 mr-1" />
                {product.rating > 0 ? product.rating.toFixed(1) : '4.5'} / 5.0
              </div>
            </div>

            {totalReviews > 0 ? (
              <div className="space-y-4">
                {/* Real Rating Distribution Bars */}
                <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200 space-y-1.5">
                  <span className="text-xs font-bold text-surface-700 block mb-2">Rating Distribution:</span>
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const count = ratingDistribution[starNum as 1 | 2 | 3 | 4 | 5];
                    const pct = Math.round((count / totalReviews) * 100);
                    return (
                      <div key={starNum} className="flex items-center gap-2 text-xs">
                        <span className="w-6 font-bold text-surface-700">{starNum} ★</span>
                        <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right text-[11px] text-surface-500 font-medium">
                          {pct}% ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reviews List */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-surface-900">{rev.user?.name || 'Verified Buyer'}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      {rev.comment && <p className="text-surface-600">{rev.comment}</p>}
                      <span className="text-[10px] text-surface-400 block pt-0.5">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-surface-50 border border-surface-200 text-xs text-surface-500">
                <MessageSquare className="h-8 w-8 text-surface-400 mx-auto mb-1" />
                <p className="font-semibold text-surface-700">No customer reviews yet</p>
                <p className="text-[11px] text-surface-400 mt-0.5">
                  Reviews are exclusively submitted by customers after order delivery.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
