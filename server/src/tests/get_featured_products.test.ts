
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, productsTable } from '../db/schema';
import { type GetFeaturedProductsInput } from '../schema';
import { getFeaturedProducts } from '../handlers/get_featured_products';

describe('getFeaturedProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return featured products only', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products'
      })
      .returning()
      .execute();
    
    const categoryId = categoryResult[0].id;

    // Create featured and non-featured products
    await db.insert(productsTable)
      .values([
        {
          name: 'Featured Product 1',
          slug: 'featured-product-1',
          description: 'A featured product',
          price: '199.99',
          category_id: categoryId,
          is_featured: true
        },
        {
          name: 'Regular Product',
          slug: 'regular-product',
          description: 'A regular product',
          price: '99.99',
          category_id: categoryId,
          is_featured: false
        },
        {
          name: 'Featured Product 2',
          slug: 'featured-product-2',
          description: 'Another featured product',
          price: '299.99',
          category_id: categoryId,
          is_featured: true
        }
      ])
      .execute();

    const input: GetFeaturedProductsInput = { limit: 10 };
    const result = await getFeaturedProducts(input);

    expect(result).toHaveLength(2);
    expect(result.every(product => product.is_featured)).toBe(true);
    expect(result.map(p => p.name)).toContain('Featured Product 1');
    expect(result.map(p => p.name)).toContain('Featured Product 2');
    expect(result.map(p => p.name)).not.toContain('Regular Product');
  });

  it('should respect the limit parameter', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products'
      })
      .returning()
      .execute();
    
    const categoryId = categoryResult[0].id;

    // Create multiple featured products
    await db.insert(productsTable)
      .values([
        {
          name: 'Featured Product 1',
          slug: 'featured-product-1',
          description: 'Product 1',
          price: '100.00',
          category_id: categoryId,
          is_featured: true
        },
        {
          name: 'Featured Product 2',
          slug: 'featured-product-2',
          description: 'Product 2',
          price: '200.00',
          category_id: categoryId,
          is_featured: true
        },
        {
          name: 'Featured Product 3',
          slug: 'featured-product-3',
          description: 'Product 3',
          price: '300.00',
          category_id: categoryId,
          is_featured: true
        }
      ])
      .execute();

    const input: GetFeaturedProductsInput = { limit: 2 };
    const result = await getFeaturedProducts(input);

    expect(result).toHaveLength(2);
    expect(result.every(product => product.is_featured)).toBe(true);
  });

  it('should return products ordered by creation date descending', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products'
      })
      .returning()
      .execute();
    
    const categoryId = categoryResult[0].id;

    // Create featured products with slight delays to ensure different timestamps
    const product1 = await db.insert(productsTable)
      .values({
        name: 'First Product',
        slug: 'first-product',
        description: 'First product',
        price: '100.00',
        category_id: categoryId,
        is_featured: true
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const product2 = await db.insert(productsTable)
      .values({
        name: 'Second Product',
        slug: 'second-product',
        description: 'Second product',
        price: '200.00',
        category_id: categoryId,
        is_featured: true
      })
      .returning()
      .execute();

    const input: GetFeaturedProductsInput = { limit: 10 };
    const result = await getFeaturedProducts(input);

    expect(result).toHaveLength(2);
    // More recent product should come first
    expect(result[0].name).toBe('Second Product');
    expect(result[1].name).toBe('First Product');
  });

  it('should convert numeric price fields correctly', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products'
      })
      .returning()
      .execute();
    
    const categoryId = categoryResult[0].id;

    // Create a featured product
    await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: '199.99',
        category_id: categoryId,
        is_featured: true
      })
      .execute();

    const input: GetFeaturedProductsInput = { limit: 10 };
    const result = await getFeaturedProducts(input);

    expect(result).toHaveLength(1);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].price).toBe(199.99);
  });

  it('should return empty array when no featured products exist', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products'
      })
      .returning()
      .execute();
    
    const categoryId = categoryResult[0].id;

    // Create only non-featured products
    await db.insert(productsTable)
      .values({
        name: 'Regular Product',
        slug: 'regular-product',
        description: 'A regular product',
        price: '99.99',
        category_id: categoryId,
        is_featured: false
      })
      .execute();

    const input: GetFeaturedProductsInput = { limit: 10 };
    const result = await getFeaturedProducts(input);

    expect(result).toHaveLength(0);
  });
});
