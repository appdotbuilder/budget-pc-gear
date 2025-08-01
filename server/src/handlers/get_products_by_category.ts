
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type GetProductsByCategoryInput, type Product } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getProductsByCategory = async (input: GetProductsByCategoryInput): Promise<Product[]> => {
  try {
    // Join products with categories to filter by category slug
    const results = await db.select()
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.category_id, categoriesTable.id))
      .where(eq(categoriesTable.slug, input.categorySlug))
      .orderBy(desc(productsTable.created_at))
      .execute();

    // Map results to Product type with proper numeric conversion
    return results.map(result => ({
      id: result.products.id,
      name: result.products.name,
      slug: result.products.slug,
      description: result.products.description,
      price: parseFloat(result.products.price), // Convert numeric to number
      image_url: result.products.image_url,
      category_id: result.products.category_id,
      brand: result.products.brand,
      model: result.products.model,
      is_featured: result.products.is_featured,
      meta_title: result.products.meta_title,
      meta_description: result.products.meta_description,
      created_at: result.products.created_at,
      updated_at: result.products.updated_at
    }));
  } catch (error) {
    console.error('Failed to get products by category:', error);
    throw error;
  }
};
