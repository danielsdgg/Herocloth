import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Package, PlusCircle, Star, Heart, Mail, ShoppingCart,
  Search, Edit, Trash2, Loader2,
  UserCircle, ShieldCheck, Clock, Tag, Calendar,
  MessageSquare, Star as StarIcon, X,
} from "lucide-react";

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

interface WishlistGroup {
  user_id: number;
  user_name: string;
  items: {
    product_id: number;
    name: string;
    price: number;
    image1: string;
    added_at: string;
  }[];
}

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  user_id: number | null;
}

interface Order {
  id: number;
  created_at: string;
  status: string;
  total: number | null;
  user_name: string;
}

const AdminDashboard = () => {
  const { token, firstname, lastname, userId, setAuth } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlists, setWishlists] = useState<WishlistGroup[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [userSearch, setUserSearch] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "", description: "", price: 0, stock: 0,
    image1: "", image2: "", image3: "", category: "",
  });

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "users" | "products" | "create" | "reviews" | "wishlists" | "contacts" | "orders"
  >("users");

  // ─────────────────────────────────────────────────────────────────────────────
  //  Data fetching (unchanged logic)
  // ─────────────────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    if (!token || activeTab !== "reviews") return;
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
  }, [token, activeTab]);

  useEffect(() => {
    if (!token || activeTab !== "wishlists") return;
    const fetchWishlists = async () => {
      setIsLoading(true);
      try {
        const api = createApiInstance(token);
        const res = await api.get<WishlistGroup[]>("/wishlist/all", { withCredentials: true });
        setWishlists(res.data);
      } catch {
        toast.error("Failed to load wishlists");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlists();
  }, [token, activeTab]);

  useEffect(() => {
    if (!token || activeTab !== "contacts") return;
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const api = createApiInstance(token);
        const res = await api.get<Contact[]>("/contact/all", { withCredentials: true });
        setContacts(res.data);
      } catch {
        toast.error("Failed to load contact submissions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, [token, activeTab]);

  useEffect(() => {
    if (!token || activeTab !== "orders") return;
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const api = createApiInstance(token);
        const res = await api.get<Order[]>("/order/all", { withCredentials: true });
        setOrders(res.data);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [token, activeTab]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    return users.filter(u =>
      `${u.firstname} ${u.lastname}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
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
      toast.success("Product created successfully!", { autoClose: 5000 });
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
      toast.success("Product updated successfully!");
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
      toast.success("Product deleted successfully!");
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
      toast.success("Role updated successfully!");
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
      toast.success("User deleted successfully!");
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  }, [token, userId]);

  const handleDeleteContact = useCallback(async (id: number) => {
    if (!window.confirm("Delete this contact message?")) return;
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.delete(`/contact/${id}`, { withCredentials: true });
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success("Contact message deleted successfully!");
    } catch {
      toast.error("Failed to delete contact message");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleDeleteOrder = useCallback(async (id: number) => {
    if (!window.confirm("Delete this order? This action cannot be undone.")) return;
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.delete(`/order/${id}`, { withCredentials: true });
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success("Order deleted successfully!");
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleViewOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
  }, []);

  const inputFields = [
    { key: "name", label: "Product Name *", type: "text" },
    { key: "description", label: "Description", type: "text" },
    { key: "price", label: "Price (KES) *", type: "number" },
    { key: "stock", label: "Stock Quantity *", type: "number" },
    { key: "image1", label: "Image 1 URL *", type: "text" },
    { key: "image2", label: "Image 2 URL", type: "text" },
    { key: "image3", label: "Image 3 URL", type: "text" },
  ];

  const tabs = [
    { id: "users", label: "Users", icon: Users, accent: "blue" },
    { id: "create", label: "Create Product", icon: PlusCircle, accent: "green" },
    { id: "products", label: "Products", icon: Package, accent: "purple" },
    { id: "reviews", label: "Reviews", icon: Star, accent: "yellow" },
    { id: "wishlists", label: "Wishlists", icon: Heart, accent: "pink" },
    { id: "contacts", label: "Contacts", icon: Mail, accent: "indigo" },
    { id: "orders", label: "Orders", icon: ShoppingCart, accent: "rose" },
  ] as const;

  type TabId = typeof tabs[number]["id"];

  const getAccent = (accent: string) => ({
    bg: `bg-${accent}-50`,
    border: `border-${accent}-200`,
    text: `text-${accent}-700`,
    hover: `hover:bg-${accent}-100`,
  });

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 text-gray-900 mt-10">

        {/* ── Main Content with Tabs ── */}
        <main className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">

          <header className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600 flex items-center gap-2">
              Welcome, {firstname} {lastname} • {new Date().toLocaleDateString()}
            </p>
          </header>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-2 mb-10 border-b border-gray-200 pb-2 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon, accent }) => {
              const isActive = activeTab === id;
              const { bg, border, text, hover } = getAccent(accent);
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-light transition-all
                    ${isActive ? `${bg} ${border} shadow-sm ${text}` : "text-gray-600 hover:bg-gray-100"}
                  `}
                >
                  <Icon size={18} />
                  {label}
                </button>
              );
            })}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-3xl font-light flex items-center gap-3">
                    <Users className="text-blue-500" size={28} />
                    Users
                  </h2>
                  <div className="text-gray-600">
                    Total: <span className="text-gray-900 font-medium">{users.length}</span>
                  </div>
                </div>

                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full pl-11 pr-5 py-3.5 bg-white border border-gray-300 rounded-xl placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 outline-none transition"
                  />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">User</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Email</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Phone</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Role</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-16 text-gray-500">
                              {userSearch ? "No matching users found" : "No users yet"}
                            </td>
                          </tr>
                        ) : filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                                  {u.firstname[0]}{u.lastname[0]}
                                </div>
                                <div>
                                  <div className="font-medium">{u.firstname} {u.lastname}</div>
                                  <div className="text-xs text-gray-500">ID: {u.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-gray-700 text-sm">{u.email}</td>
                            <td className="px-6 py-5 text-gray-600 text-sm">{u.phone || "—"}</td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex px-3.5 py-1 rounded-full text-xs font-medium border ${
                                u.role === "admin"
                                  ? "bg-purple-50 text-purple-600 border-purple-200"
                                  : "bg-green-50 text-green-600 border-green-200"
                              }`}>
                                {u.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditUser(u)}
                                  className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 hover:text-blue-700 transition"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  disabled={u.id === userId}
                                  className="p-2.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-light flex items-center gap-3 mb-10">
                  <PlusCircle className="text-green-500" size={28} />
                  Create New Product
                </h2>

                <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-12 shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                    {inputFields.map(({ key, label, type = "text" }) => (
                      <div key={key}>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2.5">{label}</label>
                        <input
                          type={type}
                          value={newProduct[key as keyof typeof newProduct] as string | number}
                          onChange={e => setNewProduct(prev => ({
                            ...prev,
                            [key]: type === "number"
                              ? (key === "price" ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)
                              : e.target.value
                          }))}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-xl placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-300 outline-none transition text-sm"
                          required={label.includes("*")}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2.5">Category *</label>
                      <select
                        value={newProduct.category}
                        onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-300 outline-none transition text-sm"
                        required
                      >
                        <option value="" disabled>Select category</option>
                        {["tops","bottoms","dresses","outerwear","shirts","sweaters"].map(c => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="mt-10 w-full sm:w-auto px-12 py-4 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl disabled:opacity-60 transition shadow-lg shadow-green-300/30"
                  >
                    {isLoading ? "Creating..." : "Create Product"}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                  <h2 className="text-3xl font-light flex items-center gap-3">
                    <Package className="text-purple-500" size={28} />
                    Products
                  </h2>
                  <div className="text-gray-600">
                    Total: <span className="text-gray-900 font-medium">{products.length}</span>
                  </div>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-32 text-gray-600">
                    No products have been added yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                    {products.map(p => (
                      <motion.div
                        key={p.id}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg transition-shadow hover:shadow-xl"
                      >
                        <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                          <img
                            src={p.image1 || "https://via.placeholder.com/500x600?text=No+Image"}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-medium truncate mb-2">{p.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[3rem]">
                            {p.description || "No description provided"}
                          </p>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-2xl font-light">KSh {p.price.toFixed(2)}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-5">
                            <div className="flex items-center gap-1.5">
                              <Tag size={14} /> {p.category}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} /> Stock: {p.stock}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => setEditProduct(p)}
                              className="flex-1 py-3 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 text-purple-600 text-sm transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="flex-1 py-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 text-red-600 text-sm transition"
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

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                  <h2 className="text-3xl font-light flex items-center gap-3">
                    <Star className="text-yellow-500" size={28} />
                    Customer Reviews
                  </h2>
                  <div className="text-gray-600">
                    Total: <span className="text-gray-900 font-medium">{reviews.length}</span>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-32 text-gray-600">
                    No reviews have been submitted yet.
                  </div>
                ) : (
                  <div className="space-y-8">
                    {reviews.map(r => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-lg"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                          <div>
                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4 shadow-inner">
                              <img
                                src={r.product.image1}
                                alt={r.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-center text-sm font-medium text-gray-900">{r.product.name}</p>
                          </div>

                          <div className="lg:col-span-2 space-y-5">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-yellow-600 font-medium shrink-0">
                                {r.user.firstname[0]}{r.user.lastname[0]}
                              </div>
                              <div>
                                <p className="font-medium">{r.user.firstname} {r.user.lastname}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {new Date(r.created_at).toLocaleDateString("en-GB", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-1">
                              {[1,2,3,4,5].map(i => (
                                <StarIcon
                                  key={i}
                                  size={20}
                                  className={i <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                                />
                              ))}
                            </div>

                            <p className="text-gray-700 leading-relaxed">
                              {r.comment || "No comment provided."}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "wishlists" && (
              <motion.div
                key="wishlists"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                  <h2 className="text-3xl font-light flex items-center gap-3">
                    <Heart className="text-pink-500" size={28} />
                    All Wishlists
                  </h2>
                  <div className="text-gray-600">
                    Users with items: <span className="text-gray-900 font-medium">{wishlists.length}</span>
                  </div>
                </div>

                {wishlists.length === 0 ? (
                  <div className="text-center py-32 text-gray-600">
                    No wishlists created yet.
                  </div>
                ) : (
                  <div className="space-y-10">
                    {wishlists.map(group => (
                      <div
                        key={group.user_id}
                        className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-lg"
                      >
                        <h3 className="text-xl font-medium mb-6 flex items-center gap-3">
                          <UserCircle size={22} className="text-pink-500" />
                          {group.user_name}
                          <span className="text-gray-500 text-base ml-2">
                            ({group.items.length} items)
                          </span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {group.items.map(item => (
                            <div
                              key={item.product_id}
                              className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:border-pink-200 transition-colors"
                            >
                              <img
                                src={item.image1 || "https://via.placeholder.com/400x500?text=No+Image"}
                                alt={item.name}
                                className="w-full h-52 object-cover"
                              />
                              <div className="p-5">
                                <h4 className="font-medium mb-2 line-clamp-2">{item.name}</h4>
                                <p className="text-lg font-light text-pink-600">
                                  KSh {item.price.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  Added {new Date(item.added_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "contacts" && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                  <h2 className="text-3xl font-light flex items-center gap-3">
                    <Mail className="text-indigo-500" size={28} />
                    Contact Submissions
                  </h2>
                  <div className="text-gray-600">
                    Total: <span className="text-gray-900 font-medium">{contacts.length}</span>
                  </div>
                </div>

                {contacts.length === 0 ? (
                  <div className="text-center py-32 text-gray-600">
                    No contact messages received yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-lg">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Name</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Email</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Subject</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Message</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Date</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {contacts.map(c => (
                          <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-5 font-medium text-gray-900">{c.name}</td>
                            <td className="px-6 py-5 text-gray-700">{c.email || "—"}</td>
                            <td className="px-6 py-5 text-gray-800">{c.subject}</td>
                            <td className="px-6 py-5 text-gray-700 max-w-md truncate">{c.message}</td>
                            <td className="px-6 py-5 text-gray-600 text-sm">
                              {new Date(c.created_at).toLocaleDateString("en-GB", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => toast.info(`Message:\n\n${c.message}`, { autoClose: false })}
                                  className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition"
                                >
                                  <MessageSquare size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteContact(c.id)}
                                  className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                  <h2 className="text-3xl font-light flex items-center gap-3">
                    <ShoppingCart className="text-rose-500" size={28} />
                    Manage Orders
                  </h2>
                  <div className="text-gray-600">
                    Total: <span className="text-gray-900 font-medium">{orders.length}</span>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-32 text-gray-600">
                    No orders have been placed yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200 shadow-lg">
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Order ID</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Customer</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Total</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Status</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Payment</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Date</th>
                          <th className="px-6 py-5 text-left text-xs uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-5 font-medium text-gray-900">#{o.id}</td>
                            <td className="px-6 py-5 text-gray-800">{o.user_name || "—"}</td>
                            <td className="px-6 py-5 text-gray-900">
                              {o.total != null ? `KSh ${Number(o.total).toFixed(2)}` : "—"}
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex px-3.5 py-1 rounded-full text-xs font-medium border ${
                                o.status?.includes("delivered") || o.status?.includes("completed")
                                  ? "bg-green-50 text-green-600 border-green-200"
                                  : o.status?.includes("shipped")
                                  ? "bg-blue-50 text-blue-600 border-blue-200"
                                  : o.status?.includes("paid")
                                  ? "bg-purple-50 text-purple-600 border-purple-200"
                                  : o.status === "cod"
                                  ? "bg-orange-50 text-orange-600 border-orange-200"
                                  : o.status?.includes("cancelled")
                                  ? "bg-red-50 text-red-600 border-red-200"
                                  : "bg-yellow-50 text-yellow-600 border-yellow-200"
                              }`}>
                                {o.status?.toUpperCase() || "UNKNOWN"}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-gray-700 text-sm">
                              {o.status === "cod" ? "Cash on Delivery" : "Prepaid"}
                            </td>
                            <td className="px-6 py-5 text-gray-600 text-sm">
                              {o.created_at
                                ? new Date(o.created_at).toLocaleDateString("en-GB", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })
                                : "—"}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewOrder(o)}
                                  className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition"
                                >
                                  <Calendar size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(o.id)}
                                  className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── EDIT PRODUCT MODAL ── */}
          <AnimatePresence>
            {editProduct && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-8"
              >
                <motion.div
                  initial={{ scale: 0.92, y: 40 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.92, y: 40 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 lg:p-12 w-full max-w-4xl max-h-[92vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-light flex items-center gap-3">
                      <Edit size={26} className="text-purple-500" />
                      Edit Product
                    </h2>
                    <button
                      onClick={() => setEditProduct(null)}
                      className="p-3 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                    {inputFields.map(({ key, label, type = "text" }) => (
                      <div key={key}>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2.5">{label}</label>
                        <input
                          type={type}
                          value={editProduct[key as keyof Product] as string | number}
                          onChange={e => setEditProduct(prev => prev ? ({
                            ...prev,
                            [key]: type === "number"
                              ? (key === "price" ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)
                              : e.target.value
                          }) : null)}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-xl placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-300 outline-none transition text-sm"
                          required={label.includes("*")}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2.5">Category *</label>
                      <select
                        value={editProduct.category}
                        onChange={e => setEditProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-300 outline-none transition text-sm"
                        required
                      >
                        <option value="" disabled>Select category</option>
                        {["tops","bottoms","dresses","outerwear","shirts","sweaters"].map(c => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleUpdate}
                      disabled={isLoading}
                      className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl disabled:opacity-60 transition shadow-lg shadow-purple-300/30"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditProduct(null)}
                      className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── EDIT USER ROLE MODAL ── */}
          <AnimatePresence>
            {editUser && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-8"
              >
                <motion.div
                  initial={{ scale: 0.92, y: 40 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.92, y: 40 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 lg:p-10 w-full max-w-lg"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-light flex items-center gap-3">
                      <ShieldCheck size={24} className="text-purple-500" />
                      Edit User Role
                    </h2>
                    <button
                      onClick={() => setEditUser(null)}
                      className="p-3 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <div className="space-y-5 mb-10 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="text-gray-900 font-medium">{editUser.firstname} {editUser.lastname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900 font-medium">{editUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-900 font-medium">{editUser.phone || "—"}</span>
                    </div>
                  </div>

                  <select
                    value={editUser.role}
                    onChange={e => setEditUser(prev => prev ? { ...prev, role: e.target.value as "user" | "admin" } : null)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-300 outline-none transition mb-10"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleUpdateUserRole}
                      disabled={isLoading}
                      className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl disabled:opacity-60 transition shadow-lg shadow-purple-300/30"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditUser(null)}
                      className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── ORDER DETAILS MODAL ── */}
          <AnimatePresence>
            {selectedOrder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-8"
              >
                <motion.div
                  initial={{ scale: 0.92, y: 40 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.92, y: 40 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 lg:p-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-light flex items-center gap-3">
                      <ShoppingCart size={24} className="text-rose-500" />
                      Order #{selectedOrder.id}
                    </h2>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-3 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Customer</p>
                      <p className="text-gray-900 font-medium">{selectedOrder.user_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Total Amount</p>
                      <p className="text-gray-900 font-medium text-lg">
                        {selectedOrder.total != null ? `KSh ${Number(selectedOrder.total).toFixed(2)}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Status</p>
                      <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mt-1 border ${
                        selectedOrder.status?.includes("delivered") || selectedOrder.status?.includes("completed")
                          ? "bg-green-50 text-green-600 border-green-200"
                          : selectedOrder.status?.includes("shipped")
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : selectedOrder.status?.includes("paid")
                          ? "bg-purple-50 text-purple-600 border-purple-200"
                          : selectedOrder.status === "cod"
                          ? "bg-orange-50 text-orange-600 border-orange-200"
                          : selectedOrder.status?.includes("cancelled")
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-yellow-50 text-yellow-600 border-yellow-200"
                      }`}>
                        {selectedOrder.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Payment Type</p>
                      <p className="text-gray-900 font-medium">
                        {selectedOrder.status === "cod" ? "Cash on Delivery" : "Prepaid"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Order Date</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(selectedOrder.created_at).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition text-gray-700"
                    >
                      Close
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