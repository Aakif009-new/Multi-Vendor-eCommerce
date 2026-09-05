import { prisma } from '../config/db';
import { hashPassword } from '../utils/password';
import { CURATED_100_PRODUCTS, VENDOR_DEFINITIONS, getVendorSlugForCategory } from '../services/curatedCatalogData';

async function main() {
  console.log('🔄 Performing clean catalog reset with 4 specialized vendors and EXACTLY 100 curated products...\n');

  // 1. Clear existing products and associated relation records
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

  console.log('Cleared previous product documents.');

  // 2. Ensure Default Users (Admin, Customer)
  const defaultPasswordHash = await hashPassword('Market@123');

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

  await prisma.user.upsert({
    where: { email: 'customer@bazaarone.com' },
    update: { role: 'CUSTOMER', status: 'ACTIVE' },
    create: {
      name: 'Priya Sharma',
      email: 'customer@bazaarone.com',
      passwordHash: defaultPasswordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  // Ensure EXACTLY 4 Approved Vendors
  const vendorIdMap = new Map<string, string>(); // slug -> vendor.id

  for (const vDef of VENDOR_DEFINITIONS) {
    const user = await prisma.user.upsert({
      where: { email: vDef.email },
      update: { name: vDef.name, role: 'VENDOR', status: 'ACTIVE' },
      create: {
        name: vDef.name,
        email: vDef.email,
        passwordHash: defaultPasswordHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });

    let vendor = await prisma.vendor.findFirst({
      where: {
        OR: [{ userId: user.id }, { slug: vDef.slug }],
      },
    });

    if (vendor) {
      vendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          userId: user.id,
          businessName: vDef.name,
          slug: vDef.slug,
          businessAddress: vDef.businessAddress,
          phone: vDef.phone,
          description: vDef.description,
          status: 'APPROVED',
          accountStatus: 'ACTIVE',
          rating: 4.9,
        },
      });
    } else {
      vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          businessName: vDef.name,
          slug: vDef.slug,
          businessAddress: vDef.businessAddress,
          phone: vDef.phone,
          description: vDef.description,
          status: 'APPROVED',
          accountStatus: 'ACTIVE',
          rating: 4.9,
        },
      });
    }

    vendorIdMap.set(vDef.slug, vendor.id);
  }

  console.log(`✅ Ensured ${vendorIdMap.size} Approved Specialized Vendors in MongoDB Atlas.`);

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
  const brandConfigs = ['Apex Audio', 'Urban Stitch', 'Artisan Loom', 'Nordic Craft', 'Botanica Herbal', 'Himalayan Harvest', 'PlaySphere Sports'];
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

  // 3. Create EXACTLY 100 Products with deterministic vendor mapping
  console.log(`Seeding ${CURATED_100_PRODUCTS.length} curated products mapped to specialized vendors...`);

  for (const p of CURATED_100_PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug)!;
    const brandId = brandMap.get(p.brandName);
    const vendorSlug = getVendorSlugForCategory(p.categorySlug);
    const vendorId = vendorIdMap.get(vendorSlug)!;
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await prisma.product.create({
      data: {
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
  }

  const finalProducts = await prisma.product.findMany({
    include: { category: true, vendor: true },
  });
  console.log(`\n✅ Exact total products in database: ${finalProducts.length}`);

  const catCounts: Record<string, number> = {};
  const vendorCounts: Record<string, number> = {};
  const vendorCatMatrix: Record<string, Record<string, number>> = {};

  for (const p of finalProducts) {
    const cSlug = p.category?.slug || 'unknown';
    const vName = p.vendor?.businessName || 'unknown';

    catCounts[cSlug] = (catCounts[cSlug] || 0) + 1;
    vendorCounts[vName] = (vendorCounts[vName] || 0) + 1;

    if (!vendorCatMatrix[vName]) vendorCatMatrix[vName] = {};
    vendorCatMatrix[vName][cSlug] = (vendorCatMatrix[vName][cSlug] || 0) + 1;
  }

  console.log('\n--- 12-Category Final Distribution ---');
  for (const c of categoryConfigs) {
    console.log(`  ${c.name.padEnd(25)} (${c.slug}): ${catCounts[c.slug] || 0}`);
  }

  console.log('\n--- 4-Vendor Final Distribution ---');
  for (const [vName, count] of Object.entries(vendorCounts)) {
    console.log(`  ${vName.padEnd(25)}: ${count} products`);
    for (const [cat, cnt] of Object.entries(vendorCatMatrix[vName] || {})) {
      console.log(`    - ${cat}: ${cnt}`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Reset error:', err);
  process.exit(1);
});
