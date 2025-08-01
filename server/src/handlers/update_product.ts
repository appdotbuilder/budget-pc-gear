
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type UpdateProductInput, type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProduct = async (input: UpdateProductInput): Promise<Product> => {
  try {
    // Build update data object with only defined fields
    const updateData: any = {};
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.price !== undefined) updateData.price = input.price.toString(); // Convert number to string for numeric column
    if (input.image_url !== undefined) updateData.image_url = input.image_url;
    if (input.category_id !== undefined) updateData.category_id = input.category_id;
    if (input.brand !== undefined) updateData.brand = input.brand;
    if (input.model !== undefined) updateData.model = input.model;
    if (input.is_featured !== undefined) updateData.is_featured = input.is_featured;
    if (input.meta_title !== undefined) updateData.meta_title = input.meta_title;
    if (input.meta_description !== undefined) updateData.meta_description = input.meta_description;
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update product record
    const result = await db.update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Product with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const product = result[0];
    return {
      ...product,
      price: parseFloat(product.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Product update failed:', error);
    throw error;
  }
};
