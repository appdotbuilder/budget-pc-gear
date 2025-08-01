
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, productsTable } from '../db/schema';
import { getProducts } from '../handlers/get_products';
import { type CreateCategoryInput, type CreateProductInput } from '../schema';

// Test data setup
const testCategory: CreateCategoryInput = {
  name: 'Gaming Accessories',
  slug: 'gaming-accessories',
  description: 'Accessories for gaming'
};

const testProduct1: CreateProductInput = {
  name: 'Gaming Keyboard',
  slug: 'gaming-keyboard',
  description: 'Mechanical gaming keyboard',
  price: 99.99,
  image_url: 'https://example.com/keyboard.jpg',
  category_id: 1,
  brand: 'Razer',
  model: 'BlackWidow',
  is_featured: true,
  meta_title: 'Best Gaming Keyboard',
  meta_description: 'Top-rated mechanical gaming keyboard'
};

const testProduct2: CreateProductInput = {
  name: 'Gaming Mouse',
  slug: 'gaming-mouse',
  description: 'High precision gaming mouse',
  price: 59.99,
  image_url: 'https://example.com/mouse.jpg',
  category_id: 1,
  brand: 'Logitech',
  model: 'G502',
  is_featured: false,
  meta_title: 'Gaming Mouse',
  meta_description: 'Precision gaming mouse'
};

describe('getProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const result = await getProducts();
    expect(result).toEqual([]);
  });

  it('should return all products', async () => {
    // Create category first
    await db.insert(categoriesTable)
      .values({
        name: testCategory.name,
        slug: testCategory.slug,
        description: testCategory.description
      })
      .execute();

    // Create test products
    await db.insert(productsTable)
      .values([
        {
          name: testProduct1.name,
          slug: testProduct1.slug,
          description: testProduct1.description,
          price: testProduct1.price.toString(),
          image_url: testProduct1.image_url,
          category_id: testProduct1.category_id,
          brand: testProduct1.brand,
          model: testProduct1.model,
          is_featured: testProduct1.is_featured,
          meta_title: testProduct1.meta_title,
          meta_description: testProduct1.meta_description
        },
        {
          name: testProduct2.name,
          slug: testProduct2.slug,
          description: testProduct2.description,
          price: testProduct2.price.toString(),
          image_url: testProduct2.image_url,
          category_id: testProduct2.category_id,
          brand: testProduct2.brand,
          model: testProduct2.model,
          is_featured: testProduct2.is_featured,
          meta_title: testProduct2.meta_title,
          meta_description: testProduct2.meta_description
        }
      ])
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(2);
    
    // Check that numeric conversion is working
    result.forEach(product => {
      expect(typeof product.price).toBe('number');
    });

    // Check specific product data
    const keyboard = result.find(p => p.slug === 'gaming-keyboard');
    expect(keyboard).toBeDefined();
    expect(keyboard!.name).toEqual('Gaming Keyboard');
    expect(keyboard!.price).toEqual(99.99);
    expect(keyboard!.brand).toEqual('Razer');
    expect(keyboard!.is_featured).toBe(true);

    const mouse = result.find(p => p.slug === 'gaming-mouse');
    expect(mouse).toBeDefined();
    expect(mouse!.name).toEqual('Gaming Mouse');
    expect(mouse!.price).toEqual(59.99);
    expect(mouse!.brand).toEqual('Logitech');
    expect(mouse!.is_featured).toBe(false);
  });

  it('should return products ordered by created_at descending', async () => {
    // Create category first
    await db.insert(categoriesTable)
      .values({
        name: testCategory.name,
        slug: testCategory.slug,
        description: testCategory.description
      })
      .execute();

    // Create first product
    await db.insert(productsTable)
      .values({
        name: testProduct1.name,
        slug: testProduct1.slug,
        description: testProduct1.description,
        price: testProduct1.price.toString(),
        image_url: testProduct1.image_url,
        category_id: testProduct1.category_id,
        brand: testProduct1.brand,
        model: testProduct1.model,
        is_featured: testProduct1.is_featured,
        meta_title: testProduct1.meta_title,
        meta_description: testProduct1.meta_description
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second product (should be newer)
    await db.insert(productsTable)
      .values({
        name: testProduct2.name,
        slug: testProduct2.slug,
        description: testProduct2.description,
        price: testProduct2.price.toString(),
        image_url: testProduct2.image_url,
        category_id: testProduct2.category_id,
        brand: testProduct2.brand,
        model: testProduct2.model,
        is_featured: testProduct2.is_featured,
        meta_title: testProduct2.meta_title,
        meta_description: testProduct2.meta_description
      })
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(2);
    // Mouse should be first (newer), keyboard second (older)
    expect(result[0].slug).toEqual('gaming-mouse');
    expect(result[1].slug).toEqual('gaming-keyboard');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle products with null optional fields', async () => {
    // Create category first
    await db.insert(categoriesTable)
      .values({
        name: testCategory.name,
        slug: testCategory.slug,
        description: null
      })
      .execute();

    // Create product with minimal data
    await db.insert(productsTable)
      .values({
        name: 'Basic Product',
        slug: 'basic-product',
        description: null,
        price: '29.99',
        image_url: null,
        category_id: 1,
        brand: null,
        model: null,
        is_featured: false,
        meta_title: null,
        meta_description: null
      })
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Basic Product');
    expect(result[0].price).toEqual(29.99);
    expect(result[0].description).toBeNull();
    expect(result[0].image_url).toBeNull();
    expect(result[0].brand).toBeNull();
    expect(result[0].model).toBeNull();
    expect(result[0].meta_title).toBeNull();
    expect(result[0].meta_description).toBeNull();
  });
});
