import { prisma } from '../config/db';

export interface CategoryPriceRange {
  min: number;
  max: number;
}

export const CATEGORY_PRICE_RANGES: Record<string, CategoryPriceRange> = {
  'electronics': { min: 2000, max: 80000 },
  'computers-accessories': { min: 500, max: 120000 },
  'mens-fashion': { min: 400, max: 5000 },
  'womens-fashion': { min: 500, max: 8000 },
  'home-kitchen': { min: 300, max: 15000 },
  'beauty-personal-care': { min: 200, max: 5000 },
  'grocery-food': { min: 50, max: 3000 },
  'sports-fitness': { min: 300, max: 15000 },
  'books-stationery': { min: 100, max: 2500 },
  'toys-games': { min: 200, max: 5000 },
  'automotive': { min: 300, max: 10000 },
  'mobile-accessories': { min: 100, max: 5000 },
};

export class PricingService {
  /**
   * Helper to format clean psychological retail pricing in INR (e.g. 499, 1299, 14999)
   */
  static formatRetailPrice(rawPrice: number): number {
    const price = Math.round(rawPrice);
    if (price < 500) {
      // e.g. 99, 149, 199, 249, 299, 349, 399, 449, 499
      return Math.floor(price / 50) * 50 + (price % 50 > 25 ? 49 : 99);
    } else if (price < 5000) {
      // e.g. 799, 1299, 1499, 2499, 3999, 4999
      return Math.floor(price / 100) * 100 + 99;
    } else {
      // e.g. 7999, 14999, 24999, 64999
      return Math.floor(price / 500) * 500 + (price % 500 > 250 ? 499 : 999);
    }
  }

  /**
   * Calculate valid discount price strictly lower than regular price
   */
  static calculateDiscountPrice(regularPrice: number, discountPercent: number): number {
    const rawDiscountPrice = regularPrice * (1 - discountPercent / 100);
    const formattedDiscount = this.formatRetailPrice(rawDiscountPrice);

    // Guarantee discountPrice is strictly lower than regularPrice and positive
    if (formattedDiscount >= regularPrice) {
      return regularPrice - 100 > 0 ? regularPrice - 100 : Math.round(regularPrice * 0.85);
    }
    return Math.max(Math.round(regularPrice * 0.5), formattedDiscount);
  }

  /**
   * Update all 100 products in MongoDB Atlas with realistic randomized category-compliant INR pricing
   */
  static async updateAllProductPricing() {
    console.log('🔄 Updating all product pricing across the 12 categories...');
    const products = await prisma.product.findMany({
      include: { category: true },
    });

    let updatedCount = 0;

    for (const product of products) {
      const categorySlug = product.category?.slug || 'electronics';
      const range = CATEGORY_PRICE_RANGES[categorySlug] || { min: 500, max: 5000 };

      // Generate realistic randomized price within category range with deterministic seed based on product name
      const nameHash = product.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomFactor = (nameHash % 100) / 100; // 0.00 to 0.99
      const rawPrice = range.min + randomFactor * (range.max - range.min);

      const regularPrice = Math.max(range.min, this.formatRetailPrice(rawPrice));

      // 70% of products get a realistic discount between 10% and 30%
      const hasDiscount = (nameHash % 10) >= 3;
      const discountPercent = hasDiscount ? 10 + (nameHash % 21) : 0; // 10% to 30%

      const discountPrice = hasDiscount
        ? this.calculateDiscountPrice(regularPrice, discountPercent)
        : null;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          price: regularPrice,
          discountPrice,
        },
      });

      updatedCount++;
    }

    console.log(`✅ Successfully updated pricing for ${updatedCount} products in MongoDB Atlas.`);
    return { updatedCount };
  }
}
