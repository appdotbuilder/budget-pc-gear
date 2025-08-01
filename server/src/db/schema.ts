
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for pros/cons type
export const prosConsTypeEnum = pgEnum('pros_cons_type', ['pro', 'con']);

// Categories table
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Products table
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  image_url: text('image_url'),
  category_id: integer('category_id').notNull().references(() => categoriesTable.id),
  brand: text('brand'),
  model: text('model'),
  is_featured: boolean('is_featured').default(false).notNull(),
  meta_title: text('meta_title'),
  meta_description: text('meta_description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Reviews table
export const reviewsTable = pgTable('reviews', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  rating: integer('rating').notNull(),
  author_name: text('author_name').notNull(),
  is_verified: boolean('is_verified').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Pros and Cons table
export const prosConsTable = pgTable('pros_cons', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  type: prosConsTypeEnum('type').notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  products: many(productsTable),
}));

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [productsTable.category_id],
    references: [categoriesTable.id],
  }),
  reviews: many(reviewsTable),
  prosCons: many(prosConsTable),
}));

export const reviewsRelations = relations(reviewsTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [reviewsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const prosConsRelations = relations(prosConsTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [prosConsTable.product_id],
    references: [productsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;
export type Review = typeof reviewsTable.$inferSelect;
export type NewReview = typeof reviewsTable.$inferInsert;
export type ProsCons = typeof prosConsTable.$inferSelect;
export type NewProsCons = typeof prosConsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  categories: categoriesTable,
  products: productsTable,
  reviews: reviewsTable,
  prosCons: prosConsTable,
};
