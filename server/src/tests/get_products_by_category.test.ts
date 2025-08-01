
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, productsTable } from '../db/schema';
import { type GetProductsByCategoryInput } from '../schema';
import { getProductsByCategory } from '../handlers/get_products_by_category';

describe('getProductsByCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return products for a valid category slug', async () => {
    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Gaming Mice',
        slug: 'gaming-mice',
        description: 'High-performance gaming mice'
      })
      .returning()
      .execute();
    
    const categoryId = categoryResult[0].id;

    // Create test products individually to ensure different timestamps
    const firstProduct = await db.insert(productsTable)
      .values({
        name: 'Gaming Mouse Pro',
        slug: 'gaming-mouse-pro',
        description: 'Professional gaming mouse',
        price: '89.99',
        category_id: categoryId,
        brand: 'TechBrand',
        model: 'GM-Pro',
        is_featured: true,
        meta_title: 'Gaming Mouse Pro - Best Gaming Mouse',
        meta_description: 'Professional gaming mouse for competitive gaming'
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondProduct = await db.insert(productsTable)
      .values({
        name: 'Basic Gaming Mouse',
        slug: 'basic-gaming-mouse',
        description: 'Entry-level gaming mouse',
        price: '29.99',
        category_id: categoryId,
        brand: 'BudgetTech',
        model: 'BG-Basic',
        is_featured: false,
        meta_title: null,
        meta_description: null
      })
      .returning()
      .execute();

    const input: GetProductsByCategoryInput = {
      categorySlug: 'gaming-mice'
    };

    const result = await getProductsByCategory(input);

    expect(result).toHaveLength(2);
    
    // Verify that both products are returned with correct data
    const productNames = result.map(p => p.name).sort();
    expect(productNames).toEqual(['Basic Gaming Mouse', 'Gaming Mouse Pro']);

    // Find each product in the results
    const gamingMousePro = result.find(p => p.name === 'Gaming Mouse Pro');
    const basicGamingMouse = result.find(p => p.name === 'Basic Gaming Mouse');

    // Verify Gaming Mouse Pro
    expect(gamingMousePro).toBeDefined();
    expect(gamingMousePro!.slug).toEqual('gaming-mouse-pro');
    expect(gamingMousePro!.description).toEqual('Professional gaming mouse');
    expect(gamingMousePro!.price).toEqual(89.99);
    expect(typeof gamingMousePro!.price).toEqual('number');
    expect(gamingMousePro!.category_id).toEqual(categoryId);
    expect(gamingMousePro!.brand).toEqual('TechBrand');
    expect(gamingMousePro!.model).toEqual('GM-Pro');
    expect(gamingMousePro!.is_featured).toEqual(true);
    expect(gamingMousePro!.meta_title).toEqual('Gaming Mouse Pro - Best Gaming Mouse');
    expect(gamingMousePro!.meta_description).toEqual('Professional gaming mouse for competitive gaming');
    expect(gamingMousePro!.id).toBeDefined();
    expect(gamingMousePro!.created_at).toBeInstanceOf(Date);
    expect(gamingMousePro!.updated_at).toBeInstanceOf(Date);

    // Verify Basic Gaming Mouse
    expect(basicGamingMouse).toBeDefined();
    expect(basicGamingMouse!.slug).toEqual('basic-gaming-mouse');
    expect(basicGamingMouse!.description).toEqual('Entry-level gaming mouse');
    expect(basicGamingMouse!.price).toEqual(29.99);
    expect(typeof basicGamingMouse!.price).toEqual('number');
    expect(basicGamingMouse!.category_id).toEqual(categoryId);
    expect(basicGamingMouse!.brand).toEqual('BudgetTech');
    expect(basicGamingMouse!.model).toEqual('BG-Basic');
    expect(basicGamingMouse!.is_featured).toEqual(false);
    expect(basicGamingMouse!.meta_title).toBeNull();
    expect(basicGamingMouse!.meta_description).toBeNull();
    expect(basicGamingMouse!.id).toBeDefined();
    expect(basicGamingMouse!.created_at).toBeInstanceOf(Date);
    expect(basicGamingMouse!.updated_at).toBeInstanceOf(Date);

    // Verify ordering: second product should be first (most recent)
    expect(result[0].name).toEqual('Basic Gaming Mouse');
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
  });

  it('should return empty array for non-existent category slug', async () => {
    const input: GetProductsByCategoryInput = {
      categorySlug: 'non-existent-category'
    };

    const result = await getProductsByCategory(input);

    expect(result).toHaveLength(0);
  });

  it('should return empty array for category with no products', async () => {
    // Create category but no products
    await db.insert(categoriesTable)
      .values({
        name: 'Empty Category',
        slug: 'empty-category',
        description: 'A category with no products'
      })
      .execute();

    const input: GetProductsByCategoryInput = {
      categorySlug: 'empty-category'
    };

    const result = await getProductsByCategory(input);

    expect(result).toHaveLength(0);
  });

  it('should return products ordered by created_at descending', async () => {
    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category'
      })
      .returning()
      .execute();
    
    const categoryId = categoryResult[0].id;

    // Create products with delay to ensure different timestamps
    const firstProduct = await db.insert(productsTable)
      .values({
        name: 'First Product',
        slug: 'first-product',
        description: 'First product created',
        price: '19.99',
        category_id: categoryId,
        is_featured: false
      })
      .returning()
      .execute();

    // Delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondProduct = await db.insert(productsTable)
      .values({
        name: 'Second Product',
        slug: 'second-product',
        description: 'Second product created',
        price: '39.99',
        category_id: categoryId,
        is_featured: false
      })
      .returning()
      .execute();

    const input: GetProductsByCategoryInput = {
      categorySlug: 'test-category'
    };

    const result = await getProductsByCategory(input);

    expect(result).toHaveLength(2);
    // Most recently created should be first (descending order)
    expect(result[0].name).toEqual('Second Product');
    expect(result[1].name).toEqual('First Product');
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
  });
});
