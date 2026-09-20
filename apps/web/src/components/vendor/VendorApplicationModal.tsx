'use client';

import React, { useState } from 'react';
import { X, Store, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface VendorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (data: any) => Promise<void>;
}

export const VendorApplicationModal: React.FC<VendorApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmitApplication,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmitApplication({
        businessName,
        businessAddress,
        phone,
        description,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-surface-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-surface-200 overflow-hidden animate-slide-up text-left max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold mb-2">
            <Store className="h-3.5 w-3.5" /> Merchant Onboarding
          </div>
          <h3 className="font-display text-lg sm:text-xl font-extrabold">Apply for a Vendor Storefront</h3>
          <p className="text-xs text-white/90 mt-1">
            Join BazaarOne to showcase and sell your artisanal products nationwide.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar overscroll-contain flex-1">
          {isSuccess ? (
            <div className="p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="text-base font-bold text-surface-900">Application Submitted!</h4>
              <p className="text-xs text-surface-600 leading-relaxed max-w-sm mx-auto">
                Your merchant application has been received and is currently in <strong>PENDING</strong> status.
                A Super Administrator will review and approve your store profile shortly.
              </p>
              <Button variant="primary" size="md" onClick={onClose} className="mt-4">
                Return to Marketplace
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Store / Business Name"
                placeholder="e.g. Heritage Potteries"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />

              <Input
                label="Official Business Address"
                placeholder="e.g. 14 Silk Weaver Lane, Kanchipuram"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                required
              />

              <Input
                label="Merchant Phone Number"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600">
                  Business Description / Craftsmanship
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about the products you create or sell..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 p-3 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Submit Merchant Application
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
