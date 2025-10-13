import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../Context/useCart";
import { type Product } from "../types";

interface ProductCardProps {
  product: Product;
}

const ROUTES = {
  PRODUCT: (id: number) => `/product/${id}`,
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, isLoading } = useCart();

  const handleAddToCart = useCallback(async () => {
    try {
      await addToCart(product.id, 1);
    } catch {
      // Error handled in CartContext
    }
  }, [addToCart, product.id]);

  return (
    <div className="group rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-xl shadow-black/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src={product.image1 || "https://via.placeholder.com/300x300?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.stock === 0 && (
          <span className="absolute top-3 right-3 bg-rose-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
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
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xl font-semibold text-cyan-400">
            ${product.price.toFixed(2)}
          </span>
          <Link
            to={ROUTES.PRODUCT(product.id)}
            className="text-cyan-300 hover:text-cyan-200 text-sm font-medium underline-offset-4 hover:underline transition-all duration-200"
            aria-label={`View details for ${product.name}`}
          >
            View Details
          </Link>
        </div>
        <button
          onClick={handleAddToCart}
          className="group relative mt-4 w-full inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-4 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          disabled={product.stock === 0 || isLoading}
          aria-label={`Add ${product.name} to cart`}
        >
          <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
          {product.stock === 0 ? "Out of Stock" : isLoading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;