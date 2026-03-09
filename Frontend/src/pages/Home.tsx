import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import createApiInstance from "../utils/api";
import { type Product } from "../types";
import { useCart } from "../Context/useCart";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";

interface ProductWithRating extends Product {
  average_rating: number;
  review_count: number;
}

const Home = () => {
  const [products, setProducts] = useState<ProductWithRating[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithRating[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("default");
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const { addToCart, isLoading: cartLoading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const inferCategory = (productName: string): string => {
    const name = productName.toLowerCase();
    if (name.includes("jeans") || name.includes("pants") || name.includes("trousers")) return "bottoms";
    if (name.includes("top") || name.includes("blouse")) return "tops";
    if (name.includes("dress") || name.includes("gown")) return "dresses";
    if (name.includes("jacket") || name.includes("coat")) return "outerwear";
    if (name.includes("sweater")) return "sweaters";
    if (name.includes("shirt")) return "shirts";
    return "other";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = createApiInstance(null);
        const response = await api.get<Product[]>("/product/");
        const productsWithCategories = response.data.map((product) => ({
          ...product,
          category: inferCategory(product.name),
        }));

        const productsWithRatings = await Promise.all(
          productsWithCategories.map(async (product) => {
            try {
              const summaryRes = await api.get(`/review/product/${product.id}/rating-summary`);
              return {
                ...product,
                average_rating: summaryRes.data.average_rating || 0,
                review_count: summaryRes.data.review_count || 0,
              };
            } catch {
              return { ...product, average_rating: 0, review_count: 0 };
            }
          })
        );

        setProducts(productsWithRatings);
        setFilteredProducts(productsWithRatings);

        if (token) {
          const wishlistApi = createApiInstance(token);
          const wishlistRes = await wishlistApi.get("/wishlist/my-wishlist");
          const ids = wishlistRes.data.map((item: any) => item.product_id);
          setWishlistIds(ids);
        }
      } catch (error: unknown) {
        toast.error("Failed to fetch products.");
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    let result = [...products];
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }
    if (sortOption === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }
    setFilteredProducts(result);
  }, [products, categoryFilter, sortOption]);

  const handleAddToCart = useCallback(
    async (productId: number) => {
      if (!token) {
        navigate("/login");
        return;
      }
      await addToCart(productId, 1);
    },
    [token, addToCart, navigate]
  );

  const toggleWishlist = async (productId: number) => {
    if (!token) {
      toast.info("Please log in to add to wishlist");
      navigate("/login");
      return;
    }
    const api = createApiInstance(token);
    const isInWishlist = wishlistIds.includes(productId);
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/remove/${productId}`);
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
        toast.success("Removed from wishlist");
      } else {
        await api.post("/wishlist/add", { product_id: productId });
        setWishlistIds((prev) => [...prev, productId]);
        toast.success("Added to wishlist");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Failed to update wishlist");
    }
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map((s) => (
          <span
            key={s}
            className={`text-base leading-none ${
              s <= full || (s === full + 1 && half) ? "text-amber-500" : "text-stone-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Updated categories list
  const categories = ["all", "tops", "bottoms", "outerwear", "dresses", "sweaters", "shirts"];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-stone-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-14">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-12">
            {/* ── Enhanced Category Section ── */}
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:w-72 xl:w-80 flex-shrink-0"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-7 sticky top-20">
                <h2 className="text-xl md:text-2xl font-light text-stone-900 mb-6 md:mb-7 tracking-wide">Shop by Category</h2>

                <div className="mb-8 md:mb-10">
                  <ul className="space-y-2">
                    {categories.map((cat, i) => (
                      <motion.li
                        key={cat}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 + 0.15, duration: 0.45, ease: "easeOut" }}
                      >
                        <button
                          onClick={() => setCategoryFilter(cat)}
                          className={`w-full flex items-center text-left px-4 md:px-5 py-3 md:py-3.5 rounded-xl text-sm md:text-base font-medium transition-all duration-300 ${
                            categoryFilter === cat
                              ? "bg-stone-900 text-white shadow-md"
                              : "text-stone-700 hover:bg-stone-50 hover:text-stone-900 hover:shadow-sm"
                          }`}
                        >
                          <span className="flex-1">
                            {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </span>
                          {categoryFilter === cat && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-2 text-white/80 text-xs"
                            >
                              ✓
                            </motion.span>
                          )}
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-stone-600 mb-3 md:mb-4 tracking-wide uppercase">Sort By</h3>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full px-4 md:px-5 py-3 md:py-3.5 text-sm md:text-base border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-800/40 transition duration-300"
                  >
                    <option value="default">Featured</option>
                    <option value="price-low">Price: Low → High</option>
                    <option value="price-high">Price: High → Low</option>
                  </select>
                </div>
              </div>
            </motion.aside>

            {/* Product Grid – unchanged core logic */}
            <section className="flex-1">
              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 md:py-32 text-stone-500 text-base md:text-lg font-light"
                >
                  {products.length === 0 ? "No pieces available at the moment." : "No matches for current filters."}
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  {filteredProducts.map((product, index) => {
                    const isInWishlist = wishlistIds.includes(product.id);
                    const secondaryImage = (product as any).image2 || product.image1;

                    return (
                      <motion.article
                        key={product.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.65, delay: index * 0.07, ease: "easeOut" }}
                        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-stone-100 flex flex-col"
                      >
                        <div className="relative overflow-hidden aspect-[3/4]">
                          <Link to={`/product/${product.id}`} className="block h-full">
                            <motion.img
                              whileHover={{ scale: 1.085 }}
                              transition={{ duration: 0.9 }}
                              src={product.image1 || "https://via.placeholder.com/480x640?text=Product"}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700"
                              loading="lazy"
                            />
                            {secondaryImage && (
                              <motion.img
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                                src={secondaryImage}
                                alt={`${product.name} alt`}
                                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                          </Link>

                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.88 }}
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 md:p-3 rounded-full bg-white/90 backdrop-blur-md shadow-sm hover:shadow transition-all"
                          >
                            <FaHeart
                              className={`text-xl md:text-2xl transition-all duration-300 ${
                                isInWishlist ? "text-rose-600 scale-110" : "text-stone-400 hover:text-rose-500"
                              }`}
                            />
                          </motion.button>
                        </div>

                        <div className="p-4 md:p-5 flex flex-col flex-grow">
                          <Link to={`/product/${product.id}`} className="block mb-1 md:mb-2">
                            <h3 className="text-sm md:text-base font-medium text-stone-900 line-clamp-2 group-hover:text-stone-700 transition-colors duration-300">
                              {product.name}
                            </h3>
                          </Link>

                          {product.review_count > 0 && (
                            <div className="flex items-center gap-1.5 md:gap-2 mt-1 mb-2 md:mt-2 md:mb-3">
                              {renderStars(product.average_rating)}
                              <span className="text-xs text-stone-500">({product.review_count})</span>
                            </div>
                          )}

                          <div className="mt-auto">
                            <p className="text-lg md:text-xl font-semibold text-stone-900 tracking-tight">
                              KSh {product.price.toFixed(0)}
                            </p>

                            {product.stock === 0 && (
                              <p className="mt-1 text-xs font-medium text-rose-600">Out of stock</p>
                            )}

                            <motion.button
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAddToCart(product.id)}
                              disabled={cartLoading || product.stock === 0}
                              className="mt-4 md:mt-5 w-full py-3 md:py-3.5 px-4 md:px-6 text-sm font-medium text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-all duration-300 disabled:opacity-50 disabled:hover:bg-stone-900 shadow-sm hover:shadow active:scale-[0.98]"
                            >
                              Add to Cart
                            </motion.button>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Home;