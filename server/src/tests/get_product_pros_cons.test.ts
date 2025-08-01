
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, productsTable, prosConsTable } from '../db/schema';
import { type GetProductReviewsInput, type CreateCategoryInput, type CreateProductInput, type CreateProsConsInput } from '../schema';
import { getProductProsCons } from '../handlers/get_product_pros_cons';

const testCategory: CreateCategoryInput = {
  name: 'Test Category',
  slug: 'test-category',
  description: 'A test category'
};

const testProduct: CreateProductInput = {
  name: 'Test Product',
  slug: 'test-product',
  description: 'A test product',
  price: 99.99,
  image_url: 'https://example.com/image.jpg',
  category_id: 1,
  brand: 'Test Brand',
  model: 'Test Model',
  is_featured: false,
  meta_title: 'Test Meta Title',
  meta_description: 'Test meta description'
};

const testProsConsInputs: CreateProsConsInput[] = [
  {
    product_id: 1,
    type: 'pro',
    content: 'Excellent build quality'
  },
  {
    product_id: 1,
    type: 'con',
    content: 'Expensive price point'
  },
  {
    product_id: 1,
    type: 'pro',
    content: 'Great customer support'
  }
];

describe('getProductProsCons', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return pros and cons for a product', async () => {
    // Create category first
    await db.insert(categoriesTable)
      .values({
        name: testCategory.name,
        slug: testCategory.slug,
        description: testCategory.description
      })
      .execute();

    // Create product
    await db.insert(productsTable)
      .values({
        name: testProduct.name,
        slug: testProduct.slug,
        description: testProduct.description,
        price: testProduct.price.toString(),
        image_url: testProduct.image_url,
        category_id: testProduct.category_id,
        brand: testProduct.brand,
        model: testProduct.model,
        is_featured: testProduct.is_featured,
        meta_title: testProduct.meta_title,
        meta_description: testProduct.meta_description
      })
      .execute();

    // Create pros and cons
    for (const prosConsInput of testProsConsInputs) {
      await db.insert(prosConsTable)
        .values({
          product_id: prosConsInput.product_id,
          type: prosConsInput.type,
          content: prosConsInput.content
        })
        .execute();
    }

    const input: GetProductReviewsInput = { productId: 1 };
    const result = await getProductProsCons(input);

    expect(result).toHaveLength(3);
    
    // Check pros
    const pros = result.filter(item => item.type === 'pro');
    expect(pros).toHaveLength(2);
    expect(pros.map(p => p.content)).toContain('Excellent build quality');
    expect(pros.map(p => p.content)).toContain('Great customer support');

    // Check cons
    const cons = result.filter(item => item.type === 'con');
    expect(cons).toHaveLength(1);
    expect(cons[0].content).toEqual('Expensive price point');

    // Validate structure of returned items
    result.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.product_id).toEqual(1);
      expect(['pro', 'con']).toContain(item.type);
      expect(item.content).toBeDefined();
      expect(item.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return empty array for product with no pros/cons', async () => {
    // Create category first
    await db.insert(categoriesTable)
      .values({
        name: testCategory.name,
        slug: testCategory.slug,
        description: testCategory.description
      })
      .execute();

    // Create product but no pros/cons
    await db.insert(productsTable)
      .values({
        name: testProduct.name,
        slug: testProduct.slug,
        description: testProduct.description,
        price: testProduct.price.toString(),
        image_url: testProduct.image_url,
        category_id: testProduct.category_id,
        brand: testProduct.brand,
        model: testProduct.model,
        is_featured: testProduct.is_featured,
        meta_title: testProduct.meta_title,
        meta_description: testProduct.meta_description
      })
      .execute();

    const input: GetProductReviewsInput = { productId: 1 };
    const result = await getProductProsCons(input);

    expect(result).toHaveLength(0);
  });

  it('should return empty array for non-existent product', async () => {
    const input: GetProductReviewsInput = { productId: 999 };
    const result = await getProductProsCons(input);

    expect(result).toHaveLength(0);
  });

  it('should only return pros/cons for the specified product', async () => {
    // Create category
    await db.insert(categoriesTable)
      .values({
        name: testCategory.name,
        slug: testCategory.slug,
        description: testCategory.description
      })
      .execute();

    // Create two products
    await db.insert(productsTable)
      .values([
        {
          name: 'Product 1',
          slug: 'product-1',
          description: 'First product',
          price: '99.99',
          category_id: 1,
          is_featured: false
        },
        {
          name: 'Product 2',
          slug: 'product-2',
          description: 'Second product',
          price: '149.99',
          category_id: 1,
          is_featured: false
        }
      ])
      .execute();

    // Create pros/cons for both products
    await db.insert(prosConsTable)
      .values([
        {
          product_id: 1,
          type: 'pro',
          content: 'Product 1 pro'
        },
        {
          product_id: 2,
          type: 'pro',
          content: 'Product 2 pro'
        },
        {
          product_id: 2,
          type: 'con',
          content: 'Product 2 con'
        }
      ])
      .execute();

    // Query for product 1 only
    const input: GetProductReviewsInput = { productId: 1 };
    const result = await getProductProsCons(input);

    expect(result).toHaveLength(1);
    expect(result[0].product_id).toEqual(1);
    expect(result[0].content).toEqual('Product 1 pro');
    expect(result[0].type).toEqual('pro');
  });
});
