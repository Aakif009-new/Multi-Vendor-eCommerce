import { prisma } from '../config/db';
import { CURATED_100_PRODUCTS } from '../services/curatedCatalogData';

async function main() {
  const allowedSkus = new Set(CURATED_100_PRODUCTS.map((p) => p.sku));
  console.log(`Allowed SKUs count: ${allowedSkus.size}`);

  const allProducts = await prisma.product.findMany();
  console.log(`Total products before cleanup: ${allProducts.length}`);

  let deletedCount = 0;
  for (const prod of allProducts) {
    if (!prod.sku || !allowedSkus.has(prod.sku)) {
      // Delete associated cart items, wishlist items, order items if any, then delete product
      await prisma.cartItem.deleteMany({ where: { productId: prod.id } });
      await prisma.wishlistItem.deleteMany({ where: { productId: prod.id } });
      await prisma.review.deleteMany({ where: { productId: prod.id } });
      await prisma.orderItem.deleteMany({ where: { productId: prod.id } });
      await prisma.product.delete({ where: { id: prod.id } });
      deletedCount++;
    }
  }

  console.log(`Deleted ${deletedCount} non-catalog/test products.`);

  const remainingProducts = await prisma.product.findMany({
    include: { category: true },
  });
  console.log(`Total products remaining in database: ${remainingProducts.length}`);

  const counts: Record<string, number> = {};
  for (const p of remainingProducts) {
    const slug = p.category?.slug || 'unknown';
    counts[slug] = (counts[slug] || 0) + 1;
  }

  console.log('\n--- Final Distribution Matrix ---');
  for (const [slug, count] of Object.entries(counts)) {
    console.log(`  ${slug.padEnd(25)}: ${count}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
