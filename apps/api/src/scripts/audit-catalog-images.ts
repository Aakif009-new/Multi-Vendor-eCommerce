import { prisma } from '../config/db';
import { env } from '../config/env';

const EXPECTED_DISTRIBUTION: Record<string, { name: string; count: number }> = {
  'electronics': { name: 'Electronics', count: 12 },
  'computers-accessories': { name: 'Computers & Accessories', count: 8 },
  'mens-fashion': { name: "Men's Fashion", count: 8 },
  'womens-fashion': { name: "Women's Fashion", count: 10 },
  'home-kitchen': { name: 'Home & Kitchen', count: 12 },
  'beauty-personal-care': { name: 'Beauty & Personal Care', count: 8 },
  'grocery-food': { name: 'Grocery & Food', count: 10 },
  'sports-fitness': { name: 'Sports & Fitness', count: 7 },
  'books-stationery': { name: 'Books & Stationery', count: 7 },
  'toys-games': { name: 'Toys & Games', count: 6 },
  'automotive': { name: 'Automotive', count: 6 },
  'mobile-accessories': { name: 'Mobile Accessories', count: 6 },
};

async function auditCatalog() {
  console.log('=== STARTING COMPLETE CATALOGUE & IMAGE AUDIT ===\n');

  const products = await prisma.product.findMany({
    include: {
      category: true,
      vendor: true,
      brand: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Total Products Found in Database: ${products.length}`);

  let totalImages = 0;
  let missingImagesCount = 0;
  let cloudinaryImagesCount = 0;
  let pexelsImagesCount = 0;
  let otherImagesCount = 0;
  const imageMap = new Map<string, number>();

  const categoryCounts: Record<string, number> = {};

  for (const p of products) {
    const catSlug = p.category?.slug || 'unknown';
    categoryCounts[catSlug] = (categoryCounts[catSlug] || 0) + 1;

    if (!p.images || p.images.length === 0) {
      missingImagesCount++;
    } else {
      totalImages += p.images.length;
      for (const img of p.images) {
        imageMap.set(img, (imageMap.get(img) || 0) + 1);

        if (img.includes('cloudinary.com')) {
          cloudinaryImagesCount++;
        } else if (img.includes('pexels.com') || img.includes('images.pexels.com')) {
          pexelsImagesCount++;
        } else {
          otherImagesCount++;
        }
      }
    }
  }

  let duplicateImagesCount = 0;
  for (const [url, count] of imageMap.entries()) {
    if (count > 1) {
      duplicateImagesCount += (count - 1);
    }
  }

  console.log('\n--- Category Distribution Audit ---');
  let distributionMatches = true;
  for (const [slug, expected] of Object.entries(EXPECTED_DISTRIBUTION)) {
    const actual = categoryCounts[slug] || 0;
    const match = actual === expected.count;
    if (!match) distributionMatches = false;
    console.log(`  ${expected.name.padEnd(25)} : Expected ${expected.count}, Found ${actual} -> ${match ? '✅ MATCH' : '❌ MISMATCH'}`);
  }

  console.log('\n--- Image Sourcing Breakdown ---');
  console.log(`  Total Images Attached    : ${totalImages}`);
  console.log(`  Products Without Images  : ${missingImagesCount}`);
  console.log(`  Cloudinary Hosted Images : ${cloudinaryImagesCount}`);
  console.log(`  Pexels Direct Images     : ${pexelsImagesCount}`);
  console.log(`  Other Curated CDN Images : ${otherImagesCount}`);
  console.log(`  Duplicate Image Usages   : ${duplicateImagesCount}`);

  console.log('\n--- Sample Product Inspection (1 per category) ---');
  const seenCategories = new Set<string>();
  for (const p of products) {
    const slug = p.category?.slug || '';
    if (!seenCategories.has(slug)) {
      seenCategories.add(slug);
      console.log(`[${p.category?.name}] ${p.name}`);
      console.log(`  Price: ₹${p.price.toLocaleString('en-IN')}, SKU: ${p.sku}`);
      console.log(`  Image: ${p.images?.[0] || 'NONE'}`);
    }
  }

  process.exit(0);
}

auditCatalog().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
