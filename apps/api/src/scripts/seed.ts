import { SeedService } from '../services/seed.service';
import { prisma } from '../config/db';

async function main() {
  try {
    console.log('--- Initializing 100-Product Catalog Pipeline ---');
    const result = await SeedService.seed100Products();
    console.log('Result:', result);

    const totalProducts = await prisma.product.count();
    console.log(`Verified total products in database: ${totalProducts}`);

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    console.log('\n--- Category Distribution Breakdown ---');
    for (const cat of categories) {
      console.log(`- ${cat.name} (${cat.slug}): ${cat._count.products} products`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

main();
