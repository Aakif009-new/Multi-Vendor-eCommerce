'use client';

import React from 'react';
import { Store, Filter, RotateCcw, Check, Star, X } from 'lucide-react';
import { Category, Brand, VendorSummary } from '@/types/marketplace';

export interface ProductFiltersProps {
  categories: Category[];
  brands?: Brand[];
  vendors: (VendorSummary & { productCount?: number })[];
  search: string;
  selectedCategory: string;
  selectedVendor: string;
  selectedBrand?: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  onBrandChange?: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
  totalResults?: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  vendors,
  selectedCategory,
  selectedVendor,
  minPrice,
  maxPrice,
  onCategoryChange,
  onVendorChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}) => {
  const hasActiveFilters = Boolean(
    selectedCategory || selectedVendor || minPrice || maxPrice
  );

  return (
    <aside className="w-full bg-white rounded-2xl border border-surface-200/80 p-5 space-y-6 text-left shadow-subtle">
      {/* Header with Clear All */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-100">
        <h3 className="font-display text-sm font-bold text-surface-900 flex items-center gap-2">
          <Filter className="h-4 w-4 text-surface-500" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* 1. Stores / Merchants Filter */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-surface-500 flex items-center gap-1.5">
          <Store className="h-3.5 w-3.5 text-surface-400" /> Stores
        </span>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onVendorChange('')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedVendor === ''
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
            }`}
          >
            <span>All Stores</span>
            {selectedVendor === '' && <Check className="h-3.5 w-3.5 text-brand-600" />}
          </button>

          {vendors.map((v) => {
            const isSelected = selectedVendor === v.id || selectedVendor === v.slug;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onVendorChange(isSelected ? '' : v.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                }`}
              >
                <span className="truncate">{v.businessName}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-brand-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Categories Filter */}
      <div className="space-y-3 pt-3 border-t border-surface-100">
        <span className="text-xs font-bold uppercase tracking-wider text-surface-500 block">
          Categories
        </span>

        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onCategoryChange('')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === '' && <Check className="h-3.5 w-3.5 text-brand-600" />}
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(isSelected ? '' : cat.slug)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-brand-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price Range Filter */}
      <div className="space-y-3 pt-3 border-t border-surface-100">
        <span className="text-xs font-bold uppercase tracking-wider text-surface-500 block">
          Price Range (₹)
        </span>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-surface-400 block mb-1">Min Price</label>
            <input
              type="number"
              placeholder="₹ Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-surface-200 bg-surface-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-surface-400 block mb-1">Max Price</label>
            <input
              type="number"
              placeholder="₹ Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-surface-200 bg-surface-50 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Quick Price Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              onMinPriceChange('');
              onMaxPriceChange('1000');
            }}
            className="px-2 py-1 rounded-md bg-surface-100 hover:bg-surface-200 text-surface-600 text-[10px] font-medium transition-colors"
          >
            Under ₹1k
          </button>
          <button
            type="button"
            onClick={() => {
              onMinPriceChange('1000');
              onMaxPriceChange('5000');
            }}
            className="px-2 py-1 rounded-md bg-surface-100 hover:bg-surface-200 text-surface-600 text-[10px] font-medium transition-colors"
          >
            ₹1k – ₹5k
          </button>
          <button
            type="button"
            onClick={() => {
              onMinPriceChange('5000');
              onMaxPriceChange('');
            }}
            className="px-2 py-1 rounded-md bg-surface-100 hover:bg-surface-200 text-surface-600 text-[10px] font-medium transition-colors"
          >
            ₹5k+
          </button>
        </div>
      </div>
    </aside>
  );
};

