
import { db } from '../db';
import { reviewsTable } from '../db/schema';
import { type GetProductReviewsInput, type Review } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getProductReviews = async (input: GetProductReviewsInput): Promise<Review[]> => {
  try {
    const results = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.product_id, input.productId))
      .orderBy(desc(reviewsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Get product reviews failed:', error);
    throw error;
  }
};
