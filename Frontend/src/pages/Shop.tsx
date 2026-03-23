import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaShoppingCart, FaEdit, FaArrowRight } from "react-icons/fa";

import createApiInstance from "../utils/api";
import { type Product } from "../types";
import { useCart } from "../Context/useCart";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface ProductWithRating extends Product {
  average_rating: number;
  review_count: number;
}

const Shop = () => {
  const [products, setProducts] = useState<ProductWithRating[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithRating[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart, isLoading: cartLoading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Infer category from product name
  const inferCategory = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("jeans") || n.includes("pants") || n.includes("trousers")) return "bottoms";
    if (n.includes("top") || n.includes("blouse") || n.includes("shirt")) return "tops";
    if (n.includes("dress") || n.includes("gown")) return "dresses";
    if (n.includes("jacket") || n.includes("coat")) return "outerwear";
    if (n.includes("sweater") || n.includes("hoodie")) return "sweaters";
    return "other";
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const api = createApiInstance(null);
        const res = await api.get<Product[]>("/product/");

        const withCategories = res.data.map((p) => ({
          ...p,
          category: inferCategory(p.name),
        }));

        const withRatings = await Promise.all(
          withCategories.map(async (p) => {
            try {
              const ratingRes = await api.get(`/review/product/${p.id}/rating-summary`);
              return {
                ...p,
                average_rating: ratingRes.data.average_rating || 0,
                review_count: ratingRes.data.review_count || 0,
              };
            } catch {
              return { ...p, average_rating: 0, review_count: 0 };
            }
          })
        );

        setProducts(withRatings);
        setFilteredProducts(withRatings);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: number) => {
    if (!token) {
      toast.info("Please log in to add to cart");
      navigate("/login");
      return;
    }
    await addToCart(productId, 1);
  };

  const renderStars = (rating: number) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`text-base ${i < Math.round(rating) ? "text-amber-500" : "text-gray-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <>
      <Navbar />

      <main className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 tracking-tight mb-6"
            >
              Discover Your Perfect Look
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Browse our curated collection of ready-to-wear pieces or let us craft something
              completely unique — designed exclusively for you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-5 justify-center"
            >
              <a
                href="#products"
                className="inline-flex items-center px-10 py-4 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-200/30"
              >
                Shop Ready-to-Wear
                <FaShoppingCart className="ml-3 w-5 h-5" />
              </a>

              <Link
                to="/contact"
                className="inline-flex items-center px-10 py-4 border-2 border-indigo-600 text-indigo-600 font-medium rounded-full hover:bg-indigo-50 transition"
              >
                Design Custom Piece
                <FaEdit className="ml-3 w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* Subtle decorative shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-pink-100/30 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Custom Design Call-to-Action Banner */}
        <section className="py-16 lg:py-20 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:w-1/2"
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-6">
                  Want Something Truly Unique?
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Tell us your vision — fabric, color, fit, style, details — and we’ll bring your
                  dream piece to life. Fully custom, made just for you.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition shadow-lg"
                >
                  Start Your Custom Design
                  <FaArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:w-1/2 grid grid-cols-2 gap-6"
              >
                {[
                  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800",
                  "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800",
                  "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800",
                  "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800",
                ].map((src, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-md">
                    <img
                      src={src}
                      alt="Custom fashion inspiration"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product Grid Section */}
        <section id="products" className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
              <h2 className="text-3xl sm:text-4xl font-light text-gray-900">
                Our Ready-to-Wear Collection
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded-t-2xl" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-4/5" />
                      <div className="h-4 bg-gray-200 rounded w-3/5" />
                      <div className="h-6 bg-gray-200 rounded w-2/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 text-gray-500 text-lg">
                {products.length === 0
                  ? "Our collection is being updated — check back soon!"
                  : "No products match your current filters."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.08 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Link to={`/product/${product.id}`} className="block h-full">
                        <img
                          src={product.image1 || "https://via.placeholder.com/480x640?text=Product"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>

                      {/* Stock badge */}
                      {product.stock === 0 && (
                        <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                          Sold Out
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-grow">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-3">
                        {renderStars(product.average_rating)}
                        {product.review_count > 0 && (
                          <span className="text-xs text-gray-500">
                            ({product.review_count})
                          </span>
                        )}
                      </div>

                      <div className="mt-auto">
                        <p className="text-xl font-semibold text-gray-900">
                          KSh {product.price.toFixed(0)}
                        </p>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAddToCart(product.id)}
                          disabled={cartLoading || product.stock === 0}
                          className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-50 font-medium shadow-sm hover:shadow"
                        >
                          Add to Cart
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Shop;