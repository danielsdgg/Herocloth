import { useEffect, useState } from "react";
import createApiInstance from "../utils/api";
import { type Product } from "../types";
import { useAuth } from "../components/useAuth";

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    image1: "",
    image2: "",
    image3: "",
  });
  const { token } = useAuth();

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const api = createApiInstance(token);
        const response = await api.get("/product/");
        setProducts(response.data);
      } catch (error: any) {
        console.error("Error fetching products:", error.message);
      }
    };
    fetchProducts();
  }, [token]);

  // Create a product
  const handleCreate = async () => {
    try {
      const api = createApiInstance(token);
      const response = await api.post("/product/", newProduct);
      setProducts([...products, response.data.product]);
      setNewProduct({ name: "", description: "", price: 0, stock: 0, image1: "", image2: "", image3: "" });
      console.log("Product created:", response.data);
    } catch (error: any) {
      console.error("Error creating product:", error.message);
    }
  };

  // Update a product
  const handleUpdate = async (id: number, updatedProduct: Partial<Product>) => {
    try {
      const api = createApiInstance(token);
      const response = await api.put(`/product/${id}`, updatedProduct);
      setProducts(products.map((p) => (p.id === id ? response.data.product : p)));
      console.log("Product updated:", response.data);
    } catch (error: any) {
      console.error("Error updating product:", error.message);
    }
  };

  // Delete a product
  const handleDelete = async (id: number) => {
    try {
      const api = createApiInstance(token);
      await api.delete(`/product/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      console.log("Product deleted:", id);
    } catch (error: any) {
      console.error("Error deleting product:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 font-poppins">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 mt-2 font-roboto">
            Manage your fashion products with ease
          </p>
        </header>

        {/* Create Product Form */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-poppins">
            Create New Product
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
            />
            <input
              type="text"
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
            />
            <input
              type="number"
              placeholder="Price"
              value={newProduct.price || ""}
              onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
            />
            <input
              type="number"
              placeholder="Stock"
              value={newProduct.stock || ""}
              onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
            />
            <input
              type="text"
              placeholder="Image 1 URL"
              value={newProduct.image1}
              onChange={(e) => setNewProduct({ ...newProduct, image1: e.target.value })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
            />
            <input
              type="text"
              placeholder="Image 2 URL (Optional)"
              value={newProduct.image2}
              onChange={(e) => setNewProduct({ ...newProduct, image2: e.target.value })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
            />
            <input
              type="text"
              placeholder="Image 3 URL (Optional)"
              value={newProduct.image3}
              onChange={(e) => setNewProduct({ ...newProduct, image3: e.target.value })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
            />
          </div>
          <button
            onClick={handleCreate}
            className="mt-6 w-full sm:w-auto bg-purple-600 text-white py-3 px-6 rounded-full font-semibold font-roboto hover:bg-purple-700 transition duration-300"
          >
            Create Product
          </button>
        </section>

        {/* Product List */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-poppins">
            Manage Products
          </h2>
          {products.length === 0 ? (
            <p className="text-gray-600 text-center text-lg font-roboto">
              No products available. Create one to get started!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl"
                >
                  <div className="relative w-full h-48">
                    <img
                      src={product.image1 || "https://via.placeholder.com/300x300?text=No+Image"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate font-poppins">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 font-roboto">
                      {product.description || "No description"}
                    </p>
                    <p className="text-xl font-bold text-purple-600 mt-2 font-poppins">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 font-roboto">
                      Stock: {product.stock}
                    </p>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() =>
                          handleUpdate(product.id, {
                            ...product,
                            name: `${product.name} (Updated)`,
                          })
                        }
                        className="flex-1 bg-yellow-500 text-white py-2 rounded-md font-semibold font-roboto hover:bg-yellow-600 transition duration-300"
                      >
                        Update Name
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded-md font-semibold font-roboto hover:bg-red-600 transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;