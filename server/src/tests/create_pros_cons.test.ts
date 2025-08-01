
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { prosConsTable, categoriesTable, productsTable } from '../db/schema';
import { type CreateProsConsInput } from '../schema';
import { createProsCons } from '../handlers/create_pros_cons';
import { eq } from 'drizzle-orm';

describe('createProsCons', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testProductId: number;

  beforeEach(async () => {
    // Create test category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Gaming Keyboards',
        slug: 'gaming-keyboards',
        description: 'Mechanical keyboards for gaming'
      })
      .returning()
      .execute();

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        name: 'Test Gaming Keyboard',
        slug: 'test-gaming-keyboard',
        description: 'A keyboard for testing',
        price: '99.99',
        category_id: categoryResult[0].id,
        brand: 'TestBrand',
        model: 'TK-100',
        is_featured: false,
        meta_title: 'Test Keyboard',
        meta_description: 'Best keyboard for testing'
      })
      .returning()
      .execute();

    testProductId = productResult[0].id;
  });

  it('should create a pro entry', async () => {
    const testInput: CreateProsConsInput = {
      product_id: testProductId,
      type: 'pro',
      content: 'Excellent build quality with mechanical switches'
    };

    const result = await createProsCons(testInput);

    expect(result.product_id).toEqual(testProductId);
    expect(result.type).toEqual('pro');
    expect(result.content).toEqual('Excellent build quality with mechanical switches');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a con entry', async () => {
    const testInput: CreateProsConsInput = {
      product_id: testProductId,
      type: 'con',
      content: 'Can be quite loud during gaming sessions'
    };

    const result = await createProsCons(testInput);

    expect(result.product_id).toEqual(testProductId);
    expect(result.type).toEqual('con');
    expect(result.content).toEqual('Can be quite loud during gaming sessions');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save pros/cons to database', async () => {
    const testInput: CreateProsConsInput = {
      product_id: testProductId,
      type: 'pro',
      content: 'Great RGB lighting effects'
    };

    const result = await createProsCons(testInput);

    const prosConsEntries = await db.select()
      .from(prosConsTable)
      .where(eq(prosConsTable.id, result.id))
      .execute();

    expect(prosConsEntries).toHaveLength(1);
    expect(prosConsEntries[0].product_id).toEqual(testProductId);
    expect(prosConsEntries[0].type).toEqual('pro');
    expect(prosConsEntries[0].content).toEqual('Great RGB lighting effects');
    expect(prosConsEntries[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent product', async () => {
    const testInput: CreateProsConsInput = {
      product_id: 99999, // Non-existent product ID
      type: 'pro',
      content: 'This should fail'
    };

    await expect(createProsCons(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
