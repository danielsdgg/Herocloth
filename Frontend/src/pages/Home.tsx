import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import createApiInstance from "../utils/api";
import { type Product } from "../types";
import { useCart } from "../Context/useCart";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart, isLoading: cartLoading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const api = createApiInstance(null);
        const response = await api.get<Product[]>("/product/");
        setProducts(response.data || []);
      } catch (error: any) {
        const message =
          error.code === "ERR_NETWORK"
            ? "Cannot connect to server. Please ensure the backend is running."
            : error.response?.data?.msg || "Failed to fetch products.";
        toast.error(message);
      }
    };
    fetchProducts();
  }, []);

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
        <section className="bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-indigo-500/20 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* <div className="mb-8 inline-flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-slate-900"
                  aria-hidden="true"
                >
                  <path d="M7 4h10l1 3h3v2h-1l-2 9H6L4 9H3V7h3l1-3zm2.2 5 1.5 7h7.1l1.6-7H9.2zM9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-tight">
                YourStore
              </span>
            </div> */}
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Find Your Perfect Look
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Dive into our vibrant collection of premium fashion, crafted for
              style and comfort.
            </p>
            <button
              onClick={handleShopNow}
              className="cursor-pointer group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-8 py-3 font-medium text-white shadow-lg transition hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <span className="cursor-pointer absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
              Shop Now
            </button>
          </div>
        </section>

        {/* Products Section */}
        <section
          ref={productsRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8 text-center">
            Our Collection
          </h2>
          {products.length === 0 ? (
            <div className="text-center">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"
                role="status"
                aria-label="Loading products"
              ></div>
              <p className="text-slate-400 font-medium mt-4">
                No products available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-xl shadow-black/40 overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative w-full h-64">
                    <img
                      src={
                        product.image1 ||
                        "https://via.placeholder.com/300x300?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
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
    </>
  );
};

export default Home;