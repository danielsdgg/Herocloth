import { useEffect, useState, useCallback } from "react";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import createApiInstance from "../utils/api";
import { type Product } from "../types";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";

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
      } catch (error) {
        const message =
          (error as AxiosError<{ msg: string }>).response?.data?.msg ||
          "Failed to fetch products.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProducts();
  }, [token]);

  // Validate form inputs
  const validateProduct = useCallback((product: Partial<Product>) => {
    if (!product.name || product.name.trim() === "") return "Product name is required.";
    if (product.price <= 0) return "Price must be greater than 0.";
    if (product.stock < 0) return "Stock cannot be negative.";
    if (!product.image1 || product.image1.trim() === "") return "At least one image URL is required.";
    return null;
  }, []);

  // Create a product
  const handleCreate = useCallback(async () => {
    const validationError = validateProduct(newProduct);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const api = createApiInstance(token);
      const response = await api.post("/product/", newProduct);
      setProducts([...products, response.data]);
      setNewProduct({ name: "", description: "", price: 0, stock: 0, image1: "", image2: "", image3: "" });
      toast.success("Product created successfully!");
    } catch (error) {
      const message =
        (error as AxiosError<{ msg: string }>).response?.data?.msg ||
        "Failed to create product.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [newProduct, products, token]);

  // Update a product
  const handleUpdate = useCallback(async () => {
    if (!editProduct) return;
    const validationError = validateProduct(editProduct);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const api = createApiInstance(token);
      const response = await api.put(`/product/${editProduct.id}`, editProduct);
      setProducts(products.map((p) => (p.id === editProduct.id ? response.data : p)));
      setEditProduct(null);
      toast.success("Product updated successfully!");
    } catch (error) {
      const message =
        (error as AxiosError<{ msg: string }>).response?.data?.msg ||
        "Failed to update product.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [editProduct, products, token]);

  // Delete a product
  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this product?")) return;
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        await api.delete(`/product/${id}`);
        setProducts(products.filter((p) => p.id !== id));
        toast.success("Product deleted successfully!");
      } catch (error) {
        const message =
          (error as AxiosError<{ msg: string }>).response?.data?.msg ||
          "Failed to delete product.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [products, token]
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
          {/* Header */}
          <header className="mb-10">
            <div className="relative inline-block">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 animate-fade-in">
                Admin Dashboard
              </h1>
              <div className="absolute -bottom-2 left-0 h-1 w-32 rounded bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 opacity-50 animate-pulse" />
            </div>
            <p className="text-lg text-slate-300 mt-3 max-w-2xl animate-fade-in">
              Manage your e-commerce products with ease and efficiency.
            </p>
          </header>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 animate-fade-in"
            >
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 text-center">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"
                role="status"
                aria-label="Loading products"
              ></div>
              <p className="text-slate-400 font-medium mt-4">Loading products...</p>
            </div>
          )}

          {/* Create Product Form */}
          <section className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-xl shadow-black/40 p-8 mb-12 animate-fade-in">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">
              Create New Product
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name *"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                required
                aria-label="Product name"
              />
              <input
                type="text"
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                aria-label="Product description"
              />
              <input
                type="number"
                placeholder="Price *"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })
                }
                className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                min="0"
                step="0.01"
                required
                aria-label="Product price"
              />
              <input
                type="number"
                placeholder="Stock *"
                value={newProduct.stock || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })
                }
                className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                min="0"
                required
                aria-label="Product stock"
              />
              <input
                type="text"
                placeholder="Image 1 URL *"
                value={newProduct.image1}
                onChange={(e) => setNewProduct({ ...newProduct, image1: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                required
                aria-label="Primary product image URL"
              />
              <input
                type="text"
                placeholder="Image 2 URL (Optional)"
                value={newProduct.image2}
                onChange={(e) => setNewProduct({ ...newProduct, image2: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                aria-label="Secondary product image URL"
              />
              <input
                type="text"
                placeholder="Image 3 URL (Optional)"
                value={newProduct.image3}
                onChange={(e) => setNewProduct({ ...newProduct, image3: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                aria-label="Tertiary product image URL"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="group mt-6 w-full sm:w-auto relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              aria-label="Create new product"
            >
              <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
              {isLoading ? "Creating..." : "Create Product"}
            </button>
          </section>

          {/* Edit Product Modal */}
          {editProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-xl shadow-black/40 p-8 w-full max-w-md">
                <h2 className="text-2xl font-semibold text-slate-100 mb-6">
                  Edit Product
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name *"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    required
                    aria-label="Product name"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                    className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    aria-label="Product description"
                  />
                  <input
                    type="number"
                    placeholder="Price *"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })
                    }
                    className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    min="0"
                    step="0.01"
                    required
                    aria-label="Product price"
                  />
                  <input
                    type="number"
                    placeholder="Stock *"
                    value={editProduct.stock}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })
                    }
                    className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    min="0"
                    required
                    aria-label="Product stock"
                  />
                  <input
                    type="text"
                    placeholder="Image 1 URL *"
                    value={editProduct.image1}
                    onChange={(e) => setEditProduct({ ...editProduct, image1: e.target.value })}
                    className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    required
                    aria-label="Primary product image URL"
                  />
                  <input
                    type="text"
                    placeholder="Image 2 URL (Optional)"
                    value={editProduct.image2}
                    onChange={(e) => setEditProduct({ ...editProduct, image2: e.target.value })}
                    className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    aria-label="Secondary product image URL"
                  />
                  <input
                    type="text"
                    placeholder="Image 3 URL (Optional)"
                    value={editProduct.image3}
                    onChange={(e) => setEditProduct({ ...editProduct, image3: e.target.value })}
                    className="rounded-lg border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    aria-label="Tertiary product image URL"
                  />
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className="group flex-1 relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                    aria-label="Save product changes"
                  >
                    <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditProduct(null)}
                    className="flex-1 rounded-xl border border-white/10 bg-slate-800/70 px-6 py-3 text-slate-100 font-medium hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-200 hover:scale-105"
                    aria-label="Cancel edit"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product List */}
          <section>
            <h2 className="text-2xl font-semibold text-slate-100 mb-6 animate-fade-in">
              Manage Products
            </h2>
            {products.length === 0 && !isLoading ? (
              <p className="text-slate-400 text-center text-lg animate-fade-in">
                No products available. Create one to get started!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-xl shadow-black/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-in"
                  >
                    <div className="relative w-full h-48 overflow-hidden">
                      <img
                        src={
                          product.image1 ||
                          "https://via.placeholder.com/300x300?text=No+Image"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-slate-100 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                        {product.description || "No description"}
                      </p>
                      <p className="text-xl font-semibold text-cyan-400 mt-2">
                        ${product.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-400">
                        Stock: {product.stock}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setEditProduct(product)}
                          className="flex-1 rounded-lg border border-white/10 bg-slate-800/70 px-4 py-2 text-slate-100 font-medium hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-200 hover:scale-105"
                          aria-label={`Edit ${product.name}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="flex-1 rounded-lg bg-rose-500/90 px-4 py-2 text-white font-medium hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all duration-200 hover:scale-105"
                          aria-label={`Delete ${product.name}`}
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
    </>
  );
};

export default AdminDashboard;