
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, productsTable } from '../db/schema';
import { type CreateCategoryInput, type CreateProductInput, type UpdateProductInput } from '../schema';
import { updateProduct } from '../handlers/update_product';
import { eq } from 'drizzle-orm';

// Test category for product creation
const testCategory: CreateCategoryInput = {
  name: 'Test Category',
  slug: 'test-category',
  description: 'A test category'
};

// Test product for updating
const testProduct: CreateProductInput = {
  name: 'Original Product',
  slug: 'original-product',
  description: 'Original description',
  price: 99.99,
  image_url: 'https://example.com/original.jpg',
  category_id: 1, // Will be set after category creation
  brand: 'Original Brand',
  model: 'Original Model',
  is_featured: false,
  meta_title: 'Original Meta Title',
  meta_description: 'Original meta description'
};

describe('updateProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a product with all fields', async () => {
    // Create category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create product
    const productResult = await db.insert(productsTable)
      .values({
        ...testProduct,
        price: testProduct.price.toString(),
        category_id: categoryId
      })
      .returning()
      .execute();
    const productId = productResult[0].id;

    // Update product
    const updateInput: UpdateProductInput = {
      id: productId,
      name: 'Updated Product',
      slug: 'updated-product',
      description: 'Updated description',
      price: 149.99,
      image_url: 'https://example.com/updated.jpg',
      category_id: categoryId,
      brand: 'Updated Brand',
      model: 'Updated Model',
      is_featured: true,
      meta_title: 'Updated Meta Title',
      meta_description: 'Updated meta description'
    };

    const result = await updateProduct(updateInput);

    // Verify all fields are updated
    expect(result.id).toEqual(productId);
    expect(result.name).toEqual('Updated Product');
    expect(result.slug).toEqual('updated-product');
    expect(result.description).toEqual('Updated description');
    expect(result.price).toEqual(149.99);
    expect(result.image_url).toEqual('https://example.com/updated.jpg');
    expect(result.category_id).toEqual(categoryId);
    expect(result.brand).toEqual('Updated Brand');
    expect(result.model).toEqual('Updated Model');
    expect(result.is_featured).toEqual(true);
    expect(result.meta_title).toEqual('Updated Meta Title');
    expect(result.meta_description).toEqual('Updated meta description');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    // Create category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create product
    const productResult = await db.insert(productsTable)
      .values({
        ...testProduct,
        price: testProduct.price.toString(),
        category_id: categoryId
      })
      .returning()
      .execute();
    const productId = productResult[0].id;

    // Update only name and price
    const updateInput: UpdateProductInput = {
      id: productId,
      name: 'Partially Updated Product',
      price: 199.99
    };

    const result = await updateProduct(updateInput);

    // Verify only specified fields are updated
    expect(result.name).toEqual('Partially Updated Product');
    expect(result.price).toEqual(199.99);
    
    // Verify other fields remain unchanged
    expect(result.slug).toEqual('original-product');
    expect(result.description).toEqual('Original description');
    expect(result.brand).toEqual('Original Brand');
    expect(result.model).toEqual('Original Model');
    expect(result.is_featured).toEqual(false);
  });

  it('should save updated product to database', async () => {
    // Create category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create product
    const productResult = await db.insert(productsTable)
      .values({
        ...testProduct,
        price: testProduct.price.toString(),
        category_id: categoryId
      })
      .returning()
      .execute();
    const productId = productResult[0].id;

    // Update product
    const updateInput: UpdateProductInput = {
      id: productId,
      name: 'Database Updated Product',
      price: 299.99
    };

    await updateProduct(updateInput);

    // Query database to verify changes were saved
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].name).toEqual('Database Updated Product');
    expect(parseFloat(products[0].price)).toEqual(299.99);
    expect(products[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null values in optional fields', async () => {
    // Create category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create product
    const productResult = await db.insert(productsTable)
      .values({
        ...testProduct,
        price: testProduct.price.toString(),
        category_id: categoryId
      })
      .returning()
      .execute();
    const productId = productResult[0].id;

    // Update with null values
    const updateInput: UpdateProductInput = {
      id: productId,
      description: null,
      image_url: null,
      brand: null,
      model: null,
      meta_title: null,
      meta_description: null
    };

    const result = await updateProduct(updateInput);

    expect(result.description).toBeNull();
    expect(result.image_url).toBeNull();
    expect(result.brand).toBeNull();
    expect(result.model).toBeNull();
    expect(result.meta_title).toBeNull();
    expect(result.meta_description).toBeNull();
  });

  it('should throw error when product does not exist', async () => {
    const updateInput: UpdateProductInput = {
      id: 99999, // Non-existent product ID
      name: 'Updated Product'
    };

    expect(updateProduct(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should update updated_at timestamp', async () => {
    // Create category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    // Create product
    const productResult = await db.insert(productsTable)
      .values({
        ...testProduct,
        price: testProduct.price.toString(),
        category_id: categoryId
      })
      .returning()
      .execute();
    const productId = productResult[0].id;
    const originalUpdatedAt = productResult[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update product
    const updateInput: UpdateProductInput = {
      id: productId,
      name: 'Timestamp Test Product'
    };

    const result = await updateProduct(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});
