import React from "react";
import { useNavigate } from "react-router-dom";
import { type Product } from "../types";
import { useCart } from "../Context/useCart";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    await addToCart(product.id, 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative w-full h-64">
        <img
          src={product.image1 || "https://via.placeholder.com/300x300?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full font-montserrat">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 truncate font-playfair">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 font-montserrat">
          {product.description || "No description available"}
        </p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xl font-bold text-amber-600 font-playfair">
            ${product.price.toFixed(2)}
          </span>
          <a
            href={`/product/${product.id}`}
            className="text-amber-600 font-semibold text-sm hover:underline font-montserrat"
          >
            View Details
          </a>
        </div>
        <button
          onClick={handleAddToCart}
          className={`mt-4 w-full py-2 px-4 rounded-md font-semibold text-sm font-montserrat transition duration-300 ${
            product.stock === 0
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-amber-600 text-white hover:bg-amber-700"
          }`}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;