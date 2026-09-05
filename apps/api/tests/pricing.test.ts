import { prisma } from '../src/config/db';
import { CATEGORY_PRICE_RANGES } from '../src/services/pricing.service';

describe('Realistic Category-Aligned INR Pricing & Discount Validation', () => {
  it('should verify all products in each of the 12 categories adhere to realistic price ranges', async () => {
    const products = await prisma.product.findMany({
      include: { category: true },
    });

    expect(products.length).toBeGreaterThanOrEqual(100);

    for (const product of products) {
      if (!product.category || !CATEGORY_PRICE_RANGES[product.category.slug]) continue;

      const range = CATEGORY_PRICE_RANGES[product.category.slug];

      // Regular price validation
      expect(product.price).toBeGreaterThanOrEqual(range.min);
      expect(product.price).toBeLessThanOrEqual(range.max * 1.05); // allow small psychological rounding buffer

      // Discount price validation
      if (product.discountPrice !== null && product.discountPrice !== undefined) {
        expect(product.discountPrice).toBeGreaterThan(0);
        expect(product.discountPrice).toBeLessThan(product.price);
      }
    }
  });

  it('should verify prices are diverse across different products within the same category', async () => {
    const electronics = await prisma.product.findMany({
      where: { category: { slug: 'electronics' } },
      select: { price: true },
    });

    const uniquePrices = new Set(electronics.map((p) => p.price));
    expect(uniquePrices.size).toBeGreaterThan(4);
  });
});
