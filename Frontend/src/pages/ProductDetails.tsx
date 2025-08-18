import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import { useCart } from "../Context/useCart";
import { type Product } from "../types";
import Navbar from "../components/Navbar";

const ROUTES = {
  CART: "/cart",
  HOME: "/",
};

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { token } = useAuth();
  const { addToCart, isLoading: cartLoading } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        const response = await api.get(`/product/${id}`);
        setProduct(response.data);
        setSelectedImage(response.data.image1 || null);
      } catch (error) {
        const message =
          (error as AxiosError<{ msg: string }>).response?.data?.msg ||
          "Failed to fetch product details.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      toast.success(`${product.name} added to cart!`);
      navigate(ROUTES.CART);
    } catch (error) {
      toast.error("Failed to add item to cart.");
    }
  }, [product, quantity, addToCart, navigate]);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || 1;
      if (product && value <= product.stock) {
        setQuantity(value);
      }
    },
    [product]
  );

  const handleImageSelect = useCallback((image: string) => {
    setSelectedImage(image);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"
            role="status"
            aria-label="Loading product details"
          ></div>
          <p className="text-slate-400 font-medium mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error || "Product not found."}
        </div>
      </div>
    );
  }

  const images = [product.image1, product.image2, product.image3].filter(
    (img): img is string => !!img
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Ambient gradient glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center text-sm text-slate-400"
          >
            <a
              href={ROUTES.HOME}
              className="text-cyan-300 hover:text-cyan-200 transition underline-offset-4 hover:underline"
            >
              Home
            </a>
            <span className="mx-2">/</span>
            <span className="text-slate-100">{product.name}</span>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight animate-fade-in">
                {product.name}
              </h1>
              <div className="absolute bottom-0 left-0 h-1 w-24 rounded bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500" />
            </div>
          </header>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 animate-fade-in"
            >
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-xl shadow-black/40 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 animate-fade-in">
            {/* Image Section */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full h-96">
                <img
                  src={
                    selectedImage ||
                    images[0] ||
                    "https://via.placeholder.com/400x400?text=No+Image"
                  }
                  alt={`${product.name}`}
                  className="w-full h-full object-cover rounded-xl transition-opacity duration-300"
                  loading="lazy"
                />
                {product.stock === 0 && (
                  <span className="absolute top-4 right-4 bg-rose-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(image)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                        selectedImage === image
                          ? "border-cyan-400"
                          : "border-white/10 hover:border-cyan-400/50"
                      }`}
                      aria-label={`View image ${index + 1} of ${product.name}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">
                  {product.name}
                </h2>
                <p className="text-sm text-slate-400 mt-2">
                  {product.description || "No description available."}
                </p>
              </div>
              <p className="text-2xl font-semibold text-cyan-400">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-sm text-slate-400">
                Stock: {product.stock > 0 ? product.stock : "Out of stock"}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 bg-slate-800/70 text-slate-100 hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-110"
                    aria-label={`Decrease quantity of ${product.name}`}
                    disabled={quantity <= 1 || cartLoading || product.stock === 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 text-center rounded-lg border border-white/10 bg-slate-800/70 px-2 py-2 text-slate-100 focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 transition-all duration-200"
                    aria-label={`Quantity of ${product.name}`}
                    disabled={cartLoading || product.stock === 0}
                  />
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 bg-slate-800/70 text-slate-100 hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 hover:scale-110"
                    aria-label={`Increase quantity of ${product.name}`}
                    disabled={
                      cartLoading ||
                      product.stock === 0 ||
                      quantity >= product.stock
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.stock === 0}
                  className="group flex-1 relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                  {cartLoading ? "Adding..." : "Add to Cart"}
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="text-cyan-300 hover:text-cyan-200 text-sm underline-offset-4 hover:underline transition-all duration-200"
                  aria-label="Go back to products"
                >
                  Back to Products
                </button>
                <a
                  href={ROUTES.HOME}
                  className="text-cyan-300 hover:text-cyan-200 text-sm underline-offset-4 hover:underline transition-all duration-200"
                  aria-label="Return to home"
                >
                  Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;