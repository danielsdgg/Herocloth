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
  const [activeSection, setActiveSection] = useState<"users" | "products" | "create">("users");

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
      <div className="min-h-screen bg-black text-white flex">
        {/* Elegant Side Navigation */}
        <aside className="w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col">
          <div className="p-8">
            <h2 className="text-xl font-extralight tracking-widest mb-12">Dashboard</h2>
            <nav className="space-y-4">
              <button
                onClick={() => setActiveSection("users")}
                className={`w-full text-left px-6 py-4 rounded-2xl transition ${
                  activeSection === "users"
                    ? "bg-white/10 border border-white/20"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="text-base font-light">Manage Users</span>
              </button>
              <button
                onClick={() => setActiveSection("create")}
                className={`w-full text-left px-6 py-4 rounded-2xl transition ${
                  activeSection === "create"
                    ? "bg-white/10 border border-white/20"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="text-base font-light">Create Product</span>
              </button>
              <button
                onClick={() => setActiveSection("products")}
                className={`w-full text-left px-6 py-4 rounded-2xl transition ${
                  activeSection === "products"
                    ? "bg-white/10 border border-white/20"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="text-base font-light">Manage Products</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-12 overflow-y-auto">
          <header className="mb-16">
            <h1 className="text-5xl font-extralight tracking-widest mb-4">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-400">
              Welcome back, {username || "Admin"}.
            </p>
          </header>

          {/* Global Error */}
          {error && (
            <div className="mb-12 p-6 bg-red-900/20 border border-red-900/40 rounded-3xl text-red-400">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
          )}

          {/* Users Section */}
          <AnimatePresence mode="wait">
            {activeSection === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8 flex justify-between items-center">
                  <h2 className="text-3xl font-extralight tracking-wide">Manage Users</h2>
                  <p className="text-gray-500">Total: {users.length}</p>
                </div>

                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full max-w-md px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition mb-8"
                />

                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-8 py-6 text-left text-sm uppercase tracking-widest text-gray-500">Username</th>
                        <th className="px-8 py-6 text-left text-sm uppercase tracking-widest text-gray-500">Email</th>
                        <th className="px-8 py-6 text-left text-sm uppercase tracking-widest text-gray-500">Role</th>
                        <th className="px-8 py-6 text-left text-sm uppercase tracking-widest text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-16 text-gray-500">
                            {userSearch ? "No matching users." : "No users available."}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="border-t border-white/5">
                            <td className="px-8 py-6">{user.username}</td>
                            <td className="px-8 py-6 text-gray-400">{user.email}</td>
                            <td className="px-8 py-6 capitalize">{user.role}</td>
                            <td className="px-8 py-6 flex gap-4">
                              <button
                                onClick={() => setEditUser(user)}
                                className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition"
                              >
                                Edit Role
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.id === userId}
                                className="px-6 py-3 bg-red-900/20 border border-red-900/50 rounded-xl hover:bg-red-900/30 transition disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create Product Section */}
          <AnimatePresence mode="wait">
            {activeSection === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-extralight tracking-wide mb-12">Create New Product</h2>
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <input
                      type="text"
                      placeholder="Product Name *"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                    />
                    <input
                      type="number"
                      placeholder="Price *"
                      value={newProduct.price || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                      min="0"
                      step="0.01"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Stock *"
                      value={newProduct.stock || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                      min="0"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image 1 URL *"
                      value={newProduct.image1}
                      onChange={(e) => setNewProduct({ ...newProduct, image1: e.target.value })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image 2 URL"
                      value={newProduct.image2}
                      onChange={(e) => setNewProduct({ ...newProduct, image2: e.target.value })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="Image 3 URL"
                      value={newProduct.image3}
                      onChange={(e) => setNewProduct({ ...newProduct, image3: e.target.value })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                    />
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="px-6 py-4 bg-white/10 text-black border border-white/20 rounded-2xl focus:border-white/50 outline-none transition"
                      required
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
                    className="mt-12 px-16 py-5 bg-white text-black font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition disabled:opacity-60"
                  >
                    {isLoading ? "Creating..." : "Create Product"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Section */}
          <AnimatePresence mode="wait">
            {activeSection === "products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-10 flex justify-between items-center">
                  <h2 className="text-3xl font-extralight tracking-wide">Manage Products</h2>
                  <p className="text-gray-500">Total: {products.length}</p>
                </div>

                {products.length === 0 ? (
                  <p className="text-center py-20 text-gray-400 text-lg">
                    No products yet. Create one using the section above.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        whileHover={{ y: -10 }}
                        className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                      >
                        <div className="h-80 overflow-hidden">
                          <img
                            src={product.image1 || "https://via.placeholder.com/400x500?text=No+Image"}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                          />
                        </div>
                        <div className="p-8">
                          <h3 className="text-xl font-light truncate mb-2">{product.name}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2 mb-4">{product.description || "No description"}</p>
                          <p className="text-3xl font-extralight mb-2">${product.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500 mb-1">Stock: {product.stock}</p>
                          <p className="text-sm text-gray-500 capitalize mb-6">Category: {product.category}</p>
                          <div className="flex gap-4">
                            <button
                              onClick={() => setEditProduct(product)}
                              className="flex-1 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="flex-1 py-3 bg-red-900/20 border border-red-900/50 rounded-xl hover:bg-red-900/30 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Product Modal */}
          <AnimatePresence>
            {editProduct && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-12 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                >
                  <h2 className="text-3xl font-extralight tracking-wide mb-12">Edit Product</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <input
                      type="text"
                      placeholder="Product Name *"
                      value={editProduct.name}
                      onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={editProduct.description}
                      onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                    />
                    <input
                      type="number"
                      placeholder="Price *"
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                      min="0"
                      step="0.01"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Stock *"
                      value={editProduct.stock}
                      onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                      min="0"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image 1 URL *"
                      value={editProduct.image1}
                      onChange={(e) => setEditProduct({ ...editProduct, image1: e.target.value })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image 2 URL"
                      value={editProduct.image2}
                      onChange={(e) => setEditProduct({ ...editProduct, image2: e.target.value })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="Image 3 URL"
                      value={editProduct.image3}
                      onChange={(e) => setEditProduct({ ...editProduct, image3: e.target.value })}
                      className="px-6 py-4 bg-white/10 border border-white/20 rounded-2xl placeholder-gray-500 focus:border-white/50 outline-none transition"
                    />
                    <select
                      value={editProduct.category}
                      onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                      className="px-6 py-4 bg-white/10 text-black border border-white/20 rounded-2xl focus:border-white/50 outline-none transition"
                      required
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
                  <div className="mt-12 flex gap-8">
                    <button
                      onClick={handleUpdate}
                      disabled={isLoading}
                      className="flex-1 py-5 bg-white text-black font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition disabled:opacity-60"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditProduct(null)}
                      className="flex-1 py-5 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition"
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
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-10 w-full max-w-md"
                >
                  <h2 className="text-3xl font-extralight tracking-wide mb-8">Edit User Role</h2>
                  <div className="space-y-4 mb-10">
                    <p className="text-gray-400">Username: <span className="text-white">{editUser.username}</span></p>
                    <p className="text-gray-400">Email: <span className="text-white">{editUser.email}</span></p>
                  </div>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value as "user" | "admin" })}
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:border-white/50 outline-none transition mb-8"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-6">
                    <button
                      onClick={handleUpdateUserRole}
                      disabled={isLoading}
                      className="flex-1 py-5 bg-white text-black font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition disabled:opacity-60"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditUser(null)}
                      className="flex-1 py-5 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;