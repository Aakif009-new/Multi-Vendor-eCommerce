'use client';

import React, { useState } from 'react';
import { ShoppingBag, Heart, Star, Store } from 'lucide-react';
import { Product } from '@/types/marketplace';
import { Card } from '../ui/Card';
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

  return (
    <Card
      variant="elevated"
      className="group relative flex flex-col justify-between p-0 overflow-hidden border border-surface-200/80 hover:border-brand-500/40 hover:shadow-xl transition-all duration-300 rounded-3xl bg-white text-left h-full"
    >
      {/* Top Aspect Square Image Container */}
      <div
        className="relative aspect-square w-full bg-surface-100/60 overflow-hidden cursor-pointer flex items-center justify-center"
        onClick={() => onSelect(product)}
      >
        {/* Loading Skeleton */}
        {!isImageLoaded && !imageError && (
          <div className="absolute inset-0 bg-surface-200/60 animate-pulse" />
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

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {hasDiscount && (
            <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[10px] font-extrabold shadow-xs tracking-wide">
              {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-xl bg-surface-950/90 text-white text-[10px] font-bold backdrop-blur-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white text-[10px] font-bold shadow-xs">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        {onAddToWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(product);
            }}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-surface-600 hover:text-rose-500 shadow-md backdrop-blur-xs transition-all duration-200 z-10 cursor-pointer"
            title="Save to Wishlist"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-surface-600'
              }`}
            />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Merchant Tag */}
          <div className="flex items-center justify-between text-[11px] text-surface-500">
            <span className="font-bold text-brand-600 uppercase tracking-wider truncate max-w-[110px]">
              {product.category?.name || 'Handcrafted'}
            </span>
            {product.vendor && (
              <span
                className="flex items-center gap-1 font-medium text-surface-600 truncate max-w-[125px]"
                title={`Sold by: ${product.vendor.businessName}`}
              >
                <Store className="h-3 w-3 text-amber-500 shrink-0" />
                <span className="truncate">Sold by: {product.vendor.businessName}</span>
              </span>
            )}
          </div>

          {/* Product Title (Consistent 2-Line Height) */}
          <h4
            onClick={() => onSelect(product)}
            title={product.name}
            className="h-10 text-xs sm:text-sm font-bold text-surface-900 line-clamp-2 hover:text-brand-600 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h4>

          {/* Rating Row */}
          <div className="flex items-center gap-1.5 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="ml-1 font-extrabold text-surface-900 text-xs">
                {ratingValue}
              </span>
            </div>
            {reviewCount !== null && (
              <span className="text-[11px] text-surface-400">
                ({reviewCount} reviews)
              </span>
            )}
          </div>

          {/* Price & Savings Display */}
          <div className="pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-surface-950">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-surface-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {hasDiscount && (
              <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                Save ₹{savingsAmount.toLocaleString('en-IN')} ({discountPercent}% off)
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-surface-100">
          <Button
            variant={isOutOfStock ? 'outline' : 'primary'}
            size="sm"
            className="w-full h-9 text-xs font-bold rounded-xl"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) onAddToCart(product);
            }}
            leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <div className="flex flex-col justify-between p-0 overflow-hidden border border-surface-200/80 rounded-3xl bg-white text-left h-full animate-pulse shadow-xs">
    <div className="aspect-square w-full bg-surface-200/60" />
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 w-16 bg-surface-200 rounded-md" />
        <div className="h-3 w-20 bg-surface-200 rounded-md" />
      </div>
      <div className="h-4 w-full bg-surface-200 rounded-md" />
      <div className="h-4 w-3/4 bg-surface-200 rounded-md" />
      <div className="h-3 w-12 bg-surface-200 rounded-md" />
      <div className="h-6 w-24 bg-surface-200 rounded-md" />
      <div className="pt-2 border-t border-surface-100">
        <div className="h-9 w-full bg-surface-200 rounded-xl" />
      </div>
    </div>
  </div>
);
