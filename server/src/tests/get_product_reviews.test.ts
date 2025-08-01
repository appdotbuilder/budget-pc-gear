
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, productsTable, reviewsTable } from '../db/schema';
import { type GetProductReviewsInput, type CreateCategoryInput, type CreateProductInput, type CreateReviewInput } from '../schema';
import { getProductReviews } from '../handlers/get_product_reviews';

const testCategory: CreateCategoryInput = {
  name: 'Test Category',
  slug: 'test-category',
  description: 'A category for testing'
};

const testProduct: CreateProductInput = {
  name: 'Test Product',
  slug: 'test-product',
  description: 'A product for testing',
  price: 99.99,
  image_url: 'https://example.com/image.jpg',
  category_id: 1, // Will be set after category creation
  brand: 'Test Brand',
  model: 'Test Model',
  is_featured: false,
  meta_title: 'Test Product Meta Title',
  meta_description: 'Test Product Meta Description'
};

const testReview1: CreateReviewInput = {
  product_id: 1, // Will be set after product creation
  title: 'Great product!',
  content: 'This product exceeded my expectations.',
  rating: 5,
  author_name: 'John Doe',
  is_verified: true
};

const testReview2: CreateReviewInput = {
  product_id: 1, // Will be set after product creation
  title: 'Good value',
  content: 'Decent product for the price.',
  rating: 4,
  author_name: 'Jane Smith',
  is_verified: false
};

describe('getProductReviews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no reviews exist', async () => {
    // Create category and product first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        ...testProduct,
        category_id: categoryResult[0].id,
        price: testProduct.price.toString()
      })
      .returning()
      .execute();

    const input: GetProductReviewsInput = {
      productId: productResult[0].id
    };

    const result = await getProductReviews(input);

    expect(result).toEqual([]);
  });

  it('should return reviews for a specific product', async () => {
    // Create category and product first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        ...testProduct,
        category_id: categoryResult[0].id,
        price: testProduct.price.toString()
      })
      .returning()
      .execute();

    // Create reviews for the product
    await db.insert(reviewsTable)
      .values([
        {
          ...testReview1,
          product_id: productResult[0].id
        },
        {
          ...testReview2,
          product_id: productResult[0].id
        }
      ])
      .execute();

    const input: GetProductReviewsInput = {
      productId: productResult[0].id
    };

    const result = await getProductReviews(input);

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Great product!');
    expect(result[0].content).toEqual('This product exceeded my expectations.');
    expect(result[0].rating).toEqual(5);
    expect(result[0].author_name).toEqual('John Doe');
    expect(result[0].is_verified).toEqual(true);
    expect(result[0].product_id).toEqual(productResult[0].id);
    expect(result[0].created_at).toBeInstanceOf(Date);

    expect(result[1].title).toEqual('Good value');
    expect(result[1].content).toEqual('Decent product for the price.');
    expect(result[1].rating).toEqual(4);
    expect(result[1].author_name).toEqual('Jane Smith');
    expect(result[1].is_verified).toEqual(false);
    expect(result[1].product_id).toEqual(productResult[0].id);
  });

  it('should return reviews ordered by created_at descending', async () => {
    // Create category and product first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        ...testProduct,
        category_id: categoryResult[0].id,
        price: testProduct.price.toString()
      })
      .returning()
      .execute();

    // Create first review
    const firstReview = await db.insert(reviewsTable)
      .values({
        ...testReview1,
        product_id: productResult[0].id
      })
      .returning()
      .execute();

    // Wait a small amount to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second review (should be newer)
    const secondReview = await db.insert(reviewsTable)
      .values({
        ...testReview2,
        product_id: productResult[0].id
      })
      .returning()
      .execute();

    const input: GetProductReviewsInput = {
      productId: productResult[0].id
    };

    const result = await getProductReviews(input);

    expect(result).toHaveLength(2);
    // Newer review should come first (descending order)
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should not return reviews for different products', async () => {
    // Create category first
    const categoryResult = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();

    // Create two products
    const product1Result = await db.insert(productsTable)
      .values({
        ...testProduct,
        category_id: categoryResult[0].id,
        price: testProduct.price.toString()
      })
      .returning()
      .execute();

    const product2Result = await db.insert(productsTable)
      .values({
        ...testProduct,
        name: 'Another Product',
        slug: 'another-product',
        category_id: categoryResult[0].id,
        price: testProduct.price.toString()
      })
      .returning()
      .execute();

    // Create review for product 1
    await db.insert(reviewsTable)
      .values({
        ...testReview1,
        product_id: product1Result[0].id
      })
      .execute();

    // Create review for product 2
    await db.insert(reviewsTable)
      .values({
        ...testReview2,
        product_id: product2Result[0].id
      })
      .execute();

    // Query reviews for product 1
    const input: GetProductReviewsInput = {
      productId: product1Result[0].id
    };

    const result = await getProductReviews(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Great product!');
    expect(result[0].product_id).toEqual(product1Result[0].id);
  });
});
