// src/pages/ProductDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import { useCart } from "../Context/useCart";
import { type Product } from "../types";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
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
      } catch (error: AxiosError<{ msg: string }>) {
        const message = error.response?.data.msg || "Failed to fetch product details.";
        setError(message);
        alert(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      navigate("/cart");
    } catch (error) {
      // Error handled in CartContext
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 font-roboto text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-md font-roboto">
          {error || "Product not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 font-poppins">
            {product.name}
          </h1>
          <p className="text-lg text-gray-600 mt-2 font-roboto">
            Product Details
          </p>
        </header>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md font-roboto">
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-4">
            {[product.image1, product.image2, product.image3].map((image, index) => (
              image && (
                <img
                  key={index}
                  src={image || "https://via.placeholder.com/300x300?text=No+Image"}
                  alt={`${product.name} image ${index + 1}`}
                  className="w-full h-64 object-cover rounded-md"
                />
              )
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 font-poppins">
              {product.name}
            </h2>
            <p className="text-gray-600 mt-2 font-roboto">{product.description || "No description available."}</p>
            <p className="text-3xl font-bold text-purple-600 mt-4 font-poppins">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2 font-roboto">
              Stock: {product.stock}
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 border border-gray-300 rounded-md p-2 font-roboto focus:ring-2 focus:ring-purple-500"
                aria-label="Quantity"
              />
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || product.stock === 0}
                className={`flex-1 bg-purple-600 text-white py-3 rounded-full font-semibold font-roboto transition duration-300 ${
                  cartLoading || product.stock === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
                }`}
              >
                Add to Cart
              </button>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-purple-600 hover:text-purple-800 font-roboto underline"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;