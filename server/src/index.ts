
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createCategoryInputSchema,
  createProductInputSchema,
  updateProductInputSchema,
  getProductsByCategoryInputSchema,
  getProductBySlugInputSchema,
  getFeaturedProductsInputSchema,
  createReviewInputSchema,
  getProductReviewsInputSchema,
  createProsConsInputSchema
} from './schema';

// Import handlers
import { createCategory } from './handlers/create_category';
import { getCategories } from './handlers/get_categories';
import { createProduct } from './handlers/create_product';
import { getProducts } from './handlers/get_products';
import { getProductsByCategory } from './handlers/get_products_by_category';
import { getProductBySlug } from './handlers/get_product_by_slug';
import { getFeaturedProducts } from './handlers/get_featured_products';
import { updateProduct } from './handlers/update_product';
import { createReview } from './handlers/create_review';
import { getProductReviews } from './handlers/get_product_reviews';
import { createProsCons } from './handlers/create_pros_cons';
import { getProductProsCons } from './handlers/get_product_pros_cons';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Category routes
  createCategory: publicProcedure
    .input(createCategoryInputSchema)
    .mutation(({ input }) => createCategory(input)),
  getCategories: publicProcedure
    .query(() => getCategories()),

  // Product routes
  createProduct: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => createProduct(input)),
  getProducts: publicProcedure
    .query(() => getProducts()),
  getProductsByCategory: publicProcedure
    .input(getProductsByCategoryInputSchema)
    .query(({ input }) => getProductsByCategory(input)),
  getProductBySlug: publicProcedure
    .input(getProductBySlugInputSchema)
    .query(({ input }) => getProductBySlug(input)),
  getFeaturedProducts: publicProcedure
    .input(getFeaturedProductsInputSchema)
    .query(({ input }) => getFeaturedProducts(input)),
  updateProduct: publicProcedure
    .input(updateProductInputSchema)
    .mutation(({ input }) => updateProduct(input)),

  // Review routes
  createReview: publicProcedure
    .input(createReviewInputSchema)
    .mutation(({ input }) => createReview(input)),
  getProductReviews: publicProcedure
    .input(getProductReviewsInputSchema)
    .query(({ input }) => getProductReviews(input)),

  // Pros/Cons routes
  createProsCons: publicProcedure
    .input(createProsConsInputSchema)
    .mutation(({ input }) => createProsCons(input)),
  getProductProsCons: publicProcedure
    .input(getProductReviewsInputSchema)
    .query(({ input }) => getProductProsCons(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
