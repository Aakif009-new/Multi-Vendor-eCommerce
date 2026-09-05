import { PricingService, CATEGORY_PRICE_RANGES } from '../services/pricing.service';
import { prisma } from '../config/db';

async function main() {
  try {
    await PricingService.updateAllProductPricing();

    console.log('\n--- Pricing Audit by Category ---');
    const categories = await prisma.category.findMany({
      where: {
        slug: { in: Object.keys(CATEGORY_PRICE_RANGES) },
      },
      include: {
        products: {
          select: { name: true, price: true, discountPrice: true },
        },
      },
    });

    for (const cat of categories) {
      console.log(`\n📂 ${cat.name} (${cat.slug}) — Target: ₹${CATEGORY_PRICE_RANGES[cat.slug].min} to ₹${CATEGORY_PRICE_RANGES[cat.slug].max}`);
      for (const p of cat.products.slice(0, 3)) {
        console.log(`   - ${p.name.slice(0, 35)}...: ₹${p.price.toLocaleString('en-IN')}${p.discountPrice ? ` (Discount: ₹${p.discountPrice.toLocaleString('en-IN')})` : ''}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Pricing update error:', err);
    process.exit(1);
  }
}

main();
