import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

const Home = () => {
  const [products, setProducts] = useState<ProductWithRating[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithRating[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("default");
  const { addToCart, isLoading: cartLoading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Infer category from product name
  const inferCategory = (productName: string): string => {
    const name = productName.toLowerCase();
    if (name.includes("jeans") || name.includes("pants") || name.includes("trousers")) return "bottoms";
    if (name.includes("shirt") || name.includes("top") || name.includes("blouse")) return "tops";
    if (name.includes("dress") || name.includes("gown")) return "dresses";
    if (name.includes("jacket") || name.includes("coat") || name.includes("sweater")) return "outerwear";
    return "other";
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

        // Fetch rating summary for each product
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
              return {
                ...product,
                average_rating: 0,
                review_count: 0,
              };
            }
          })
        );

        setProducts(productsWithRatings);
        setFilteredProducts(productsWithRatings);
      } catch (error: unknown) {
        toast.error("Failed to fetch products.");
      }
    };
    fetchProducts();
  }, []);

  // Filter & Sort
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

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xs ${
              star <= fullStars
                ? "text-gray-900"
                : star === fullStars + 1 && hasHalf
                ? "text-gray-900"
                : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        {/* Small, elegant hero section */}
        <section className="bg-gray-200 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-light tracking-wider text-gray-900">
              Curated Elegance
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover timeless pieces crafted for modern sophistication.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>

                <div className="mb-8">
                  <ul className="space-y-2">
                    {["all", "tops", "bottoms", "dresses", "outerwear"].map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => setCategoryFilter(cat)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            categoryFilter === cat
                              ? "bg-gray-800 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {cat === "all" ? "All Clothing" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Sort By</h3>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    <option value="default">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <section className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500">
                    {products.length === 0 ? "No products available." : "No products match your filters."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <Link to={`/product/${product.id}`} className="block">
                        <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                          <img
                            src={product.image1 || "https://via.placeholder.com/300x400?text=No+Image"}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      </Link>

                      <div className="p-4">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-gray-700">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Star Rating */}
                        {product.review_count > 0 ? (
                          <div className="flex items-center gap-2 mt-2">
                            {renderStars(product.average_rating)}
                            <span className="text-xs text-gray-500">
                              ({product.review_count})
                            </span>
                          </div>
                        ) : (
                          <div className="h-5 mt-2" /> 
                        )}

                        <p className="mt-3 text-lg font-semibold text-gray-800">
                          ${product.price.toFixed(2)}
                        </p>
                        {product.stock === 0 && (
                          <p className="mt-1 text-xs text-red-600 font-medium">Out of stock</p>
                        )}

                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={cartLoading || product.stock === 0}
                          className="mt-4 w-full py-2.5 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
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