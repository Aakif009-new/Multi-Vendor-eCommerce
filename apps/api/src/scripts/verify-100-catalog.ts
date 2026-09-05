import { prisma } from '../config/db';

const CORE_CATEGORY_SLUGS = [
  'electronics',
  'computers-accessories',
  'mens-fashion',
  'womens-fashion',
  'home-kitchen',
  'beauty-personal-care',
  'grocery-food',
  'sports-fitness',
  'books-stationery',
  'toys-games',
  'automotive',
  'mobile-accessories',
];

async function verify100CoreCatalog() {
  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: { in: CORE_CATEGORY_SLUGS },
      },
    },
    include: {
      category: true,
    },
  });

  console.log(`Core Catalog Products: ${products.length}`);

  const counts: Record<string, number> = {};
  let missingImages = 0;
  const imageSet = new Set<string>();
  const duplicateImages: string[] = [];

  for (const p of products) {
    const slug = p.category?.slug || '';
    counts[slug] = (counts[slug] || 0) + 1;

    if (!p.images || p.images.length === 0 || !p.images[0]) {
      missingImages++;
    } else {
      const url = p.images[0];
      if (imageSet.has(url)) {
        duplicateImages.push(url);
      } else {
        imageSet.add(url);
      }
    }
  }

  console.log('\n--- 100 Catalog Distribution ---');
  for (const slug of CORE_CATEGORY_SLUGS) {
    console.log(`  ${slug.padEnd(25)}: ${counts[slug] || 0}`);
  }

  console.log(`\nMissing Images in 100 Catalog: ${missingImages}`);
  console.log(`Unique Image URLs: ${imageSet.size}`);
  console.log(`Duplicate Image URLs: ${duplicateImages.length}`);

  process.exit(0);
}

verify100CoreCatalog();
