
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { getCategories } from '../handlers/get_categories';

const testCategory1: CreateCategoryInput = {
  name: 'Electronics',
  slug: 'electronics',
  description: 'Electronic devices and gadgets'
};

const testCategory2: CreateCategoryInput = {
  name: 'Home & Garden',
  slug: 'home-garden',
  description: 'Home improvement and gardening supplies'
};

const testCategory3: CreateCategoryInput = {
  name: 'Sports',
  slug: 'sports',
  description: null
};

describe('getCategories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no categories exist', async () => {
    const result = await getCategories();
    
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all categories', async () => {
    // Create test categories
    await db.insert(categoriesTable)
      .values([testCategory1, testCategory2, testCategory3])
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(3);
    
    // Verify all expected categories are returned
    const categoryNames = result.map(cat => cat.name);
    expect(categoryNames).toContain('Electronics');
    expect(categoryNames).toContain('Home & Garden');
    expect(categoryNames).toContain('Sports');
  });

  it('should return categories with correct structure', async () => {
    // Create a single test category
    await db.insert(categoriesTable)
      .values(testCategory1)
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(1);
    const category = result[0];

    // Verify category structure
    expect(category.id).toBeDefined();
    expect(typeof category.id).toBe('number');
    expect(category.name).toEqual('Electronics');
    expect(category.slug).toEqual('electronics');
    expect(category.description).toEqual('Electronic devices and gadgets');
    expect(category.created_at).toBeInstanceOf(Date);
  });

  it('should handle categories with null descriptions', async () => {
    // Create category with null description
    await db.insert(categoriesTable)
      .values(testCategory3)
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(1);
    const category = result[0];

    expect(category.name).toEqual('Sports');
    expect(category.slug).toEqual('sports');
    expect(category.description).toBeNull();
  });
});
