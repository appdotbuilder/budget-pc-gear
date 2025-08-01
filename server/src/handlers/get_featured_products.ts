
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type GetFeaturedProductsInput, type Product } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getFeaturedProducts = async (input: GetFeaturedProductsInput): Promise<Product[]> => {
  try {
    const results = await db.select()
      .from(productsTable)
      .where(eq(productsTable.is_featured, true))
      .orderBy(desc(productsTable.created_at))
      .limit(input.limit)
      .execute();

    // Convert numeric fields from string to number
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price)
    }));
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    throw error;
  }
};
