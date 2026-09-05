import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export class CartService {
  static async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
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

    if (!cart) {
      cart = await prisma.cart.create({
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

    // Compute live pricing and stock alerts
    let subtotal = 0;
    let totalItems = 0;
    const validatedItems = cart.items.map((item) => {
      const price = item.product.discountPrice ?? item.product.price;
      const isAvailable = item.product.status === 'ACTIVE' && item.product.stock > 0;
      const isLowStock = isAvailable && item.product.stock < item.quantity;

      if (isAvailable) {
        subtotal += price * item.quantity;
        totalItems += item.quantity;
      }

      return {
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
          images: item.product.images,
          stock: item.product.stock,
          status: item.product.status,
          vendor: item.product.vendor,
          category: item.product.category,
        },
        quantity: item.quantity,
        isAvailable,
        isLowStock,
        itemTotal: price * item.quantity,
      };
    });

    return {
      id: cart.id,
      items: validatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalItems,
    };
  }

  static async addToCart(userId: string, productId: string, quantity = 1) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== 'ACTIVE') {
      throw AppError.notFound('Product is not active or available for purchase.');
    }

    if (product.stock < quantity) {
      throw AppError.badRequest(`Insufficient stock. Only ${product.stock} items currently available.`);
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw AppError.badRequest(
          `Cannot add ${quantity} more. Current cart quantity (${existingItem.quantity}) exceeds available stock (${product.stock}).`
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  static async updateQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw AppError.notFound('Cart not found.');

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!item || item.cartId !== cart.id) {
      throw AppError.notFound('Cart item not found in your cart.');
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return this.getOrCreateCart(userId);
    }

    if (item.product.stock < quantity) {
      throw AppError.badRequest(
        `Requested quantity (${quantity}) exceeds available inventory (${item.product.stock}).`
      );
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getOrCreateCart(userId);
  }

  static async removeItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw AppError.notFound('Cart not found.');

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) {
      throw AppError.notFound('Cart item not found in your cart.');
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.getOrCreateCart(userId);
  }

  static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { message: 'Cart cleared successfully.' };
  }
}
