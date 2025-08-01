
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, productsTable } from '../db/schema';
import { type GetProductBySlugInput, type CreateCategoryInput, type CreateProductInput } from '../schema';
import { getProductBySlug } from '../handlers/get_product_by_slug';

// Test category input
const testCategoryInput: CreateCategoryInput = {
  name: 'Electronics',
  slug: 'electronics',
  description: 'Electronic products'
};

// Test product input
const testProductInput: CreateProductInput = {
  name: 'iPhone 15',
  slug: 'iphone-15',
  description: 'Latest iPhone model',
  price: 999.99,
  image_url: 'https://example.com/iphone15.jpg',
  category_id: 1, // Will be set after creating category
  brand: 'Apple',
  model: 'iPhone 15',
  is_featured: true,
  meta_title: 'iPhone 15 - Best Smartphone',
  meta_description: 'Get the latest iPhone 15 with advanced features'
};

describe('getProductBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return product when slug exists', async () => {
    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategoryInput)
      .returning()
      .execute();

    // Create product with the category_id
    const productData = {
      ...testProductInput,
      category_id: categoryResult[0].id,
      price: testProductInput.price.toString() // Convert to string for numeric column
    };

    await db.insert(productsTable)
      .values(productData)
      .execute();

    // Test the handler
    const input: GetProductBySlugInput = { slug: 'iphone-15' };
    const result = await getProductBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('iPhone 15');
    expect(result!.slug).toEqual('iphone-15');
    expect(result!.description).toEqual('Latest iPhone model');
    expect(result!.price).toEqual(999.99);
    expect(typeof result!.price).toEqual('number');
    expect(result!.image_url).toEqual('https://example.com/iphone15.jpg');
    expect(result!.category_id).toEqual(categoryResult[0].id);
    expect(result!.brand).toEqual('Apple');
    expect(result!.model).toEqual('iPhone 15');
    expect(result!.is_featured).toEqual(true);
    expect(result!.meta_title).toEqual('iPhone 15 - Best Smartphone');
    expect(result!.meta_description).toEqual('Get the latest iPhone 15 with advanced features');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when slug does not exist', async () => {
    const input: GetProductBySlugInput = { slug: 'non-existent-product' };
    const result = await getProductBySlug(input);

    expect(result).toBeNull();
  });

  it('should handle products with nullable fields', async () => {
    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategoryInput)
      .returning()
      .execute();

    // Create product with minimal required fields
    const minimalProductData = {
      name: 'Basic Product',
      slug: 'basic-product',
      description: null,
      price: '49.99', // String for numeric column
      image_url: null,
      category_id: categoryResult[0].id,
      brand: null,
      model: null,
      is_featured: false,
      meta_title: null,
      meta_description: null
    };

    await db.insert(productsTable)
      .values(minimalProductData)
      .execute();

    // Test the handler
    const input: GetProductBySlugInput = { slug: 'basic-product' };
    const result = await getProductBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Basic Product');
    expect(result!.slug).toEqual('basic-product');
    expect(result!.description).toBeNull();
    expect(result!.price).toEqual(49.99);
    expect(typeof result!.price).toEqual('number');
    expect(result!.image_url).toBeNull();
    expect(result!.brand).toBeNull();
    expect(result!.model).toBeNull();
    expect(result!.is_featured).toEqual(false);
    expect(result!.meta_title).toBeNull();
    expect(result!.meta_description).toBeNull();
  });
});
