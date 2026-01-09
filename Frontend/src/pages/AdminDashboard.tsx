import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import createApiInstance from "../utils/api";
import { type Product } from "../types";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  role: "user" | "admin";
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: { id: number; firstname: string; lastname: string };
  product: { id: number; name: string; image1: string };
}

const AdminDashboard = () => {
  const { token, firstname, lastname, userId, setAuth } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", price: 0, stock: 0,
    image1: "", image2: "", image3: "", category: "",
  });
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"users" | "products" | "create" | "reviews">("users");

  // Fetch products
  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const api = createApiInstance(token);
        const res = await api.get<Product[]>("/product/", { withCredentials: true });
        setProducts(res.data);
      } catch {
        toast.error("Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [token]);

  // Fetch users
  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const api = createApiInstance(token);
        const res = await api.get<User[]>("/user/all", { withCredentials: true });
        setUsers(res.data);
      } catch {
        toast.error("Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [token]);

  // Fetch reviews only when section is active
  useEffect(() => {
    if (!token || activeSection !== "reviews") return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const api = createApiInstance(token);
        const prods = await api.get<Product[]>("/product/");
        const all: Review[] = [];

        for (const p of prods.data) {
          try {
            const revs = await api.get(`/review/product/${p.id}/reviews`);
            revs.data.forEach((r: any) => all.push({
              ...r,
              product: { id: p.id, name: p.name, image1: p.image1 || "https://via.placeholder.com/400x400?text=No+Image" },
            }));
          } catch {}
        }

        all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setReviews(all);
      } catch {
        toast.error("Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [token, activeSection]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return users.filter(u => `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  const validateProduct = useCallback((p: Partial<Product>) => {
    if (!p.name?.trim()) return "Product name is required.";
    if ((p.price ?? 0) <= 0) return "Price must be > 0.";
    if ((p.stock ?? 0) < 0) return "Stock cannot be negative.";
    if (!p.image1?.trim()) return "At least one image URL required.";
    if (!p.category?.trim()) return "Category is required.";
    const cats = ["tops", "bottoms", "dresses", "outerwear", "shirts", "sweaters"];
    if (!cats.includes(p.category!)) return `Category must be one of: ${cats.join(", ")}`;
    return null;
  }, []);

  const handleCreate = useCallback(async () => {
    const err = validateProduct(newProduct);
    if (err) return toast.error(err);
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      const res = await api.post<Product>("/product/", newProduct, { withCredentials: true });
      setProducts(prev => [...prev, res.data]);
      setNewProduct({ name: "", description: "", price: 0, stock: 0, image1: "", image2: "", image3: "", category: "" });
      toast.success("Product created!");
    } catch {
      toast.error("Failed to create product");
    } finally {
      setIsLoading(false);
    }
  }, [newProduct, token, validateProduct]);

  const handleUpdate = useCallback(async () => {
    if (!editProduct) return;
    const err = validateProduct(editProduct);
    if (err) return toast.error(err);
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      const payload = {
        name: editProduct.name, description: editProduct.description,
        price: editProduct.price, stock: editProduct.stock,
        image1: editProduct.image1, image2: editProduct.image2,
        image3: editProduct.image3, category: editProduct.category,
      };
      const res = await api.put<Product>(`/product/${editProduct.id}`, payload, { withCredentials: true });
      setProducts(prev => prev.map(p => p.id === editProduct.id ? res.data : p));
      setEditProduct(null);
      toast.success("Product updated!");
    } catch {
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  }, [editProduct, token, validateProduct]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.delete(`/product/${id}`, { withCredentials: true });
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleUpdateUserRole = useCallback(async () => {
    if (!editUser || !editUser.role) return toast.error("Role required");
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      const res = await api.put<User>(`/user/${editUser.id}`, { role: editUser.role }, { withCredentials: true });
      setUsers(prev => prev.map(u => u.id === editUser.id ? res.data : u));
      if (editUser.id === userId) setAuth(token!, "", res.data.role, res.data.firstname, res.data.lastname, res.data.id);
      setEditUser(null);
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    } finally {
      setIsLoading(false);
    }
  }, [editUser, token, userId, setAuth]);

  const handleDeleteUser = useCallback(async (id: number) => {
    if (id === userId) return toast.error("Cannot delete yourself");
    if (!window.confirm("Delete this user?")) return;
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.delete(`/user/${id}`, { withCredentials: true });
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  }, [token, userId]);

  const inputFields = [
    { key: "name", label: "Product Name *" },
    { key: "description", label: "Description" },
    { key: "price", label: "Price (KES) *", type: "number" },
    { key: "stock", label: "Stock Quantity *", type: "number" },
    { key: "image1", label: "Image 1 URL *" },
    { key: "image2", label: "Image 2 URL" },
    { key: "image3", label: "Image 3 URL" },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white flex">
        <aside className="w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col">
          <div className="p-10">
            <h2 className="text-2xl font-extralight tracking-widest mb-16 text-gray-300">Admin Panel</h2>
            <nav className="space-y-3">
              {["users", "create", "products", "reviews"].map(sec => (
                <button
                  key={sec}
                  onClick={() => setActiveSection(sec as any)}
                  className={`w-full text-left px-8 py-5 rounded-3xl transition text-base font-light ${
                    activeSection === sec ? "bg-white/10 border border-white/20 shadow-lg" : "hover:bg-white/5"
                  }`}
                >
                  {sec === "users" ? "Manage Users" : sec === "create" ? "Create Product" : sec === "products" ? "Manage Products" : "View Reviews"}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-10">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-light">{firstname} {lastname}</p>
          </div>
        </aside>

        <main className="flex-1 p-16 overflow-y-auto">
          <header className="mb-20">
            <h1 className="text-6xl font-extralight tracking-widest mb-4">Dashboard</h1>
            <p className="text-xl text-gray-400 font-light">Welcome back, {firstname} {lastname}.</p>
          </header>

          {isLoading && <div className="text-center py-32"><div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" /></div>}

          <AnimatePresence mode="wait">
            {/* Users */}
            {activeSection === "users" && (
              <motion.div key="users" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                <div className="mb-10 flex justify-between items-center">
                  <h2 className="text-4xl font-extralight tracking-widest">Users</h2>
                  <p className="text-gray-500 text-lg">Total: {users.length}</p>
                </div>
                <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  className="w-full max-w-lg px-8 py-5 bg-white/10 border border-white/20 rounded-3xl placeholder-gray-500 focus:border-white/50 outline-none mb-12 text-sm" />
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-10 py-8 text-left text-xs uppercase tracking-widest text-gray-500">Name</th>
                        <th className="px-10 py-8 text-left text-xs uppercase tracking-widest text-gray-500">Email</th>
                        <th className="px-10 py-8 text-left text-xs uppercase tracking-widest text-gray-500">Phone</th>
                        <th className="px-10 py-8 text-left text-xs uppercase tracking-widest text-gray-500">Role</th>
                        <th className="px-10 py-8 text-left text-xs uppercase tracking-widest text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-20 text-gray-500 text-lg">{userSearch ? "No matching users" : "No users"}</td></tr>
                      ) : filteredUsers.map(u => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-10 py-8 text-sm font-light">{u.firstname} {u.lastname}</td>
                          <td className="px-10 py-8 text-sm text-gray-400">{u.email}</td>
                          <td className="px-10 py-8 text-sm text-gray-400">{u.phone || "—"}</td>
                          <td className="px-10 py-8 text-sm capitalize">{u.role}</td>
                          <td className="px-10 py-8 flex gap-4">
                            <button onClick={() => setEditUser(u)} className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 text-xs">Edit Role</button>
                            <button onClick={() => handleDeleteUser(u.id)} disabled={u.id === userId}
                              className="px-8 py-4 bg-red-900/20 border border-red-900/50 rounded-2xl hover:bg-red-900/30 text-xs disabled:opacity-50">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Create Product */}
            {activeSection === "create" && (
              <motion.div key="create" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                <h2 className="text-4xl font-extralight tracking-widest mb-16">Create New Product</h2>
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-16 shadow-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {inputFields.map(({ key, label, type = "text" }) => (
                      <div key={key}>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">{label}</label>
                        <input
                          type={type}
                          value={newProduct[key as keyof typeof newProduct] as string | number}
                          onChange={e => setNewProduct(prev => ({
                            ...prev,
                            [key]: type === "number" ? (key === "price" ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0) : e.target.value
                          }))}
                          className="w-full px-8 py-5 bg-white/10 border border-white/20 rounded-3xl placeholder-gray-500 focus:border-white/50 outline-none text-sm"
                          required={label.includes("*")}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Category *</label>
                      <select value={newProduct.category} onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-8 py-5 bg-white/10 border border-white/20 rounded-3xl text-black focus:border-white/50 text-sm" required>
                        <option value="" disabled>Select Category</option>
                        {["tops","bottoms","dresses","outerwear","shirts","sweaters"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={handleCreate} disabled={isLoading}
                    className="mt-16 px-20 py-6 bg-white text-black font-medium uppercase tracking-widest rounded-3xl hover:bg-gray-100 disabled:opacity-60 text-sm">
                    {isLoading ? "Creating..." : "Create Product"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Products */}
            {activeSection === "products" && (
              <motion.div key="products" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                <div className="mb-12 flex justify-between items-center">
                  <h2 className="text-4xl font-extralight tracking-widest">Products</h2>
                  <p className="text-gray-500 text-lg">Total: {products.length}</p>
                </div>
                {products.length === 0 ? (
                  <p className="text-center py-32 text-gray-400 text-lg">No products yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                    {products.map(p => (
                      <motion.div key={p.id} whileHover={{ y: -12 }} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className="h-96 overflow-hidden">
                          <img src={p.image1 || "https://via.placeholder.com/500x600?text=No+Image"} alt={p.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="p-10">
                          <h3 className="text-xl font-light truncate mb-3">{p.name}</h3>
                          <p className="text-gray-400 text-xs line-clamp-2 mb-6">{p.description || "No description"}</p>
                          <p className="text-3xl font-extralight mb-3">Ksh {p.price.toFixed(2)}</p>
                          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Stock: {p.stock}</p>
                          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">Category: {p.category}</p>
                          <div className="flex gap-4">
                            <button onClick={() => setEditProduct(p)} className="flex-1 py-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 text-xs">Edit</button>
                            <button onClick={() => handleDelete(p.id)} className="flex-1 py-4 bg-red-900/20 border border-red-900/50 rounded-2xl hover:bg-red-900/30 text-xs">Delete</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews */}
            {activeSection === "reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                <div className="mb-12 flex justify-between items-center">
                  <h2 className="text-4xl font-extralight tracking-widest">Customer Reviews</h2>
                  <p className="text-gray-500 text-lg">Total: {reviews.length}</p>
                </div>
                {reviews.length === 0 ? (
                  <p className="text-center py-32 text-gray-400 text-lg">No reviews yet.</p>
                ) : (
                  <div className="space-y-12">
                    {reviews.map(r => (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                          <div>
                            <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden mb-4">
                              <img src={r.product.image1} alt={r.product.name} className="w-full h-full object-cover" />
                            </div>
                            <p className="text-sm font-light text-center text-gray-300">{r.product.name}</p>
                          </div>
                          <div className="md:col-span-2 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-6 mb-6">
                                <div className="w-14 h-14 bg-gray-300 rounded-full" />
                                <div>
                                  <p className="text-lg font-light">{r.user.firstname} {r.user.lastname}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(r.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1 mb-6">
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} className={`text-xl ${s <= r.rating ? "text-white" : "text-gray-600"}`}>★</span>
                                ))}
                              </div>
                              <p className="text-sm font-light text-gray-300 leading-relaxed">{r.comment || "No comment."}</p>
                            </div>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                  className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-16 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <h2 className="text-4xl font-extralight tracking-widest mb-16">Edit Product</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {inputFields.map(({ key, label, type = "text" }) => (
                      <div key={key}>
                        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">{label}</label>
                        <input
                          type={type}
                          value={editProduct[key as keyof Product] as string | number}
                          onChange={e => setEditProduct(prev => prev ? ({
                            ...prev,
                            [key]: type === "number" ? (key === "price" ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0) : e.target.value
                          }) : null)}
                          className="w-full px-8 py-5 bg-white/10 border border-white/20 rounded-3xl placeholder-gray-500 focus:border-white/50 text-sm"
                          required={label.includes("*")}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Category *</label>
                      <select value={editProduct.category} onChange={e => setEditProduct(prev => prev ? {...prev, category: e.target.value} : null)}
                        className="w-full px-8 py-5 bg-white/10 border border-white/20 rounded-3xl text-black focus:border-white/50 text-sm" required>
                        <option value="" disabled>Select Category</option>
                        {["tops","bottoms","dresses","outerwear","shirts","sweaters"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-16 flex gap-10">
                    <button onClick={handleUpdate} disabled={isLoading}
                      className="flex-1 py-6 bg-white text-black font-medium uppercase tracking-widest rounded-3xl hover:bg-gray-100 disabled:opacity-60 text-sm">
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => setEditProduct(null)}
                      className="flex-1 py-6 bg-white/10 border border-white/20 rounded-3xl hover:bg-white/20 text-sm">Cancel</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit User Role Modal */}
          <AnimatePresence>
            {editUser && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                  className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-12 w-full max-w-lg">
                  <h2 className="text-3xl font-extralight tracking-widest mb-12">Edit User Role</h2>
                  <div className="space-y-6 mb-12 text-sm">
                    <p className="text-gray-400">Name: <span className="text-white">{editUser.firstname} {editUser.lastname}</span></p>
                    <p className="text-gray-400">Email: <span className="text-white">{editUser.email}</span></p>
                    <p className="text-gray-400">Phone: <span className="text-white">{editUser.phone || "—"}</span></p>
                  </div>
                  <select value={editUser.role} onChange={e => setEditUser(prev => prev ? {...prev, role: e.target.value as "user"|"admin"} : null)}
                    className="w-full px-8 py-5 bg-white/10 border border-white/20 rounded-3xl text-white focus:border-white/50 mb-12 text-sm">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-8">
                    <button onClick={handleUpdateUserRole} disabled={isLoading}
                      className="flex-1 py-6 bg-white text-black font-medium uppercase tracking-widest rounded-3xl hover:bg-gray-100 disabled:opacity-60 text-sm">
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={() => setEditUser(null)}
                      className="flex-1 py-6 bg-white/10 border border-white/20 rounded-3xl hover:bg-white/20 text-sm">Cancel</button>
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