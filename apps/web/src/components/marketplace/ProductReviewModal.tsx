'use client';

import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle2, ShieldCheck } from 'lucide-react';
import { OrderItem } from '@/types/marketplace';
import { Button } from '../ui/Button';

export interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItem: OrderItem | null;
  onSubmitReview: (data: { orderItemId: string; rating: number; comment?: string }) => Promise<void>;
}

export const ProductReviewModal: React.FC<ProductReviewModalProps> = ({
  isOpen,
  onClose,
  orderItem,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !orderItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSubmitReview({
        orderItemId: orderItem.id,
        rating,
        comment,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Could not submit review.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-surface-200 overflow-hidden animate-slide-up text-left">
        {/* Header */}
        <div className="p-5 border-b border-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-surface-900">Verified Buyer Review</h3>
              <p className="text-xs text-surface-500">Share your experience with this artisan product</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-100 text-surface-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="font-display text-lg font-bold text-surface-900">Review Submitted!</h4>
            <p className="text-xs text-surface-500 max-w-xs mx-auto">
              Thank you for sharing your feedback. Your review will help fellow buyers in our marketplace.
            </p>
            <Button variant="primary" size="md" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Product Summary */}
            <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white overflow-hidden shrink-0 border border-surface-200">
                {orderItem.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={orderItem.productImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-surface-400 text-xs">
                    Img
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-surface-900 block truncate">
                  {orderItem.productName || orderItem.product?.name || 'Purchased Item'}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified Delivered Purchase
                </span>
              </div>
            </div>

            {/* Star Rating Selector */}
            <div className="space-y-1.5 text-center py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-surface-500 block">
                Overall Rating
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (hoverRating ?? rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          isActive
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-surface-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-amber-600 block">
                {rating === 5 && 'Outstanding Quality!'}
                {rating === 4 && 'Very Good Product'}
                {rating === 3 && 'Average Experience'}
                {rating === 2 && 'Below Expectations'}
                {rating === 1 && 'Poor Quality'}
              </span>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600">
                Review Comments (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Describe product quality, delivery, craftsmanship..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-xl border border-surface-200 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Submit Verified Review
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
