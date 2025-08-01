
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput, type Product } from '../schema';

export const createProduct = async (input: CreateProductInput): Promise<Product> => {
  try {
    // Insert product record
    const result = await db.insert(productsTable)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: input.price.toString(), // Convert number to string for numeric column
        image_url: input.image_url,
        category_id: input.category_id,
        brand: input.brand,
        model: input.model,
        is_featured: input.is_featured,
        meta_title: input.meta_title,
        meta_description: input.meta_description
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const product = result[0];
    return {
      ...product,
      price: parseFloat(product.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Product creation failed:', error);
    throw error;
  }
};
