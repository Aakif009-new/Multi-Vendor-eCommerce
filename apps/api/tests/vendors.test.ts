import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';

describe('Multi-Vendor System & Advanced Filtering API', () => {
  let apexVendor: any;
  let urbanVendor: any;
  let homeVendor: any;
  let playVendor: any;
  let electronicsCategory: any;
  let fashionCategory: any;

  beforeAll(async () => {
    // 1. Fetch the 4 specific seeded vendors by unique slug
    apexVendor = await prisma.vendor.findFirst({ where: { slug: 'apex-electronics' } });
    urbanVendor = await prisma.vendor.findFirst({ where: { slug: 'urbancart' } });
    homeVendor = await prisma.vendor.findFirst({ where: { slug: 'homenest' } });
    playVendor = await prisma.vendor.findFirst({ where: { slug: 'playsphere' } });

    // 2. Fetch categories
    electronicsCategory = await prisma.category.findFirst({ where: { slug: 'electronics' } });
    fashionCategory = await prisma.category.findFirst({ where: { slug: 'mens-fashion' } });
  });

  describe('GET /api/vendors', () => {
    it('should return approved vendors with product counts and public metadata', async () => {
      const res = await request(app).get('/api/vendors');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);

      const first = res.body.data.find((v: any) => v.slug === 'apex-electronics') || res.body.data[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('businessName');
      expect(first).toHaveProperty('slug');
      expect(first).toHaveProperty('description');
      expect(first).toHaveProperty('businessAddress');
      expect(first).toHaveProperty('phone');
      expect(first).toHaveProperty('rating');
      expect(first).toHaveProperty('productCount');
      expect(typeof first.productCount).toBe('number');
    });

    it('should return single vendor storefront on GET /api/vendors/store/:idOrSlug', async () => {
      const res = await request(app).get(`/api/vendors/store/${apexVendor.slug}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('businessName', apexVendor.businessName);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.products.length).toBe(26); // Apex Electronics has 26 products
    });
  });

  describe('GET /api/products Multi-Vendor Filtering', () => {
    it('should filter products by vendorId', async () => {
      const res = await request(app).get(`/api/products?vendorId=${apexVendor.id}&limit=50`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(26);

      // Verify every returned product belongs to Apex Electronics
      for (const prod of res.body.data) {
        expect(prod.vendorId).toBe(apexVendor.id);
      }
    });

    it('should filter products by vendorSlug', async () => {
      const res = await request(app).get(`/api/products?vendorSlug=urbancart&limit=50`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(26);

      for (const prod of res.body.data) {
        expect(prod.vendor?.slug).toBe('urbancart');
      }
    });

    it('should filter products by Vendor + Category simultaneously', async () => {
      const res = await request(app).get(
        `/api/products?vendorId=${apexVendor.id}&categoryId=${electronicsCategory.id}&limit=50`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(12); // Apex has exactly 12 electronics products

      for (const prod of res.body.data) {
        expect(prod.vendorId).toBe(apexVendor.id);
        expect(prod.categoryId).toBe(electronicsCategory.id);
      }
    });

    it('should filter products by Vendor + Search term simultaneously', async () => {
      const res = await request(app).get(
        `/api/products?vendorId=${apexVendor.id}&search=Headphones&limit=50`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      for (const prod of res.body.data) {
        expect(prod.vendorId).toBe(apexVendor.id);
        const text = `${prod.name} ${prod.description}`.toLowerCase();
        expect(text).toContain('headphones');
      }
    });

    it('should filter products by Vendor + Price Range (minPrice & maxPrice)', async () => {
      const min = 1000;
      const max = 15000;
      const res = await request(app).get(
        `/api/products?vendorId=${apexVendor.id}&minPrice=${min}&maxPrice=${max}&limit=50`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      for (const prod of res.body.data) {
        expect(prod.vendorId).toBe(apexVendor.id);
        expect(prod.price).toBeGreaterThanOrEqual(min);
        expect(prod.price).toBeLessThanOrEqual(max);
      }
    });

    it('should execute combined multi-filter: Vendor + Category + Price + Sort', async () => {
      const res = await request(app).get(
        `/api/products?vendorId=${apexVendor.id}&category=electronics&minPrice=1000&maxPrice=60000&sort=price-asc&limit=50`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      // Verify sort order is price ascending
      for (let i = 1; i < res.body.data.length; i++) {
        expect(res.body.data[i].price).toBeGreaterThanOrEqual(res.body.data[i - 1].price);
      }
    });

    it('should paginate correctly with vendor filtering', async () => {
      const limit = 5;
      const res = await request(app).get(
        `/api/products?vendorId=${apexVendor.id}&page=1&limit=${limit}`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(limit);
      expect(res.body.meta).toHaveProperty('total', 26);
      expect(res.body.meta).toHaveProperty('page', 1);
      expect(res.body.meta).toHaveProperty('limit', limit);
      expect(res.body.meta).toHaveProperty('totalPages', 6);
    });

    it('should handle invalid or nonexistent vendorId gracefully', async () => {
      const res = await request(app).get(`/api/products?vendorId=64f000000000000000000000`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
      expect(res.body.meta.total).toBe(0);
    });
  });
});
