
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { createCategory } from '../handlers/create_category';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateCategoryInput = {
  name: 'Gaming Mice',
  slug: 'gaming-mice',
  description: 'High-performance gaming mice for competitive gaming'
};

describe('createCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a category', async () => {
    const result = await createCategory(testInput);

    // Basic field validation
    expect(result.name).toEqual('Gaming Mice');
    expect(result.slug).toEqual('gaming-mice');
    expect(result.description).toEqual(testInput.description);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save category to database', async () => {
    const result = await createCategory(testInput);

    // Query using proper drizzle syntax
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Gaming Mice');
    expect(categories[0].slug).toEqual('gaming-mice');
    expect(categories[0].description).toEqual(testInput.description);
    expect(categories[0].created_at).toBeInstanceOf(Date);
  });

  it('should create category with null description', async () => {
    const inputWithNullDescription: CreateCategoryInput = {
      name: 'Keyboards',
      slug: 'keyboards',
      description: null
    };

    const result = await createCategory(inputWithNullDescription);

    expect(result.name).toEqual('Keyboards');
    expect(result.slug).toEqual('keyboards');
    expect(result.description).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify in database
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories[0].description).toBeNull();
  });

  it('should throw error for duplicate slug', async () => {
    // Create first category
    await createCategory(testInput);

    // Try to create another category with same slug
    const duplicateInput: CreateCategoryInput = {
      name: 'Different Name',
      slug: 'gaming-mice', // Same slug
      description: 'Different description'
    };

    await expect(createCategory(duplicateInput)).rejects.toThrow(/unique/i);
  });
});
