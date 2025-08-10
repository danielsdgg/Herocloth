import { useEffect, useState } from "react";
import { AxiosError } from "axios";
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
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        const response = await api.get("/product/");
        setProducts(response.data);
      } catch (error: AxiosError<{ msg: string }>) {
        const message = error.response?.data.msg || "Failed to fetch products.";
        setError(message);
        alert(message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProducts();
  }, [token]);

  // Validate form inputs
  const validateProduct = (product: Partial<Product>) => {
    if (!product.name || product.name.trim() === "") return "Product name is required.";
    if (product.price <= 0) return "Price must be greater than 0.";
    if (product.stock < 0) return "Stock cannot be negative.";
    if (!product.image1 || product.image1.trim() === "") return "At least one image URL is required.";
    return null;
  };

  // Create a product
  const handleCreate = async () => {
    const validationError = validateProduct(newProduct);
    if (validationError) {
      alert(validationError);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const api = createApiInstance(token);
      const response = await api.post("/product/", newProduct);
      setProducts([...products, response.data]);
      setNewProduct({ name: "", description: "", price: 0, stock: 0, image1: "", image2: "", image3: "" });
      alert("Product created successfully!");
    } catch (error: AxiosError<{ msg: string }>) {
      const message = error.response?.data.msg || "Failed to create product.";
      setError(message);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a product
  const handleUpdate = async () => {
    if (!editProduct) return;
    const validationError = validateProduct(editProduct);
    if (validationError) {
      alert(validationError);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const api = createApiInstance(token);
      const response = await api.put(`/product/${editProduct.id}`, editProduct);
      setProducts(products.map((p) => (p.id === editProduct.id ? response.data : p)));
      setEditProduct(null);
      alert("Product updated successfully!");
    } catch (error: AxiosError<{ msg: string }>) {
      const message = error.response?.data.msg || "Failed to update product.";
      setError(message);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a product
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setIsLoading(true);
    setError(null);
    try {
      const api = createApiInstance(token);
      await api.delete(`/product/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      alert("Product deleted successfully!");
    } catch (error: AxiosError<{ msg: string }>) {
      const message = error.response?.data.msg || "Failed to delete product.";
      setError(message);
      alert(message);
    } finally {
      setIsLoading(false);
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md font-roboto">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 text-center text-gray-600 font-roboto">
            Loading...
          </div>
        )}

        {/* Create Product Form */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-poppins">
            Create New Product
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name *"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
              required
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
              placeholder="Price *"
              value={newProduct.price || ""}
              onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
              min="0"
              step="0.01"
              required
            />
            <input
              type="number"
              placeholder="Stock *"
              value={newProduct.stock || ""}
              onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
              min="0"
              required
            />
            <input
              type="text"
              placeholder="Image 1 URL *"
              value={newProduct.image1}
              onChange={(e) => setNewProduct({ ...newProduct, image1: e.target.value })}
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
              required
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
            disabled={isLoading}
            className={`mt-6 w-full sm:w-auto bg-purple-600 text-white py-3 px-6 rounded-full font-semibold font-roboto transition duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
            }`}
          >
            Create Product
          </button>
        </section>

        {/* Edit Product Modal */}
        {editProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-poppins">
                Edit Product
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Product Name *"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
                />
                <input
                  type="number"
                  placeholder="Price *"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
                  min="0"
                  step="0.01"
                  required
                />
                <input
                  type="number"
                  placeholder="Stock *"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
                  min="0"
                  required
                />
                <input
                  type="text"
                  placeholder="Image 1 URL *"
                  value={editProduct.image1}
                  onChange={(e) => setEditProduct({ ...editProduct, image1: e.target.value })}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
                  required
                />
                <input
                  type="text"
                  placeholder="Image 2 URL (Optional)"
                  value={editProduct.image2}
                  onChange={(e) => setEditProduct({ ...editProduct, image2: e.target.value })}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
                />
                <input
                  type="text"
                  placeholder="Image 3 URL (Optional)"
                  value={editProduct.image3}
                  onChange={(e) => setEditProduct({ ...editProduct, image3: e.target.value })}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
                />
              </div>
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className={`flex-1 bg-purple-600 text-white py-3 rounded-full font-semibold font-roboto transition duration-300 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
                  }`}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditProduct(null)}
                  className="flex-1 bg-gray-300 text-gray-900 py-3 rounded-full font-semibold font-roboto hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product List */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-poppins">
            Manage Products
          </h2>
          {products.length === 0 && !isLoading ? (
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
                        onClick={() => setEditProduct(product)}
                        className="flex-1 bg-yellow-500 text-white py-2 rounded-md font-semibold font-roboto hover:bg-yellow-600 transition duration-300"
                      >
                        Edit
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