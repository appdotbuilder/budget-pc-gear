
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { reviewsTable, categoriesTable, productsTable } from '../db/schema';
import { type CreateReviewInput } from '../schema';
import { createReview } from '../handlers/create_review';
import { eq } from 'drizzle-orm';

describe('createReview', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Test input with all required fields
  const testInput: CreateReviewInput = {
    product_id: 1,
    title: 'Great Product',
    content: 'This product exceeded my expectations. Very high quality and works perfectly.',
    rating: 5,
    author_name: 'John Doe',
    is_verified: true
  };

  // Helper to create prerequisite data
  const createTestProduct = async () => {
    // Create category first
    const category = await db.insert(categoriesTable)
      .values({
        name: 'Test Category',
        slug: 'test-category',
        description: 'A category for testing'
      })
      .returning()
      .execute();

    // Create product
    const product = await db.insert(productsTable)
      .values({
        name: 'Test Product',
        slug: 'test-product',
        description: 'A product for testing',
        price: '19.99',
        category_id: category[0].id,
        is_featured: false
      })
      .returning()
      .execute();

    return product[0];
  };

  it('should create a review', async () => {
    // Create prerequisite product
    const product = await createTestProduct();
    const input = { ...testInput, product_id: product.id };

    const result = await createReview(input);

    // Basic field validation
    expect(result.product_id).toEqual(product.id);
    expect(result.title).toEqual('Great Product');
    expect(result.content).toEqual(testInput.content);
    expect(result.rating).toEqual(5);
    expect(result.author_name).toEqual('John Doe');
    expect(result.is_verified).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save review to database', async () => {
    // Create prerequisite product
    const product = await createTestProduct();
    const input = { ...testInput, product_id: product.id };

    const result = await createReview(input);

    // Query using proper drizzle syntax
    const reviews = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, result.id))
      .execute();

    expect(reviews).toHaveLength(1);
    expect(reviews[0].product_id).toEqual(product.id);
    expect(reviews[0].title).toEqual('Great Product');
    expect(reviews[0].content).toEqual(testInput.content);
    expect(reviews[0].rating).toEqual(5);
    expect(reviews[0].author_name).toEqual('John Doe');
    expect(reviews[0].is_verified).toEqual(true);
    expect(reviews[0].created_at).toBeInstanceOf(Date);
  });

  it('should create review with default is_verified false', async () => {
    const product = await createTestProduct();
    const inputWithDefaults: CreateReviewInput = {
      product_id: product.id,
      title: 'Another Review',
      content: 'This is another review for testing.',
      rating: 4,
      author_name: 'Jane Smith',
      is_verified: false // Explicitly setting false
    };

    const result = await createReview(inputWithDefaults);

    expect(result.is_verified).toEqual(false);
    expect(result.rating).toEqual(4);
    expect(result.author_name).toEqual('Jane Smith');
  });

  it('should throw error for invalid product_id', async () => {
    const invalidInput = { ...testInput, product_id: 99999 };

    await expect(createReview(invalidInput)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('should handle different rating values', async () => {
    const product = await createTestProduct();

    // Test minimum rating
    const minRatingReview = await createReview({
      ...testInput,
      product_id: product.id,
      title: 'Poor Product',
      rating: 1
    });

    expect(minRatingReview.rating).toEqual(1);

    // Test maximum rating
    const maxRatingReview = await createReview({
      ...testInput,
      product_id: product.id,
      title: 'Excellent Product',
      rating: 5
    });

    expect(maxRatingReview.rating).toEqual(5);
  });
});
