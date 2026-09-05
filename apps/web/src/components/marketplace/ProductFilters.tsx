'use client';

import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Filter, RotateCcw, Store, Sparkles } from 'lucide-react';
import { Category, Brand, VendorSummary } from '@/types/marketplace';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

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
  brands = [],
  vendors,
  search,
  selectedCategory,
  selectedVendor,
  selectedBrand = '',
  minPrice,
  maxPrice,
  sort,
  onSearchChange,
  onCategoryChange,
  onVendorChange,
  onBrandChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onReset,
  totalResults,
}) => {
  return (
    <div className="w-full space-y-4 bg-white p-5 rounded-3xl border border-surface-200/80 shadow-xs text-left">
      {/* Top Search & Sort Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8">
          <Input
            placeholder="Search products, brands, merchants across electronics, fashion, home, fitness..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <div className="relative w-full">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3.5 py-2.5 text-xs font-semibold text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="newest">Sort: Newest Arrivals</option>
              <option value="price-asc">Sort: Price: Low to High</option>
              <option value="price-desc">Sort: Price: High to Low</option>
              <option value="rating">Sort: Top Customer Rated</option>
            </select>
          </div>

          <Button variant="outline" size="md" onClick={onReset} title="Reset all filters">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 1. VENDOR FILTER SECTION (4 Specialized Merchants) */}
      <div className="space-y-2 pt-1 border-t border-surface-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-surface-600 flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 text-amber-500" /> Filter by Merchant / Vendor:
          </span>
          {selectedVendor && (
            <button
              onClick={() => onVendorChange('')}
              className="text-[11px] font-bold text-amber-600 hover:text-amber-700"
            >
              Clear Vendor
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onVendorChange('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none flex items-center gap-1.5 ${
              selectedVendor === ''
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-surface-900'
            }`}
          >
            <Store className="h-3.5 w-3.5" /> All Merchants
          </button>

          {vendors.map((vendor) => {
            const isSelected = selectedVendor === vendor.id || selectedVendor === vendor.slug;
            return (
              <button
                key={vendor.id}
                onClick={() => onVendorChange(isSelected ? '' : vendor.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200 hover:text-surface-900'
                }`}
                title={vendor.description || vendor.businessName}
              >
                <Store className="h-3.5 w-3.5 opacity-75" />
                <span>{vendor.businessName}</span>
                {vendor.productCount !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-surface-200 text-surface-600'
                    }`}
                  >
                    {vendor.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CATEGORY PILLS FILTER */}
      <div className="space-y-2 pt-2 border-t border-surface-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-surface-600 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-brand-600" /> Filter by Category:
          </span>
          {selectedCategory && (
            <button
              onClick={() => onCategoryChange('')}
              className="text-[11px] font-bold text-brand-600 hover:text-brand-700"
            >
              Clear Category
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${
              selectedCategory === ''
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-surface-900'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(isSelected ? '' : cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-surface-900'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SECONDARY CONTROLS (Price Range & Active Count) */}
      <div className="pt-3 border-t border-surface-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-surface-600">Price Range (₹):</span>
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-24 rounded-lg border border-surface-200 px-2.5 py-1.5 text-xs bg-surface-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <span className="text-surface-400 font-bold">-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-28 rounded-lg border border-surface-200 px-2.5 py-1.5 text-xs bg-surface-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {totalResults !== undefined && (
          <div className="text-surface-500 font-semibold text-xs">
            Showing <span className="font-extrabold text-surface-900">{totalResults}</span> product{totalResults === 1 ? '' : 's'}
          </div>
        )}
      </div>
    </div>
  );
};
