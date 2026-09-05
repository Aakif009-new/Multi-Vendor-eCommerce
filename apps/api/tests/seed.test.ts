import { prisma } from '../src/config/db';

describe('Phase 3 — 100-Product Catalog & Category Distribution Verification', () => {
  const expectedDistribution: Record<string, number> = {
    'electronics': 12,
    'computers-accessories': 8,
    'mens-fashion': 8,
    'womens-fashion': 10,
    'home-kitchen': 12,
    'beauty-personal-care': 8,
    'grocery-food': 10,
    'sports-fitness': 7,
    'books-stationery': 7,
    'toys-games': 6,
    'automotive': 6,
    'mobile-accessories': 6,
  };

  it('should verify all 12 core categories exist in MongoDB Atlas', async () => {
    const categories = await prisma.category.findMany({
      where: {
        slug: { in: Object.keys(expectedDistribution) },
      },
    });

    expect(categories.length).toBe(12);
  });

  it('should verify the exact product count per category matches specification (Total: 100)', async () => {
    let totalCount = 0;

    for (const [slug, expectedCount] of Object.entries(expectedDistribution)) {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          products: true,
        },
      });

      expect(category).not.toBeNull();
      expect(category!.products.length).toBe(expectedCount);
      totalCount += category!.products.length;
    }

    expect(totalCount).toBe(100);
  });

  it('should verify all seeded products have realistic pricing, positive stock, SKUs, and image URLs', async () => {
    const products = await prisma.product.findMany({
      where: {
        category: {
          slug: { in: Object.keys(expectedDistribution) },
        },
      },
    });

    expect(products.length).toBe(100);

    for (const prod of products) {
      expect(prod.name.length).toBeGreaterThan(5);
      expect(prod.description.length).toBeGreaterThan(20);
      expect(prod.price).toBeGreaterThan(0);
      expect(prod.stock).toBeGreaterThanOrEqual(1);
      expect(prod.sku).toBeDefined();
      expect(prod.images.length).toBeGreaterThanOrEqual(1);
      expect(prod.images[0]).toMatch(/^https?:\/\//);
      expect(prod.status).toBe('ACTIVE');
    }
  });
});
