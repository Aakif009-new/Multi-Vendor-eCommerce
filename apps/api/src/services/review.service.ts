import { prisma } from '../config/db';
import { AppError } from '../utils/appError';

export class ReviewService {
  /**
   * Submit Review: Validates delivered order purchase eligibility and updates product rating
   */
  static async createReview(
    userId: string,
    data: {
      orderItemId: string;
      rating: number;
      comment?: string;
    }
  ) {
    const { orderItemId, rating, comment } = data;

    // 1. Rating validation
    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be an integer between 1 and 5', 400);
    }

    // 2. Verified Purchase Eligibility Verification
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      throw new AppError('Associated order item not found', 404);
    }

    if (orderItem.order.userId !== userId) {
      throw new AppError('Unauthorized: You can only review products from your own purchases', 403);
    }

    if (orderItem.status !== 'DELIVERED') {
      throw new AppError(
        `Reviews are only permitted for delivered items. Current item status: ${orderItem.status}`,
        400
      );
    }

    // 3. Duplicate Review Prevention
    const existingReview = await prisma.review.findUnique({
      where: { orderItemId },
    });

    if (existingReview) {
      throw new AppError('You have already submitted a review for this purchased item', 400);
    }

    // 4. Create Review Record
    const review = await prisma.review.create({
      data: {
        userId,
        productId: orderItem.productId,
        orderItemId,
        rating,
        comment: comment?.trim() || null,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    // 5. Recalculate Aggregate Product Rating & Review Count
    const allReviews = await prisma.review.findMany({
      where: { productId: orderItem.productId },
      select: { rating: true },
    });

    const numReviews = allReviews.length;
    const avgRating =
      numReviews > 0
        ? allReviews.reduce((acc, r) => acc + r.rating, 0) / numReviews
        : 0;

    await prisma.product.update({
      where: { id: orderItem.productId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        numReviews,
      },
    });

    return review;
  }

  /**
   * List Verified Reviews for a Product
   */
  static async getProductReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
