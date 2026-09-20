'use client';

import React, { useState } from 'react';
import { ShoppingBag, Heart, Star, Store, Check } from 'lucide-react';
import { Product } from '@/types/marketplace';
import { Button } from '../ui/Button';

export interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onAddToWishlist,
  isInWishlist = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const currentPrice = product.discountPrice ?? product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;
  const savingsAmount = hasDiscount ? product.price - product.discountPrice! : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const displayImage =
    !imageError && product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

  const ratingValue = product.rating && product.rating > 0 ? product.rating.toFixed(1) : '4.5';
  const reviewCount = product.numReviews && product.numReviews > 0 ? product.numReviews : null;

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(product);
      setIsAddedRecently(true);
      setTimeout(() => setIsAddedRecently(false), 1500);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-surface-200/80 hover:border-surface-300 hover:shadow-card-hover transition-all duration-300 overflow-hidden cursor-pointer text-left h-full"
    >
      {/* 1. Image Container */}
      <div className="relative aspect-square w-full bg-surface-50 overflow-hidden flex items-center justify-center">
        {/* Placeholder skeleton */}
        {!isImageLoaded && !imageError && (
          <div className="absolute inset-0 bg-surface-100 animate-pulse" />
        )}

        {/* Product Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={product.name}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setIsImageLoaded(true);
          }}
          className={`h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Subtle Discount / Stock Chips */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-md bg-surface-900/90 text-white text-[10px] font-bold tracking-wide backdrop-blur-xs">
              {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-md bg-surface-950 text-white text-[10px] font-bold">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Wishlist Icon Button */}
        {onAddToWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(product);
            }}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-surface-600 hover:text-rose-500 shadow-xs backdrop-blur-xs transition-all duration-200 z-10"
            title="Save to Wishlist"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-surface-500 hover:text-rose-500'
              }`}
            />
          </button>
        )}
      </div>

      {/* 2. Card Details Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3">
        <div className="space-y-1.5">
          {/* Category & Merchant Row */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-surface-500 gap-1">
            <span className="font-semibold uppercase tracking-wider text-surface-500 truncate max-w-[90px] sm:max-w-[110px]">
              {product.category?.name || 'Category'}
            </span>
            {product.vendor && (
              <span
                className="flex items-center gap-1 text-surface-500 truncate max-w-[110px] sm:max-w-[130px]"
                title={`Store: ${product.vendor.businessName}`}
              >
                <Store className="h-3 w-3 text-surface-400 shrink-0" />
                <span className="truncate">{product.vendor.businessName}</span>
              </span>
            )}
          </div>

          {/* Product Title */}
          <h4
            title={product.name}
            className="h-9 sm:h-10 text-xs sm:text-sm font-semibold text-surface-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug"
          >
            {product.name}
          </h4>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="ml-1 font-bold text-surface-900 text-xs">{ratingValue}</span>
            </div>
            {reviewCount !== null && (
              <span className="text-[10px] sm:text-[11px] text-surface-400 font-medium">({reviewCount})</span>
            )}
          </div>

          {/* Price & Savings Display */}
          <div className="pt-0.5">
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-sm sm:text-base md:text-lg font-bold text-surface-950">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-[11px] sm:text-xs text-surface-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {hasDiscount && (
              <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                Save ₹{savingsAmount.toLocaleString('en-IN')}
              </div>
            )}
          </div>
        </div>

        {/* 3. Add to Cart Button */}
        <div className="pt-2 border-t border-surface-100">
          <Button
            variant={isAddedRecently ? 'secondary' : isOutOfStock ? 'outline' : 'primary'}
            size="sm"
            className="w-full h-8 sm:h-9 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            disabled={isOutOfStock}
            onClick={handleAddToCartClick}
            leftIcon={
              isAddedRecently ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <ShoppingBag className="h-3.5 w-3.5" />
              )
            }
          >
            {isAddedRecently ? 'Added' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <div className="flex flex-col justify-between bg-white rounded-2xl border border-surface-200/80 overflow-hidden h-full animate-pulse text-left shadow-xs">
    <div className="aspect-square w-full bg-surface-100" />
    <div className="p-3.5 sm:p-4 space-y-2.5">
      <div className="flex justify-between items-center">
        <div className="h-2.5 w-16 bg-surface-200 rounded" />
        <div className="h-2.5 w-20 bg-surface-200 rounded" />
      </div>
      <div className="h-3.5 w-full bg-surface-200 rounded" />
      <div className="h-3.5 w-3/4 bg-surface-200 rounded" />
      <div className="h-3 w-12 bg-surface-200 rounded" />
      <div className="h-5 w-24 bg-surface-200 rounded" />
      <div className="pt-2 border-t border-surface-100">
        <div className="h-8 sm:h-9 w-full bg-surface-200 rounded-xl" />
      </div>
    </div>
  </div>
);

