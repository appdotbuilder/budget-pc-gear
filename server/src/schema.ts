
import { z } from 'zod';

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  image_url: z.string().nullable(),
  category_id: z.number(),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  is_featured: z.boolean(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Review schema
export const reviewSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  title: z.string(),
  content: z.string(),
  rating: z.number(),
  author_name: z.string(),
  is_verified: z.boolean(),
  created_at: z.coerce.date()
});

export type Review = z.infer<typeof reviewSchema>;

// Pros/Cons schema
export const prosConsSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  type: z.enum(['pro', 'con']),
  content: z.string(),
  created_at: z.coerce.date()
});

export type ProsCons = z.infer<typeof prosConsSchema>;

// Input schemas for creating
export const createCategoryInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable()
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const createProductInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().positive(),
  image_url: z.string().url().nullable(),
  category_id: z.number(),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  is_featured: z.boolean().default(false),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable()
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const createReviewInputSchema = z.object({
  product_id: z.number(),
  title: z.string().min(1),
  content: z.string().min(1),
  rating: z.number().min(1).max(5),
  author_name: z.string().min(1),
  is_verified: z.boolean().default(false)
});

export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;

export const createProsConsInputSchema = z.object({
  product_id: z.number(),
  type: z.enum(['pro', 'con']),
  content: z.string().min(1)
});

export type CreateProsConsInput = z.infer<typeof createProsConsInputSchema>;

// Update schemas
export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  image_url: z.string().url().nullable().optional(),
  category_id: z.number().optional(),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Query schemas
export const getProductsByCategoryInputSchema = z.object({
  categorySlug: z.string()
});

export type GetProductsByCategoryInput = z.infer<typeof getProductsByCategoryInputSchema>;

export const getProductBySlugInputSchema = z.object({
  slug: z.string()
});

export type GetProductBySlugInput = z.infer<typeof getProductBySlugInputSchema>;

export const getProductReviewsInputSchema = z.object({
  productId: z.number()
});

export type GetProductReviewsInput = z.infer<typeof getProductReviewsInputSchema>;

export const getFeaturedProductsInputSchema = z.object({
  limit: z.number().optional().default(10)
});

export type GetFeaturedProductsInput = z.infer<typeof getFeaturedProductsInputSchema>;
