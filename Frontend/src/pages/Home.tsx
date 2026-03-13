import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { type Product } from "../types";
// import { useCart } from "../Context/useCart";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaHeart, FaShoppingCart } from "react-icons/fa";

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
  const [isLoading, setIsLoading] = useState(true);

  // const { addToCart, isLoading: cartLoading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const inferCategory = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("jeans") || n.includes("pants") || n.includes("trousers")) return "bottoms";
    if (n.includes("top") || n.includes("blouse") || n.includes("shirt")) return "tops";
    if (n.includes("dress") || n.includes("gown")) return "dresses";
    if (n.includes("jacket") || n.includes("coat") || n.includes("outer")) return "outerwear";
    if (n.includes("sweater") || n.includes("hoodie")) return "sweaters";
    return "other";
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const api = createApiInstance(null);
        const res = await api.get<Product[]>("/product/");
        const withCat = res.data.map(p => ({ ...p, category: inferCategory(p.name) }));

        const withRatings = await Promise.all(
          withCat.map(async p => {
            try {
              const sum = await api.get(`/review/product/${p.id}/rating-summary`);
              return {
                ...p,
                average_rating: sum.data.average_rating || 0,
                review_count: sum.data.review_count || 0,
              };
            } catch {
              return { ...p, average_rating: 0, review_count: 0 };
            }
          })
        );

        setProducts(withRatings);
        setFilteredProducts(withRatings);

        if (token) {
          const wapi = createApiInstance(token);
          const wres = await wapi.get("/wishlist/my-wishlist");
          setWishlistIds(wres.data.map((i: any) => i.product_id));
        }
      } catch {
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    let res = [...products];
    if (categoryFilter !== "all") res = res.filter(p => p.category === categoryFilter);

    if (sortOption === "price-low") res.sort((a, b) => a.price - b.price);
    if (sortOption === "price-high") res.sort((a, b) => b.price - a.price);

    setFilteredProducts(res);
  }, [products, categoryFilter, sortOption]);

  const toggleWishlist = async (id: number) => {
    if (!token) {
      toast.info("Log in to use wishlist");
      navigate("/login");
      return;
    }
    const api = createApiInstance(token);
    const isWish = wishlistIds.includes(id);
    try {
      if (isWish) {
        await api.delete(`/wishlist/remove/${id}`);
        setWishlistIds(prev => prev.filter(i => i !== id));
        toast.success("Removed from wishlist");
      } else {
        await api.post("/wishlist/add", { product_id: id });
        setWishlistIds(prev => [...prev, id]);
        toast.success("Added to wishlist");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Wishlist error");
    }
  };

  // const handleAddToCart = async (id: number) => {
  //   if (!token) return navigate("/login");
  //   await addToCart(id, 1);
  // };

  const categories = ["all", "tops", "bottoms", "dresses", "outerwear", "sweaters", "shirts"];

  const renderStars = (rating: number) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`text-base ${i < rating ? "text-amber-500" : "text-gray-300"}`}>
          ★
        </span>
      ))}
    </div>
  );

  return (
    <>
      <Navbar />

      <main className="bg-gray-50 min-h-screen">
        {/* Hero Banner */}
        <section className="relative h-[70vh] min-h-[200px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80"
              alt="Hero fashion"
              className="w-full h-full object-cover brightness-75"
            />
          </div>
          <div className="relative z-10 text-center text-white px-6 max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-5xl md:text-7xl font-light tracking-wider mb-6"
            >
              New Season Arrivals
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl md:text-2xl font-light mb-10"
            >
              Discover timeless style with modern edge
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link
                to="/shop"
                className="px-10 py-4 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition text-lg"
              >
                Shop Now
              </Link>
              <Link
                to="/contact"
                className="px-10 py-4 border-2 border-white text-white font-medium rounded-full hover:bg-white/10 transition text-lg"
              >
                Get in Touch
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Filters + Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Filters */}
            <motion.aside
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-72 xl:w-80 flex-shrink-0"
            >
              <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 sticky top-20">
                <h2 className="text-2xl font-light text-gray-900 mb-8">Filter & Sort</h2>

                <div className="mb-10">
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                          categoryFilter === cat
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {cat === "all" ? "All Pieces" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">Sort By</h3>
                  <select
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-gray-400 transition"
                  >
                    <option value="default">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </motion.aside>

            {/* Product Grid */}
            <section className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                      <div className="aspect-[3/4] bg-gray-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-32 text-gray-500 text-lg">
                  {products.length === 0 ? "No products available yet." : "No matches for your filters."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                  {filteredProducts.map((p, idx) => {
                    const inWish = wishlistIds.includes(p.id);
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: idx * 0.08 }}
                        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <Link to={`/product/${p.id}`}>
                            <img
                              src={p.image1 || "https://via.placeholder.com/480x640?text=Product"}
                              alt={p.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          </Link>

                          {/* Hover overlay */}
                          {/* <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                            <button
                              onClick={() => handleAddToCart(p.id)}
                              disabled={cartLoading || p.stock === 0}
                              className="p-4 bg-white rounded-full hover:bg-gray-100 transition transform hover:scale-110 disabled:opacity-50"
                            >
                              <FaShoppingCart className="w-6 h-6 text-gray-900" />
                            </button>
                            <button
                              onClick={() => toggleWishlist(p.id)}
                              className="p-4 bg-white rounded-full hover:bg-gray-100 transition transform hover:scale-110"
                            >
                              <FaHeart className={`w-6 h-6 ${inWish ? "text-rose-600" : "text-gray-400"}`} />
                            </button>
                          </div> */}

                          {/* Wishlist button top-right */}
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow hover:bg-white transition"
                          >
                            <FaHeart className={`w-5 h-5 ${inWish ? "text-rose-600" : "text-gray-400"}`} />
                          </button>
                        </div>

                        <div className="p-5">
                          <Link to={`/product/${p.id}`}>
                            <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                              {p.name}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-2 mb-3">
                            {renderStars(p.average_rating)}
                            {p.review_count > 0 && (
                              <span className="text-xs text-gray-500">({p.review_count})</span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-semibold text-gray-900">
                              KSh {p.price.toFixed(0)}
                            </span>
                            {p.stock === 0 && (
                              <span className="text-xs text-rose-600 font-medium">Sold out</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
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