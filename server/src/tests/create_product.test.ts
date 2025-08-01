
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test category
  const createTestCategory = async () => {
    const result = await db.insert(categoriesTable)
      .values({
        name: 'Gaming Accessories',
        slug: 'gaming-accessories',
        description: 'Accessories for gaming'
      })
      .returning()
      .execute();
    return result[0];
  };

  it('should create a product with all fields', async () => {
    const category = await createTestCategory();

    const testInput: CreateProductInput = {
      name: 'Gaming Headset Pro',
      slug: 'gaming-headset-pro',
      description: 'Professional gaming headset with surround sound',
      price: 149.99,
      image_url: 'https://example.com/headset.jpg',
      category_id: category.id,
      brand: 'GameTech',
      model: 'GT-H1000',
      is_featured: true,
      meta_title: 'Best Gaming Headset - GameTech GT-H1000',
      meta_description: 'Professional gaming headset with crystal clear audio'
    };

    const result = await createProduct(testInput);

    // Verify all fields are correctly set
    expect(result.name).toEqual('Gaming Headset Pro');
    expect(result.slug).toEqual('gaming-headset-pro');
    expect(result.description).toEqual('Professional gaming headset with surround sound');
    expect(result.price).toEqual(149.99);
    expect(typeof result.price).toBe('number');
    expect(result.image_url).toEqual('https://example.com/headset.jpg');
    expect(result.category_id).toEqual(category.id);
    expect(result.brand).toEqual('GameTech');
    expect(result.model).toEqual('GT-H1000');
    expect(result.is_featured).toEqual(true);
    expect(result.meta_title).toEqual('Best Gaming Headset - GameTech GT-H1000');
    expect(result.meta_description).toEqual('Professional gaming headset with crystal clear audio');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a product with minimal required fields', async () => {
    const category = await createTestCategory();

    const testInput: CreateProductInput = {
      name: 'Simple Keyboard',
      slug: 'simple-keyboard',
      description: null,
      price: 29.99,
      image_url: null,
      category_id: category.id,
      brand: null,
      model: null,
      is_featured: false,
      meta_title: null,
      meta_description: null
    };

    const result = await createProduct(testInput);

    expect(result.name).toEqual('Simple Keyboard');
    expect(result.slug).toEqual('simple-keyboard');
    expect(result.description).toBeNull();
    expect(result.price).toEqual(29.99);
    expect(typeof result.price).toBe('number');
    expect(result.image_url).toBeNull();
    expect(result.category_id).toEqual(category.id);
    expect(result.brand).toBeNull();
    expect(result.model).toBeNull();
    expect(result.is_featured).toEqual(false);
    expect(result.meta_title).toBeNull();
    expect(result.meta_description).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save product to database correctly', async () => {
    const category = await createTestCategory();

    const testInput: CreateProductInput = {
      name: 'Gaming Mouse',
      slug: 'gaming-mouse',
      description: 'High precision gaming mouse',
      price: 79.99,
      image_url: 'https://example.com/mouse.jpg',
      category_id: category.id,
      brand: 'MouseTech',
      model: 'MT-G500',
      is_featured: false,
      meta_title: 'Gaming Mouse - MouseTech MT-G500',
      meta_description: 'High precision gaming mouse for competitive gaming'
    };

    const result = await createProduct(testInput);

    // Query the database to verify the product was saved correctly
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    const savedProduct = products[0];
    
    expect(savedProduct.name).toEqual('Gaming Mouse');
    expect(savedProduct.slug).toEqual('gaming-mouse');
    expect(savedProduct.description).toEqual('High precision gaming mouse');
    expect(parseFloat(savedProduct.price)).toEqual(79.99);
    expect(savedProduct.image_url).toEqual('https://example.com/mouse.jpg');
    expect(savedProduct.category_id).toEqual(category.id);
    expect(savedProduct.brand).toEqual('MouseTech');
    expect(savedProduct.model).toEqual('MT-G500');
    expect(savedProduct.is_featured).toEqual(false);
    expect(savedProduct.meta_title).toEqual('Gaming Mouse - MouseTech MT-G500');
    expect(savedProduct.meta_description).toEqual('High precision gaming mouse for competitive gaming');
    expect(savedProduct.created_at).toBeInstanceOf(Date);
    expect(savedProduct.updated_at).toBeInstanceOf(Date);
  });

  it('should handle foreign key constraint violation', async () => {
    const testInput: CreateProductInput = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product',
      price: 99.99,
      image_url: null,
      category_id: 999, // Non-existent category ID
      brand: null,
      model: null,
      is_featured: false,
      meta_title: null,
      meta_description: null
    };

    await expect(createProduct(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('should handle unique constraint violation for slug', async () => {
    const category = await createTestCategory();

    const testInput: CreateProductInput = {
      name: 'First Product',
      slug: 'duplicate-slug',
      description: 'First product with this slug',
      price: 50.00,
      image_url: null,
      category_id: category.id,
      brand: null,
      model: null,
      is_featured: false,
      meta_title: null,
      meta_description: null
    };

    // Create first product
    await createProduct(testInput);

    // Try to create second product with same slug
    const duplicateInput: CreateProductInput = {
      ...testInput,
      name: 'Second Product'
    };

    await expect(createProduct(duplicateInput)).rejects.toThrow(/duplicate key value violates unique constraint/i);
  });
});
