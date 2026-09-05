'use client';

import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { CartData, CartItem } from '@/types/marketplace';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartData | null;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalItems = cart?.totalItems ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const freeShippingThreshold = 999;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-surface-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left text-left">
        {/* Top Drawer Header */}
        <div className="p-5 border-b border-surface-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-surface-900">Your Cart</h3>
              <p className="text-xs text-surface-500">{totalItems} item{totalItems !== 1 ? 's' : ''} in cart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-100 text-surface-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-brand-50/70 px-5 py-3 border-b border-brand-100 text-xs">
          {subtotal >= freeShippingThreshold ? (
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <Sparkles className="h-4 w-4 text-accent-gold" />
              🎉 You unlocked FREE Express Delivery!
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className="text-surface-700 font-medium">
                Add <span className="font-bold text-brand-700">₹{freeShippingThreshold - subtotal}</span> more for Free Delivery
              </span>
              <div className="w-full bg-surface-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Item List Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!cart || cart.items.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-8 w-8 text-surface-400" />}
              title="Your cart is empty"
              description="Explore artisanal handcrafted products from local merchants."
              actionLabel="Start Shopping"
              onAction={onClose}
            />
          ) : (
            cart.items.map((item: CartItem) => {
              const unitPrice = item.product.discountPrice ?? item.product.price;
              return (
                <div
                  key={item.id}
                  className="flex gap-3 p-3.5 rounded-2xl bg-surface-50 border border-surface-200/70"
                >
                  {/* Thumbnail */}
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

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-surface-900 truncate max-w-[180px]">
                          {item.product.name}
                        </h4>
                        {item.product.vendor && (
                          <span className="text-[10px] text-surface-500 block truncate">
                            {item.product.vendor.businessName}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-surface-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Quantity & Item Total */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-surface-200 rounded-lg bg-white p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 text-xs font-bold text-surface-600 hover:text-black"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-surface-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 text-xs font-bold text-surface-600 hover:text-black"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-surface-900">
                        ₹{item.itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Checkout Action */}
        {cart && cart.items.length > 0 && (
          <div className="p-5 border-t border-surface-200 bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-surface-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-surface-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-bold text-emerald-600">
                  {subtotal >= freeShippingThreshold ? 'FREE' : '₹99'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-surface-950 pt-2 border-t border-surface-100">
                <span>Total Amount</span>
                <span>
                  ₹{(subtotal + (subtotal >= freeShippingThreshold ? 0 : 99)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={onProceedToCheckout}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Proceed to Shipping Address
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
