
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type GetProductBySlugInput, type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const getProductBySlug = async (input: GetProductBySlugInput): Promise<Product | null> => {
  try {
    const result = await db.select()
      .from(productsTable)
      .where(eq(productsTable.slug, input.slug))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const product = result[0];
    return {
      ...product,
      price: parseFloat(product.price) // Convert numeric field back to number
    };
  } catch (error) {
    console.error('Get product by slug failed:', error);
    throw error;
  }
};
