import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { createCategory } from '../handlers/create_category';
import { eq } from 'drizzle-orm';

// Keyboards category input as requested
const keyboardsCategoryInput: CreateCategoryInput = {
  name: 'Keyboards',
  slug: 'keyboards',
  description: null
};

describe('createKeyboardsCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a Keyboards category', async () => {
    const result = await createCategory(keyboardsCategoryInput);

    // Basic field validation
    expect(result.name).toEqual('Keyboards');
    expect(result.slug).toEqual('keyboards');
    expect(result.description).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save Keyboards category to database', async () => {
    const result = await createCategory(keyboardsCategoryInput);

    // Query using proper drizzle syntax
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Keyboards');
    expect(categories[0].slug).toEqual('keyboards');
    expect(categories[0].description).toBeNull();
    expect(categories[0].created_at).toBeInstanceOf(Date);
  });

  it('should create Keyboards category with exact specifications', async () => {
    const result = await createCategory(keyboardsCategoryInput);

    // Verify all exact specifications are met
    expect(result.name).toBe('Keyboards');
    expect(result.slug).toBe('keyboards');
    expect(result.description).toBe(null);
    
    // Verify the category exists in database with correct data
    const savedCategory = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, 'keyboards'))
      .execute();

    expect(savedCategory).toHaveLength(1);
    expect(savedCategory[0].name).toBe('Keyboards');
    expect(savedCategory[0].slug).toBe('keyboards');
    expect(savedCategory[0].description).toBe(null);
  });
});