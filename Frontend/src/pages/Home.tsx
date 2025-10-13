import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import createApiInstance from "../utils/api";
import { type Product } from "../types";
import { useCart } from "../Context/useCart";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("default");
  const { addToCart, isLoading: cartLoading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const productsRef = useRef<HTMLElement>(null);

  // Infer category from product name
  const inferCategory = (productName: string): string => {
    const name = productName.toLowerCase();
    if (name.includes("jeans") || name.includes("pants") || name.includes("trousers")) {
      return "bottoms";
    } else if (name.includes("shirt") || name.includes("top") || name.includes("blouse")) {
      return "tops";
    } else if (name.includes("dress") || name.includes("gown")) {
      return "dresses";
    } else if (name.includes("jacket") || name.includes("coat") || name.includes("sweater")) {
      return "outerwear";
    }
    return "other"; // Fallback for uncategorized products
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const api = createApiInstance(null);
        const response = await api.get<Product[]>("/product/");
        const productsWithCategories = response.data.map((product) => ({
          ...product,
          category: inferCategory(product.name),
        }));
        setProducts(productsWithCategories || []);
        setFilteredProducts(productsWithCategories || []);
      } catch (error: unknown) {
        let message = "Failed to fetch products.";
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "ERR_NETWORK"
        ) {
          message = "Cannot connect to server. Please ensure the backend is running.";
        } else if (
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          (error as { response?: { data?: { msg?: string } } }).response?.data?.msg
        ) {
          message = (error as { response?: { data?: { msg?: string } } }).response?.data?.msg || message;
        }
        toast.error(message);
      }
    };
    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let updatedProducts = [...products];

    // Category filter
    if (categoryFilter !== "all") {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Sorting
    if (sortOption === "price-low") {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      updatedProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(updatedProducts);
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

  const handleShopNow = useCallback(() => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Ambient gradient glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-indigo-500/20 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 animate-pulse">
              Elevate Your Wardrobe
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
              Discover curated clothing collections crafted for style and sophistication.
            </p>
            <button
              onClick={handleShopNow}
              className="relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-10 py-4 font-medium text-white shadow-lg transition transform hover:scale-105 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
              Explore Now
            </button>
          </div>
        </section>

        {/* Filters Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between mb-8">
            {/* Category Filter */}
            <div className="flex flex-col w-full sm:w-1/3">
              <label className="text-sm font-medium text-slate-300 mb-2">Clothing Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl bg-slate-800/70 border border-white/10 text-slate-100 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300 hover:bg-slate-800/90"
              >
                <option value="all">All Clothing</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="dresses">Dresses</option>
                <option value="outerwear">Outerwear</option>
              </select>
            </div>

            {/* Sort Option */}
            <div className="flex flex-col w-full sm:w-1/3">
              <label className="text-sm font-medium text-slate-300 mb-2">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="rounded-xl bg-slate-800/70 border border-white/10 text-slate-100 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300 hover:bg-slate-800/90"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section
          ref={productsRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
            Our Clothing Collection
          </h2>
          {filteredProducts.length === 0 ? (
            <div className="text-center">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"
                role="status"
                aria-label="Loading products"
              ></div>
              <p className="text-slate-400 font-medium mt-4">
                {products.length === 0 ? "No clothing available." : "No clothing matches your filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-xl shadow-black/40 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-cyan-500/40"
                >
                  <div className="relative w-full h-64">
                    <img
                      src={
                        product.image1 ||
                        "https://via.placeholder.com/300x300?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    {product.stock === 0 && (
                      <span className="absolute top-2 right-2 bg-rose-500/90 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-100 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                      {product.description || "No description available"}
                    </p>
                    <p className="text-xl font-semibold text-cyan-400 mt-3">
                      ${product.price.toFixed(2)}
                    </p>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={cartLoading || product.stock === 0}
                        className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-medium text-sm transition hover:from-cyan-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        Add to Cart
                      </button>
                      <Link
                        to={`/product/${product.id}`}
                        className="flex-1 py-2 px-4 rounded-xl bg-slate-800/70 border border-white/10 text-white font-medium text-sm text-center transition hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        aria-label={`View details for ${product.name}`}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer/>
    </>
  );
};

export default Home;