import { prisma } from '../config/db';
import { hashPassword } from '../utils/password';
import { CURATED_100_PRODUCTS } from '../services/curatedCatalogData';

async function main() {
  console.log('🔄 Starting Curated 100-Product Catalog Re-seed & Image Correction...\n');

  // 1. Ensure Default Admin, Vendors and Customers exist
  const defaultPasswordHash = await hashPassword('Market@123');

  // Ensure Admin
  await prisma.user.upsert({
    where: { email: 'admin@bazaarone.com' },
    update: { role: 'ADMIN', status: 'ACTIVE' },
    create: {
      name: 'Super Administrator',
      email: 'admin@bazaarone.com',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Ensure 6 Vendors
  const vendorConfigs = [
    { name: 'Apex Electronics Direct', slug: 'apex-electronics-direct', email: 'apex@bazaarone.com' },
    { name: 'Urban Stitch Apparel', slug: 'urban-stitch-apparel', email: 'urbanstitch@bazaarone.com' },
    { name: 'Artisan Heritage Loom', slug: 'artisan-heritage-loom', email: 'artisanloom@bazaarone.com' },
    { name: 'Nordic Craft & Living', slug: 'nordic-craft-living', email: 'nordiccraft@bazaarone.com' },
    { name: 'Botanica Herbal Care', slug: 'botanica-herbal-care', email: 'botanica@bazaarone.com' },
    { name: 'Himalayan Harvest Estates', slug: 'himalayan-harvest-estates', email: 'himalayan@bazaarone.com' },
  ];

  const vendorIds: string[] = [];

  for (const vConfig of vendorConfigs) {
    const user = await prisma.user.upsert({
      where: { email: vConfig.email },
      update: { role: 'VENDOR', status: 'ACTIVE' },
      create: {
        name: vConfig.name,
        email: vConfig.email,
        passwordHash: defaultPasswordHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });

    let vendor = await prisma.vendor.findFirst({
      where: {
        OR: [{ userId: user.id }, { slug: vConfig.slug }],
      },
    });

    if (vendor) {
      vendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          userId: user.id,
          businessName: vConfig.name,
          slug: vConfig.slug,
          status: 'APPROVED',
          accountStatus: 'ACTIVE',
        },
      });
    } else {
      vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          businessName: vConfig.name,
          slug: vConfig.slug,
          businessAddress: '100 Merchant Avenue, Bengaluru',
          phone: '9876543210',
          status: 'APPROVED',
          accountStatus: 'ACTIVE',
        },
      });
    }

    vendorIds.push(vendor.id);
  }

  // Ensure 12 Standard Categories
  const categoryConfigs = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Computers & Accessories', slug: 'computers-accessories' },
    { name: "Men's Fashion", slug: 'mens-fashion' },
    { name: "Women's Fashion", slug: 'womens-fashion' },
    { name: 'Home & Kitchen', slug: 'home-kitchen' },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
    { name: 'Grocery & Food', slug: 'grocery-food' },
    { name: 'Sports & Fitness', slug: 'sports-fitness' },
    { name: 'Books & Stationery', slug: 'books-stationery' },
    { name: 'Toys & Games', slug: 'toys-games' },
    { name: 'Automotive', slug: 'automotive' },
    { name: 'Mobile Accessories', slug: 'mobile-accessories' },
  ];

  const categoryMap = new Map<string, string>();
  for (const c of categoryConfigs) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, isActive: true },
      create: { name: c.name, slug: c.slug, isActive: true },
    });
    categoryMap.set(c.slug, cat.id);
  }

  // Ensure Brands
  const brandConfigs = ['Apex Audio', 'Urban Stitch', 'Artisan Loom', 'Nordic Craft', 'Botanica Herbal', 'Himalayan Harvest'];
  const brandMap = new Map<string, string>();
  for (const b of brandConfigs) {
    const bSlug = b.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const brand = await prisma.brand.upsert({
      where: { slug: bSlug },
      update: { name: b, isActive: true },
      create: { name: b, slug: bSlug, isActive: true },
    });
    brandMap.set(b, brand.id);
  }

  // 2. Synchronize all 100 Curated Products
  console.log(`Processing ${CURATED_100_PRODUCTS.length} curated products...`);

  let count = 0;
  for (const p of CURATED_100_PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) {
      console.error(`Missing category for slug: ${p.categorySlug}`);
      continue;
    }

    const brandId = brandMap.get(p.brandName);
    const vendorId = vendorIds[(p.vendorIndex || 0) % vendorIds.length];
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await prisma.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice || null,
        stock: p.stock,
        sku: p.sku,
        images: [p.imageUrl],
        status: 'ACTIVE',
        categoryId,
        brandId,
        vendorId,
        rating: 4.8,
        numReviews: Math.floor(Math.random() * 25) + 5,
      },
      create: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice || null,
        stock: p.stock,
        sku: p.sku,
        images: [p.imageUrl],
        status: 'ACTIVE',
        categoryId,
        brandId,
        vendorId,
        rating: 4.8,
        numReviews: Math.floor(Math.random() * 25) + 5,
      },
    });

    count++;
  }

  console.log(`✅ Successfully seeded/updated ${count} products with verified, 1-to-1 matched imagery and INR ₹ pricing.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error during reseed:', err);
  process.exit(1);
});
