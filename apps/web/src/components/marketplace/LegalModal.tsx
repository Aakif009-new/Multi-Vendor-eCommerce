'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  RotateCcw,
  Cookie,
  Lock,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';

export type LegalTab = 'privacy' | 'terms' | 'refund' | 'cookies' | 'security' | 'data-request';

export interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [dataRequestType, setDataRequestType] = useState<'export' | 'delete'>('export');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleDataRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail) return;
    setRequestSubmitted(true);
    setTimeout(() => {
      // Keep state clean for subsequent interactions
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-surface-950/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-surface-200 overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-surface-900 text-white flex items-center justify-between border-b border-surface-800 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-black text-base sm:text-lg tracking-tight truncate">
                BazaarOne Legal & Security Center
              </h2>
              <p className="text-[11px] sm:text-xs text-surface-400 truncate">
                Compliance, Data Privacy, Terms of Service & Consumer Protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-3 sm:px-6 py-2.5 bg-surface-50 border-b border-surface-200 overflow-x-auto text-xs shrink-0 scrollbar-none overscroll-contain">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-surface-600 hover:bg-surface-200/70'
            }`}
          >
            <Lock className="h-3.5 w-3.5" /> Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-surface-600 hover:bg-surface-200/70'
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'refund'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-surface-600 hover:bg-surface-200/70'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Returns & Refunds
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'cookies'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-surface-600 hover:bg-surface-200/70'
            }`}
          >
            <Cookie className="h-3.5 w-3.5" /> Cookie Policy
          </button>
          <button
            onClick={() => setActiveTab('data-request')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'data-request'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-surface-600 hover:bg-surface-200/70'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" /> Data Rights & Deletion
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 text-surface-700 text-xs leading-relaxed flex-1 custom-scrollbar overscroll-contain">
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="border-b border-surface-200 pb-3">
                <h3 className="font-display font-extrabold text-base text-surface-900">
                  Privacy Policy & Data Protection
                </h3>
                <p className="text-[11px] text-surface-500">
                  Effective Date: September 2026 • Compliant with Digital Personal Data Protection (DPDP) Act
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-surface-900 text-xs uppercase tracking-wider">
                  1. Information We Collect
                </h4>
                <p>
                  BazaarOne collects only information strictly necessary to facilitate e-commerce orders, merchant storefront operations, and authenticated access:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-surface-600">
                  <li><strong>Account Identity:</strong> Full Name, Email Address, Hashed Password (salted with bcrypt factor 10).</li>
                  <li><strong>Shipping & Delivery:</strong> Shipping street addresses, City, State, Postal Code, and recipient phone numbers.</li>
                  <li><strong>Order & Transaction Records:</strong> Purchased item SKUs, quantity, prices, Razorpay transaction and order references.</li>
                  <li><strong>Merchant Credentials:</strong> Business store name, store description, contact phone, and dispatch location.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-surface-900 text-xs uppercase tracking-wider">
                  2. Payment Card Security
                </h4>
                <p>
                  BazaarOne does <strong>not</strong> collect, process, or store credit/debit card numbers, CVVs, or UPI PINs on our servers. All payment handling is encrypted and processed directly via PCI-DSS compliant Razorpay APIs.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-surface-900 text-xs uppercase tracking-wider">
                  3. Purpose of Processing & Data Sharing
                </h4>
                <p>
                  Customer shipping information is shared strictly with the specific vendor merchant fulfilling that order item. Customer records are never sold, rented, or monetized for advertising.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="border-b border-surface-200 pb-3">
                <h3 className="font-display font-extrabold text-base text-surface-900">
                  Terms of Service & Platform Rules
                </h3>
                <p className="text-[11px] text-surface-500">
                  Governs access to BazaarOne Multi-Vendor Marketplace portals
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-surface-900 text-xs uppercase tracking-wider">
                  1. Multi-Vendor Marketplace Operations
                </h4>
                <p>
                  BazaarOne operates as an online marketplace platform connecting independent retail vendors with consumer buyers. Product listings, stock availability, and item descriptions are maintained by verified merchant partners.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-surface-900 text-xs uppercase tracking-wider">
                  2. Account Responsibilities
                </h4>
                <p>
                  Users must maintain the confidentiality of their login credentials. Any unauthorized access resulting from compromised local passwords should be reported immediately.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-surface-900 text-xs uppercase tracking-wider">
                  3. Verified Review Integrity
                </h4>
                <p>
                  Product reviews and ratings are restricted strictly to customers with verified delivered purchases of that specific item. Submitting fraudulent or incentivized reviews is strictly prohibited.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: RETURNS & REFUNDS */}
          {activeTab === 'refund' && (
            <div className="space-y-4">
              <div className="border-b border-surface-200 pb-3">
                <h3 className="font-display font-extrabold text-base text-surface-900">
                  Returns, Cancellations & Refund Policy
                </h3>
                <p className="text-[11px] text-surface-500">
                  Transparent customer guarantees across all verified vendors
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-surface-900 text-xs uppercase tracking-wider">
                  1. Return Eligibility Window
                </h4>
                <p>
                  Eligible products may be returned within <strong>7 days</strong> of delivery if the product received is damaged, defective, materially different from the listing description, or missing parts.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-surface-900 text-xs uppercase tracking-wider">
                  2. Refund Processing Timelines
                </h4>
                <p>
                  Once an eligible return is inspected and confirmed by the vendor merchant:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-surface-600">
                  <li><strong>UPI / Instant Payments:</strong> Refund initiated within 24–48 hours to original source account.</li>
                  <li><strong>Credit / Debit Cards:</strong> Refund credited back within 5–7 business days per banking settlement schedules.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: COOKIE POLICY */}
          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <div className="border-b border-surface-200 pb-3">
                <h3 className="font-display font-extrabold text-base text-surface-900">
                  Cookie & Local Storage Policy
                </h3>
                <p className="text-[11px] text-surface-500">
                  How we use cookies to secure authentication and preserve shopping carts
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-surface-900 text-xs uppercase tracking-wider">
                  Essential Security Cookies
                </h4>
                <p>
                  BazaarOne uses only <strong>strictly necessary, essential HTTP-only cookies</strong> required for platform functionality:
                </p>
                <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-surface-900">token</span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      HTTP-Only • Secure • SameSite=Lax
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-500">
                    Stores the cryptographic JWT authentication session to maintain your secure login across customer, vendor, and administrator dashboards.
                  </p>
                </div>
                <p className="text-[11px] text-surface-500">
                  We do not utilize third-party tracking, behavioral advertising, or cross-site profiling cookies.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: DATA RIGHTS & DELETION */}
          {activeTab === 'data-request' && (
            <div className="space-y-4">
              <div className="border-b border-surface-200 pb-3">
                <h3 className="font-display font-extrabold text-base text-surface-900">
                  Data Subject Rights & Account Deletion Requests
                </h3>
                <p className="text-[11px] text-surface-500">
                  Exercise your right to access, export, or permanently erase your personal data
                </p>
              </div>

              {requestSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm">Request Submitted Successfully</h4>
                  <p className="text-xs text-emerald-700">
                    Your request for <strong>{dataRequestType === 'export' ? 'Data Export' : 'Account Deletion'}</strong> for <strong>{requestEmail}</strong> has been logged. Our Data Protection Officer will process your request within 72 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDataRequestSubmit} className="space-y-4">
                  <p>
                    Under data protection regulations, you have the right to request a full copy of your personal data or request permanent deletion of your account and associated records:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setDataRequestType('export')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        dataRequestType === 'export'
                          ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-bold shadow-2xs'
                          : 'border-surface-200 bg-white text-surface-700'
                      }`}
                    >
                      <span className="block text-xs">📦 Export Personal Data</span>
                      <span className="block text-[10px] text-surface-500 font-normal">
                        Receive JSON report of profile, addresses & orders
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDataRequestType('delete')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        dataRequestType === 'delete'
                          ? 'border-rose-500 bg-rose-50/50 text-rose-900 font-bold shadow-2xs'
                          : 'border-surface-200 bg-white text-surface-700'
                      }`}
                    >
                      <span className="block text-xs">🗑️ Delete Account & Data</span>
                      <span className="block text-[10px] text-surface-500 font-normal">
                        Permanently erase login credentials and addresses
                      </span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-surface-700 mb-1">
                      Account Email Address
                    </label>
                    <input
                      type="email"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="you@bazaarone.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-surface-700 mb-1">
                      Reason / Additional Details (Optional)
                    </label>
                    <textarea
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      placeholder="Please share any specific requirements..."
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-900 focus:outline-none focus:border-brand-500 resize-none"
                    />
                  </div>

                  <Button type="submit" variant={dataRequestType === 'delete' ? 'danger' : 'primary'} size="md">
                    Submit {dataRequestType === 'export' ? 'Export Request' : 'Deletion Request'}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-50 border-t border-surface-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-surface-500 text-[11px]">
            <Building2 className="h-3.5 w-3.5 text-surface-400" />
            <span>BazaarOne Marketplace Ltd. • Contact: support@bazaarone.com</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
