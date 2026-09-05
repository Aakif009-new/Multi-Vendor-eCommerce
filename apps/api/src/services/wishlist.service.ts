import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { CartService } from './cart.service';

export class WishlistService {
  static async getOrCreateWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true, slug: true } },
                vendor: { select: { id: true, businessName: true, slug: true } },
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true, slug: true } },
                  vendor: { select: { id: true, businessName: true, slug: true } },
                },
              },
            },
          },
        },
      });
    }

    return wishlist;
  }

  static async addToWishlist(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw AppError.notFound('Product not found.');
    }

    let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId } });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      // Duplicate prevention
      return { message: 'Product is already in your wishlist.', item: existing };
    }

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
      include: { product: true },
    });

    return item;
  }

  static async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) throw AppError.notFound('Wishlist not found.');

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return { message: 'Item removed from wishlist.' };
  }

  static async moveToCart(userId: string, productId: string) {
    // 1. Add to cart
    await CartService.addToCart(userId, productId, 1);

    // 2. Remove from wishlist
    await this.removeFromWishlist(userId, productId);

    return { message: 'Product moved to cart successfully.' };
  }
}
