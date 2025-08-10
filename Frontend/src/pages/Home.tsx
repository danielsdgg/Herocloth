import { useEffect, useState } from "react";
import createApiInstance from "../utils/api";
import { type Product } from "../types";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../components/useAuth";

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const api = createApiInstance(token);
        const response = await api.get("/product/");
        setProducts(response.data);
        console.log("Products response:", response.data);
      } catch (error: any) {
        console.error("AxiosError:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    };
    fetchProducts();
  }, [token]);

  return (
    <div className="min-h-screen bg-white font-montserrat">
      {/* Hero Section */}
      <section
        className="relative h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://cdn.pixabay.com/photo/2021/06/10/10/12/fashion-6312728_640.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-playfair animate-fade-in-down">
            Elevate Your Wardrobe
          </h1>
          <p className="mt-4 text-lg sm:text-xl md:text-2xl font-light opacity-90 animate-fade-in-down delay-100">
            Discover premium fashion crafted for the bold and stylish.
          </p>
          <a
            href="#products"
            className="mt-8 inline-block bg-amber-500 text-white font-semibold py-3 px-10 rounded-md hover:bg-amber-600 transition duration-300 transform hover:scale-105 font-montserrat"
          >
            Explore Now
          </a>
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-playfair mb-4">
            Curated Collections
          </h2>
          <p className="text-lg text-gray-600 mb-8 font-montserrat">
            Handpicked styles to inspire your next look.
          </p>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
            {[
              "New Arrivals",
              "Streetwear",
              "Elegant Classics",
              "Summer Vibes",
            ].map((category) => (
              <a
                key={category}
                href={`/category/${category
                  .toLowerCase()
                  .replace(" ", "-")}`}
                className="flex-shrink-0 bg-white rounded-lg shadow-md p-4 text-center w-40 hover:bg-amber-50 transition duration-300"
              >
                <img
                  src={`https://via.placeholder.com/100?text=${category}`}
                  alt={category}
                  className="w-16 h-16 mx-auto mb-2 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-gray-900 font-montserrat">
                  {category}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-playfair">
            Trending Now
          </h2>
          <a
            href="/products"
            className="text-amber-600 font-semibold hover:underline font-montserrat"
          >
            See All Products
          </a>
        </div>
        {products.length === 0 ? (
          <p className="text-gray-600 text-center text-lg font-montserrat">
            No products available. New styles coming soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="bg-amber-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-playfair mb-4">
            Exclusive Offer
          </h2>
          <p className="text-lg text-gray-600 mb-6 font-montserrat">
            Get 20% off your first purchase when you sign up today!
          </p>
          <a
            href="/auth/register"
            className="inline-block bg-amber-500 text-white font-semibold py-3 px-10 rounded-md hover:bg-amber-600 transition duration-300 font-montserrat"
          >
            Join Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
