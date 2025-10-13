import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import createApiInstance from "../utils/api";
import { type Product } from "../types";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
}

const AdminDashboard = () => {
  const { token, username, userId, setAuth } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    image1: "",
    image2: "",
    image3: "",
    category: "",
  });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        const response = await api.get<Product[]>("/product/", { withCredentials: true });
        setProducts(response.data);
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
          "Failed to fetch products.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProducts();
  }, [token]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        const response = await api.get<User[]>("/user/all", { withCredentials: true });
        setUsers(response.data);
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
          "Failed to fetch users.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    const lowerSearch = userSearch.toLowerCase();
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch)
    );
  }, [users, userSearch]);

  // Validate product inputs
  const validateProduct = useCallback((product: Partial<Product>) => {
    if (!product.name || product.name.trim() === "") return "Product name is required.";
    if (product.price! <= 0) return "Price must be greater than 0.";
    if (product.stock! < 0) return "Stock cannot be negative.";
    if (!product.image1 || product.image1.trim() === "") return "At least one image URL is required.";
    if (!product.category || product.category.trim() === "") return "Category is required.";
    const validCategories = ["tops", "bottoms", "dresses", "outerwear", "shirts", "sweaters"];
    if (!validCategories.includes(product.category)) return `Category must be one of: ${validCategories.join(", ")}`;
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
      const response = await api.post<Product>("/product/", newProduct, { withCredentials: true });
      setProducts([...products, response.data]);
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        image1: "",
        image2: "",
        image3: "",
        category: "",
      });
      toast.success("Product created successfully!");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
        "Failed to create product.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [newProduct, products, token, validateProduct]);

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
      const updatePayload = {
        name: editProduct.name,
        description: editProduct.description,
        price: editProduct.price,
        stock: editProduct.stock,
        image1: editProduct.image1,
        image2: editProduct.image2,
        image3: editProduct.image3,
        category: editProduct.category,
      };
      const response = await api.put<Product>(`/product/${editProduct.id}`, updatePayload, { withCredentials: true });
      setProducts(products.map((p) => (p.id === editProduct.id ? response.data : p)));
      setEditProduct(null);
      toast.success("Product updated successfully!");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
        "Failed to update product.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [editProduct, products, token, validateProduct]);

  // Delete a product
  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this product?")) return;
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        await api.delete(`/product/${id}`, { withCredentials: true });
        setProducts(products.filter((p) => p.id !== id));
        toast.success("Product deleted successfully!");
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
          "Failed to delete product.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [products, token]
  );

  // Update user role
  const handleUpdateUserRole = useCallback(async () => {
    if (!editUser) return;
    if (!editUser.role) {
      toast.error("Role is required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const api = createApiInstance(token);
      const response = await api.put<User>(`/user/${editUser.id}`, { role: editUser.role }, { withCredentials: true });
      setUsers(users.map((u) => (u.id === editUser.id ? response.data : u)));
      if (editUser.id === userId) {
        setAuth(token!, "", response.data.role, response.data.username, response.data.id);
      }
      setEditUser(null);
      toast.success("User role updated successfully!");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
        "Failed to update user role.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [editUser, users, token, userId, setAuth]);

  // Delete a user
  const handleDeleteUser = useCallback(
    async (id: number) => {
      if (id === userId) {
        toast.error("Cannot delete your own admin account.");
        return;
      }
      if (!window.confirm("Are you sure you want to delete this user?")) return;
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        await api.delete(`/user/${id}`, { withCredentials: true });
        setUsers(users.filter((u) => u.id !== id));
        toast.success("User deleted successfully!");
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
          "Failed to delete user.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [users, token, userId]
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
          <header className="mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative inline-block"
            >
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 animate-fade-in">
                Admin Dashboard
              </h1>
              <motion.div
                className="absolute -bottom-2 left-10 h-1 w-32 rounded bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-50"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </motion.div>
            <p className="text-lg text-slate-300 mt-3 max-w-2xl mx-auto animate-fade-in">
              Welcome, {username || "Admin"}! Manage your e-commerce platform with ease.
            </p>
          </header>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
              aria-live="assertive"
              className="mb-8 rounded-lg bg-rose-500/10 px-6 py-4 text-sm text-rose-300 text-center shadow-md shadow-black/20"
            >
              {error}
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 text-center"
            >
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"
                role="status"
                aria-label="Loading data"
              ></div>
              <p className="text-slate-400 font-medium mt-4">Loading data...</p>
            </motion.div>
          )}

          {/* Manage Users */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                Manage Users
              </h2>
              <p className="text-sm text-slate-400">Total Users: {users.length}</p>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users by username or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full sm:w-1/3 rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                aria-label="Search users"
              />
            </div>
            {filteredUsers.length === 0 && !isLoading ? (
              <p className="text-slate-400 text-center text-lg animate-fade-in">
                {userSearch ? "No users match your search." : "No users available."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full rounded-2xl bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-black/30 border border-white/10">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Username</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/10 last:border-0 hover:bg-slate-800/50 transition-all duration-200"
                      >
                        <td className="px-6 py-4 text-sm text-slate-100">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-slate-100">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-100 capitalize">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => setEditUser(user)}
                            className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-2 text-sm text-slate-100 font-medium hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-200 hover:scale-105"
                            aria-label={`Edit role for ${user.username}`}
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === userId}
                            className="rounded-lg bg-rose-500/90 px-4 py-2 text-sm text-white font-medium hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Delete ${user.username}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.section>

          {/* Manage Payments (Placeholder) */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-12 rounded-2xl bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-black/30 border border-white/10 p-8"
          >
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-6">
              Manage Payments
            </h2>
            <p className="text-slate-400 text-center text-lg">
              The Payment and purchase management section will be available soon.!
            </p>
          </motion.section>

          {/* Create Product Form */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-12 rounded-2xl bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-black/30 border border-white/10 p-8"
          >
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-6">
              Create New Product
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name *"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                required
                aria-label="Product name"
              />
              <input
                type="text"
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                aria-label="Product description"
              />
              <input
                type="number"
                placeholder="Price *"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })
                }
                className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
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
                className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                min="0"
                required
                aria-label="Product stock"
              />
              <input
                type="text"
                placeholder="Image 1 URL *"
                value={newProduct.image1}
                onChange={(e) => setNewProduct({ ...newProduct, image1: e.target.value })}
                className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                required
                aria-label="Primary product image URL"
              />
              <input
                type="text"
                placeholder="Image 2 URL (Optional)"
                value={newProduct.image2}
                onChange={(e) => setNewProduct({ ...newProduct, image2: e.target.value })}
                className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                aria-label="Secondary product image URL"
              />
              <input
                type="text"
                placeholder="Image 3 URL (Optional)"
                value={newProduct.image3}
                onChange={(e) => setNewProduct({ ...newProduct, image3: e.target.value })}
                className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                aria-label="Tertiary product image URL"
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                required
                aria-label="Product category"
              >
                <option value="" disabled>Select Category *</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="dresses">Dresses</option>
                <option value="outerwear">Outerwear</option>
                <option value="shirts">Shirts</option>
                <option value="sweaters">Sweaters</option>
              </select>
            </div>
            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="group mt-6 w-full sm:w-auto relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              aria-label="Create new product"
            >
              <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
              {isLoading ? "Creating..." : "Create Product"}
            </button>
          </motion.section>

          {/* Manage Products */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                Manage Products
              </h2>
              <p className="text-sm text-slate-400">Total Products: {products.length}</p>
            </div>
            {products.length === 0 && !isLoading ? (
              <p className="text-slate-400 text-center text-lg animate-fade-in">
                No products available. Create one to get started!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group rounded-2xl bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-black/30 border border-white/10 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
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
                      <p className="text-sm text-slate-400">Stock: {product.stock}</p>
                      <p className="text-sm text-slate-400 capitalize">
                        Category: {product.category}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setEditProduct(product)}
                          className="flex-1 rounded-lg bg-slate-800/70 border border-white/10 px-4 py-2 text-slate-100 font-medium hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-200 hover:scale-105"
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
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Edit Product Modal */}
          <AnimatePresence>
            {editProduct && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                role="dialog"
                aria-modal="true"
                aria-label="Edit product modal"
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-black/30 border border-white/10 p-8 w-full max-w-md"
                >
                  <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-6">
                    Edit Product
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name *"
                      value={editProduct.name}
                      onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                      className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                      required
                      aria-label="Product name"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={editProduct.description}
                      onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                      className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                      aria-label="Product description"
                    />
                    <input
                      type="number"
                      placeholder="Price *"
                      value={editProduct.price}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })
                      }
                      className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
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
                      className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                      min="0"
                      required
                      aria-label="Product stock"
                    />
                    <input
                      type="text"
                      placeholder="Image 1 URL *"
                      value={editProduct.image1}
                      onChange={(e) => setEditProduct({ ...editProduct, image1: e.target.value })}
                      className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                      required
                      aria-label="Primary product image URL"
                    />
                    <input
                      type="text"
                      placeholder="Image 2 URL (Optional)"
                      value={editProduct.image2}
                      onChange={(e) => setEditProduct({ ...editProduct, image2: e.target.value })}
                      className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                      aria-label="Secondary product image URL"
                    />
                    <input
                      type="text"
                      placeholder="Image 3 URL (Optional)"
                      value={editProduct.image3}
                      onChange={(e) => setEditProduct({ ...editProduct, image3: e.target.value })}
                      className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                      aria-label="Tertiary product image URL"
                    />
                    <select
                      value={editProduct.category}
                      onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                      className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                      required
                      aria-label="Product category"
                    >
                      <option value="" disabled>Select Category *</option>
                      <option value="tops">Tops</option>
                      <option value="bottoms">Bottoms</option>
                      <option value="dresses">Dresses</option>
                      <option value="outerwear">Outerwear</option>
                      <option value="shirts">Shirts</option>
                      <option value="sweaters">Sweaters</option>
                    </select>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={handleUpdate}
                      disabled={isLoading}
                      className="group flex-1 relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                      aria-label="Save product changes"
                    >
                      <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditProduct(null)}
                      className="flex-1 rounded-lg bg-slate-800/70 border border-white/10 px-4 py-2 text-slate-100 font-medium hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-200 hover:scale-105"
                      aria-label="Cancel edit"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit User Role Modal */}
          <AnimatePresence>
            {editUser && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                role="dialog"
                aria-modal="true"
                aria-label="Edit user role modal"
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-black/30 border border-white/10 p-8 w-full max-w-md"
                >
                  <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-6">
                    Edit User Role
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-sm text-slate-400">
                      <p>Username: {editUser.username}</p>
                      <p>Email: {editUser.email}</p>
                    </div>
                    <select
                      value={editUser.role}
                      onChange={(e) => setEditUser({ ...editUser, role: e.target.value as "user" | "admin" })}
                      className="rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                      required
                      aria-label="User role"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={handleUpdateUserRole}
                      disabled={isLoading}
                      className="group flex-1 relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                      aria-label="Save user role changes"
                    >
                      <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditUser(null)}
                      className="flex-1 rounded-lg bg-slate-800/70 border border-white/10 px-4 py-2 text-slate-100 font-medium hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-200 hover:scale-105"
                      aria-label="Cancel edit"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;