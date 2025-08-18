import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { AxiosError } from "axios";
import { toast } from "react-toastify";
import createApiInstance from "../utils/api";
import { type Product } from "../types";
import { useCart } from "../Context/useCart";
import { useAuth } from "../components/useAuth";

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
        console.log("Products response:", response.data);
        setProducts(response.data || []); // Handle empty response
      } catch (error: any) {
        console.error("Error fetching products:", {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
        const message = error.code === "ERR_NETWORK"
          ? "Cannot connect to server. Please ensure the backend is running."
          : error.response?.data?.msg || "Failed to fetch products.";
        toast.error(message);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: number) => {
    if (!token) {
      navigate("/login");
      return;
    }
    await addToCart(productId, 1);
  };

  const handleShopNow = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold font-playfair mb-4">
            Find Your Perfect Look
          </h1>
          <p className="text-xl md:text-2xl font-montserrat mb-8">
            Dive into our vibrant collection of premium fashion.
          </p>
          <button
            onClick={handleShopNow}
            className="inline-block bg-yellow-400 text-rose-600 py-3 px-10 rounded-full font-montserrat font-semibold text-lg hover:bg-yellow-300 transition duration-300"
          >
            Shop Now
          </button>
        </div>
      </section>
      <section ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-playfair mb-8 text-center">
          Our Collection
        </h2>
        {products.length === 0 ? (
          <div className="text-center">
            <div className="spinner-border text-pink-500" role="status"></div>
            <p className="text-gray-600 font-montserrat mt-4">No products available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="relative w-full h-64">
                  <img
                    src={product.image1 || "https://via.placeholder.com/300x300?text=No+Image"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded-full font-montserrat">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 truncate font-playfair">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 font-montserrat line-clamp-2">
                    {product.description || "No description available"}
                  </p>
                  <p className="text-xl font-bold text-pink-500 mt-3 font-playfair">
                    ${product.price.toFixed(2)}
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={cartLoading || product.stock === 0}
                      className={`flex-1 py-2 px-4 rounded-full font-montserrat font-semibold text-sm transition duration-300 ${
                        cartLoading || product.stock === 0
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-pink-500 text-white hover:bg-pink-600"
                      }`}
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="flex-1 py-2 px-4 rounded-full font-montserrat font-semibold text-sm text-center bg-rose-500 text-white hover:bg-rose-600 transition duration-300"
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
  );
};

export default Home;