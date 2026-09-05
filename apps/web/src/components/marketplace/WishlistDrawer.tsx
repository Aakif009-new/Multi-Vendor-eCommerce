'use client';

import React from 'react';
import { X, Heart, ShoppingBag, Trash2, Store } from 'lucide-react';
import { WishlistItem } from '@/types/marketplace';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishlistItem[];
  onMoveToCart: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onMoveToCart,
  onRemove,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-surface-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left text-left">
        {/* Top Header */}
        <div className="p-5 border-b border-surface-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-surface-900">Saved Wishlist</h3>
              <p className="text-xs text-surface-500">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-100 text-surface-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <EmptyState
              icon={<Heart className="h-8 w-8 text-surface-400" />}
              title="Your wishlist is empty"
              description="Save items you love by tapping the heart icon on any product."
              actionLabel="Discover Products"
              onAction={onClose}
            />
          ) : (
            items.map((item) => {
              const currentPrice = item.product.discountPrice ?? item.product.price;
              return (
                <div
                  key={item.id}
                  className="flex gap-3 p-3.5 rounded-2xl bg-surface-50 border border-surface-200/70"
                >
                  <div className="h-16 w-16 rounded-xl bg-white overflow-hidden shrink-0 border border-surface-200">
                    {item.product.images && item.product.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-surface-400">
                        <Store className="h-6 w-6 opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-surface-900 truncate max-w-[180px]">
                          {item.product.name}
                        </h4>
                        <span className="text-xs font-extrabold text-surface-950 block pt-0.5">
                          ₹{currentPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemove(item.productId)}
                        className="text-surface-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => onMoveToCart(item.productId)}
                        leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
                      >
                        Move to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
