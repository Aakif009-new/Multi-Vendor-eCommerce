'use client';

import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CookieConsentBannerProps {
  onOpenCookiePolicy?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenCookiePolicy,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('bazaarone_cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('bazaarone_cookie_consent', 'all');
    } catch {}
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem('bazaarone_cookie_consent', 'essential');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 p-4 md:p-5 rounded-3xl bg-surface-900/95 text-white border border-surface-700/80 shadow-2xl backdrop-blur-md animate-slide-up text-left">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-2xl bg-brand-500/20 text-brand-400 shrink-0 border border-brand-500/30">
          <Cookie className="h-5 w-5" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5">
              Cookie & Privacy Consent
            </h4>
            <button
              onClick={handleAcceptEssential}
              className="text-surface-400 hover:text-white transition-colors"
              aria-label="Dismiss cookie banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-surface-300 leading-relaxed">
            We use strictly essential HTTP-only cookies to secure your authentication token and maintain your multi-vendor shopping cart. We do not track you with third-party advertising cookies.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAcceptAll}
              className="text-xs font-bold px-3 py-1.5 h-auto"
            >
              Accept All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptEssential}
              className="text-xs font-semibold px-3 py-1.5 h-auto text-surface-300 border-surface-700 hover:text-white"
            >
              Essential Only
            </Button>
            {onOpenCookiePolicy && (
              <button
                type="button"
                onClick={onOpenCookiePolicy}
                className="text-[11px] text-brand-400 hover:text-brand-300 underline underline-offset-2 ml-1"
              >
                Learn More
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
