
import { db } from '../db';
import { reviewsTable } from '../db/schema';
import { type CreateReviewInput, type Review } from '../schema';

export const createReview = async (input: CreateReviewInput): Promise<Review> => {
  try {
    // Insert review record
    const result = await db.insert(reviewsTable)
      .values({
        product_id: input.product_id,
        title: input.title,
        content: input.content,
        rating: input.rating,
        author_name: input.author_name,
        is_verified: input.is_verified
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Review creation failed:', error);
    throw error;
  }
};
