
import { db } from '../db';
import { prosConsTable } from '../db/schema';
import { type GetProductReviewsInput, type ProsCons } from '../schema';
import { eq } from 'drizzle-orm';

export const getProductProsCons = async (input: GetProductReviewsInput): Promise<ProsCons[]> => {
  try {
    const results = await db.select()
      .from(prosConsTable)
      .where(eq(prosConsTable.product_id, input.productId))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch product pros/cons:', error);
    throw error;
  }
};
