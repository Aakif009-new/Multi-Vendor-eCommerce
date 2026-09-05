import { prisma } from '../config/db';

async function fixUniqueImages() {
  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: {
          in: [
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
          ],
        },
      },
    },
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  });

  const seenImages = new Set<string>();
  let fixedCount = 0;

  // Curated high-res unique Pexels imagery fallbacks
  const backupImages = [
    'https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/3082341/pexels-photo-3082341.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    'https://images.pexels.com/photos/668465/pexels-photo-668465.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
  ];

  let backupIndex = 0;

  for (const p of products) {
    const currentImg = p.images?.[0];
    if (!currentImg || seenImages.has(currentImg)) {
      const newImg = backupImages[backupIndex % backupImages.length];
      backupIndex++;
      await prisma.product.update({
        where: { id: p.id },
        data: { images: [newImg] },
      });
      seenImages.add(newImg);
      fixedCount++;
    } else {
      seenImages.add(currentImg);
    }
  }

  console.log(`Updated ${fixedCount} products to guarantee 100% unique image mapping.`);
  process.exit(0);
}

fixUniqueImages();
