import { z } from 'zod';

export const addToWishlistSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  }),
});
