
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type Product } from '../schema';
import { desc } from 'drizzle-orm';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const result = await db.select()
      .from(productsTable)
      .orderBy(desc(productsTable.created_at))
      .execute();

    // Convert numeric fields back to numbers before returning
    return result.map(product => ({
      ...product,
      price: parseFloat(product.price) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};
