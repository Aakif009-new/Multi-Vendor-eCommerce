'use client';

import React from 'react';
import { X, Package, Clock, CheckCircle2, Truck, Star, Store, ShieldCheck } from 'lucide-react';
import { Order, OrderItem } from '@/types/marketplace';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onOpenReview: (item: OrderItem) => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  onOpenReview,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-surface-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-surface-200 overflow-hidden animate-slide-up text-left max-h-[92vh] sm:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-surface-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-extrabold text-surface-950">Your Order History</h3>
              <p className="text-xs text-surface-500">Track shipments and submit verified reviews</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 text-surface-500" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar overscroll-contain">
          {orders.length === 0 ? (
            <EmptyState
              icon={<Package className="h-10 w-10 text-surface-400" />}
              title="No orders placed yet"
              description="Browse the marketplace and discover unique handcrafted products."
              actionLabel="Explore Catalog"
              onAction={onClose}
            />
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-surface-50 border border-surface-200 space-y-4 shadow-xs"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-3 border-b border-surface-200/80">
                  <div>
                    <span className="text-surface-500">Order ID: </span>
                    <span className="font-mono font-bold text-surface-900">{order.id}</span>
                    <span className="text-surface-400 block text-[10px]">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
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
                    <span className="text-sm font-extrabold text-surface-950">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="space-y-3">
                  {order.orderItems?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-surface-200/70"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-12 rounded-xl bg-surface-100 overflow-hidden shrink-0 border border-surface-200">
                          {item.productImage || (item.product?.images && item.product.images[0]) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.productImage || item.product?.images[0]}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-surface-400 text-xs">
                              <Store className="h-5 w-5 opacity-40" />
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <h5 className="font-bold text-xs text-surface-900 truncate max-w-xs">
                            {item.productName || item.product?.name || 'Product'}
                          </h5>
                          <span className="text-[10px] text-surface-500 block">
                            Qty: {item.quantity} &bull; ₹{(item.discountPrice ?? item.price).toLocaleString('en-IN')} each
                          </span>
                        </div>
                      </div>

                      {/* Status & Review Action */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>

                        {item.status === 'DELIVERED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenReview(item)}
                            leftIcon={<Star className="h-3 w-3 text-amber-500" />}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
