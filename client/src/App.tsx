
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';

import type { Product, Review, ProsCons } from '../../server/src/schema';

// Gaming-themed color scheme
const GAMING_CATEGORIES = [
  { name: 'Gaming Mice', slug: 'gaming-mice', icon: '🖱️', color: 'bg-red-500' },
  { name: 'Keyboards', slug: 'keyboards', icon: '⌨️', color: 'bg-blue-500' },
  { name: 'Monitors', slug: 'monitors', icon: '🖥️', color: 'bg-green-500' },
  { name: 'Controllers', slug: 'controllers', icon: '🎮', color: 'bg-purple-500' },
  { name: 'Headsets', slug: 'headsets', icon: '🎧', color: 'bg-orange-500' },
  { name: 'Webcams', slug: 'webcams', icon: '📹', color: 'bg-pink-500' }
];

// Stub data for demonstration - marked as stubs in comments
const STUB_FEATURED_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'BudgetGamer Pro Mouse',
    slug: 'budgetgamer-pro-mouse',
    description: 'High-precision gaming mouse with RGB lighting at an unbeatable price',
    price: 29.99,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
    category_id: 1,
    brand: 'BudgetGamer',
    model: 'Pro',
    is_featured: true,
    meta_title: 'BudgetGamer Pro Mouse - Best Budget Gaming Mouse 2024',
    meta_description: 'Get pro-level gaming performance without breaking the bank. RGB lighting, precision sensor, and ergonomic design.',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15')
  },
  {
    id: 2,
    name: 'TechSaver Mechanical Keyboard',
    slug: 'techsaver-mechanical-keyboard',
    description: 'Tactile mechanical switches with customizable backlighting - gaming on a budget',
    price: 59.99,
    image_url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    category_id: 2,
    brand: 'TechSaver',
    model: 'MK87',
    is_featured: true,
    meta_title: 'TechSaver Mechanical Gaming Keyboard - Affordable Mechanical Switches',
    meta_description: 'Experience mechanical gaming without the premium price. Blue switches, RGB backlighting, and durable construction.',
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-10')
  },
  {
    id: 3,
    name: 'ValueVision 24" Gaming Monitor',
    slug: 'valuevision-24-gaming-monitor',
    description: '144Hz refresh rate and 1ms response time for competitive gaming at a fraction of the cost',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    category_id: 3,
    brand: 'ValueVision',
    model: 'VV24G',
    is_featured: true,
    meta_title: 'ValueVision 24" 144Hz Gaming Monitor - Budget High Refresh Rate',
    meta_description: 'Smooth 144Hz gaming without the premium price tag. Perfect for competitive FPS and fast-paced gaming.',
    created_at: new Date('2024-01-12'),
    updated_at: new Date('2024-01-12')
  }
];

// Stub reviews data
const STUB_REVIEWS: Review[] = [
  {
    id: 1,
    product_id: 1,
    title: 'Amazing value for money!',
    content: 'This mouse feels premium despite the budget price. Great sensor accuracy and the RGB looks fantastic.',
    rating: 5,
    author_name: 'GamerMike23',
    is_verified: true,
    created_at: new Date('2024-01-20')
  },
  {
    id: 2,
    product_id: 1,
    title: 'Perfect for budget builds',
    content: 'Exactly what I needed for my first gaming setup. Works flawlessly with all my games.',
    rating: 4,
    author_name: 'NewGamer2024',
    is_verified: true,
    created_at: new Date('2024-01-18')
  }
];

// Stub pros/cons data
const STUB_PROS_CONS: ProsCons[] = [
  { id: 1, product_id: 1, type: 'pro', content: 'Excellent build quality for the price', created_at: new Date() },
  { id: 2, product_id: 1, type: 'pro', content: 'RGB lighting adds gaming aesthetic', created_at: new Date() },
  { id: 3, product_id: 1, type: 'pro', content: 'Precise sensor for competitive gaming', created_at: new Date() },
  { id: 4, product_id: 1, type: 'con', content: 'Software could be more intuitive', created_at: new Date() },
  { id: 5, product_id: 1, type: 'con', content: 'Side buttons feel slightly cheap', created_at: new Date() }
];

function App() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [productProsCons, setProductProsCons] = useState<ProsCons[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      const result = await trpc.getFeaturedProducts.query({ limit: 6 });
      // STUB: Using stub data since backend returns empty array
      setFeaturedProducts(result.length > 0 ? result : STUB_FEATURED_PRODUCTS);
    } catch (error) {
      console.error('Failed to load featured products:', error);
      // STUB: Fallback to stub data on error
      setFeaturedProducts(STUB_FEATURED_PRODUCTS);
    }
  }, []);

  const loadProductDetails = useCallback(async (product: Product) => {
    setIsLoading(true);
    try {
      const [reviews, prosCons] = await Promise.all([
        trpc.getProductReviews.query({ productId: product.id }),
        trpc.getProductProsCons.query({ productId: product.id })
      ]);
      
      // STUB: Using stub data since backend returns empty arrays
      setProductReviews(reviews.length > 0 ? reviews : STUB_REVIEWS);
      setProductProsCons(prosCons.length > 0 ? prosCons : STUB_PROS_CONS);
    } catch (error) {
      console.error('Failed to load product details:', error);
      // STUB: Fallback to stub data
      setProductReviews(STUB_REVIEWS);
      setProductProsCons(STUB_PROS_CONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  const filteredProducts = featuredProducts.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    loadProductDetails(product);
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const averageRating = productReviews.length > 0 
    ? productReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / productReviews.length 
    : 0;

  const pros = productProsCons.filter((item: ProsCons) => item.type === 'pro');
  const cons = productProsCons.filter((item: ProsCons) => item.type === 'con');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* SEO-optimized header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🎮 <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">BudgetGaming</span>
              </h1>
              <p className="text-slate-300 text-sm">Premium Gaming Accessories at Budget Prices</p>
            </div>
            <nav className="hidden md:flex space-x-6">
              {GAMING_CATEGORIES.slice(0, 4).map((cat) => (
                <Button
                  key={cat.slug}
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero section with search */}
        <section className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Level Up Your Gaming
            <span className="block text-2xl md:text-3xl text-blue-400 mt-2">Without Breaking the Bank</span>
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Discover premium gaming accessories at budget-friendly prices. Curated reviews, detailed comparisons, and honest pros & cons to help you make the best choice.
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <Input
              type="search"
              placeholder="Search gaming accessories..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 text-lg py-3"
            />
          </div>
        </section>



        {/* Categories grid */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">🛒 Shop by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {GAMING_CATEGORIES.map((category) => (
              <Card key={category.slug} className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm">{category.name}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">⭐ Featured Budget Picks</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: Product) => (
              <Card key={product.id} className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="relative">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-600">
                    💰 Budget Pick
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {product.brand} • {product.model}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">${product.price}</div>
                      <div className="text-xs text-slate-500">Best Price</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm mb-4">{product.description}</p>
                  <Button
                    onClick={() => handleProductSelect(product)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    View Details & Reviews 🔍
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Product detail modal/section */}
        {selectedProduct && (
          <section className="mb-12">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-2xl mb-2">{selectedProduct.name}</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      {selectedProduct.brand} {selectedProduct.model}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedProduct(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕ Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    {selectedProduct.image_url && (
                      <img
                        src={selectedProduct.image_url}
                        alt={selectedProduct.name}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-green-400">${selectedProduct.price}</span>
                        <div className="text-right">
                          <div className="text-yellow-400 text-lg">{renderStars(Math.round(averageRating))}</div>
                          <div className="text-slate-400 text-sm">
                            {averageRating.toFixed(1)} ({productReviews.length} reviews)
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-300">{selectedProduct.description}</p>
                    </div>
                  </div>

                  <div>
                    <Tabs defaultValue="reviews" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                        <TabsTrigger value="reviews" className="text-white data-[state=active]:bg-slate-600">
                          📝 Reviews ({productReviews.length})
                        </TabsTrigger>
                        <TabsTrigger value="proscons" className="text-white data-[state=active]:bg-slate-600">
                          ⚖️ Pros & Cons
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="reviews" className="space-y-4">
                        {isLoading ? (
                          <div className="text-center text-slate-400 py-8">Loading reviews...</div>
                        ) : productReviews.length > 0 ? (
                          productReviews.map((review: Review) => (
                            <Card key={review.id} className="bg-slate-900 border-slate-600">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="text-white font-semibold">{review.title}</h4>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-yellow-400">{renderStars(review.rating)}</span>
                                    {review.is_verified && (
                                      <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-300 text-sm mb-2">{review.content}</p>
                                <div className="text-slate-500 text-xs">
                                  by {review.author_name} • {review.created_at.toLocaleDateString()}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center text-slate-400 py-8">No reviews yet</div>
                        )}
                      </TabsContent>

                      <TabsContent value="proscons" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Card className="bg-green-900/20 border-green-700">
                            <CardHeader>
                              <CardTitle className="text-green-400 text-lg">✅ Pros</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {pros.length > 0 ? (
                                <ul className="space-y-2">
                                  {pros.map((pro: ProsCons) => (
                                    <li key={pro.id} className="text-slate-300 text-sm flex items-start">
                                      <span className="text-green-400 mr-2">•</span>
                                      {pro.content}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-slate-400 text-sm">No pros listed yet</p>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="bg-red-900/20 border-red-700">
                            <CardHeader>
                              <CardTitle className="text-red-400 text-lg">❌ Cons</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {cons.length > 0 ? (
                                <ul className="space-y-2">
                                  {cons.map((con: ProsCons) => (
                                    <li key={con.id} className="text-slate-300 text-sm flex items-start">
                                      <span className="text-red-400 mr-2">•</span>
                                      {con.content}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-slate-400 text-sm">No cons listed yet</p>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Why choose us section */}
        <section className="text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-8">🎯 Why Choose BudgetGaming?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💰</div>
                <h4 className="text-white font-semibold mb-2">Best Value Picks</h4>
                <p className="text-slate-400 text-sm">Handpicked accessories that deliver premium performance at budget prices</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h4 className="text-white font-semibold mb-2">Honest Reviews</h4>
                <p className="text-slate-400 text-sm">Real user experiences and detailed pros & cons to help you decide</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="text-white font-semibold mb-2">Gaming Focused</h4>
                <p className="text-slate-400 text-sm">Every product tested and reviewed specifically for gaming performance</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* SEO-optimized footer */}
      <footer className="bg-black border-t border-slate-700 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-slate-400 mb-2">
              © 2024 BudgetGaming - Your source for affordable gaming accessories
            </p>
            <p className="text-slate-500 text-sm">
              Gaming mice • Mechanical keyboards • High refresh monitors • Budget controllers • Gaming headsets
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
