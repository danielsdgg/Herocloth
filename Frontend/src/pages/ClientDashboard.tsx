import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaHome, FaShoppingBag, FaCreditCard, FaHeart, FaSignOutAlt, FaBars, FaTimes, FaStar, FaQuestionCircle, FaHeadset, FaUserCircle, FaCalendarAlt, FaDollarSign, FaTruck, FaCommentDots } from "react-icons/fa";

interface Order {
  id: number;
  status: string;
  total: number;
  created_at: string;
  items: { product_name: string; quantity: number; price: number }[];
}

interface Review {
  id: number;
  product_id: number;
  product_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const ClientDashboard: React.FC = () => {
  const { token, role, clearAuth } = useAuth();
  const navigate = useNavigate();
  const api = useMemo(() => createApiInstance(token), [token]);

  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "payments" | "reviews" | "wishlist" | "support">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<{ firstname: string; lastname: string; email: string; phone?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to access your dashboard");
      navigate("/login");
      return;
    }

    if (role === "admin") {
      toast.info("Admins should use the admin dashboard");
      navigate("/admin");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Profile
        const profileRes = await api.get("/user/profile");
        setProfile(profileRes.data);

        // Orders
        const ordersRes = await api.get("/order/my-orders");
        setOrders(ordersRes.data);

        // Reviews (for Reviews tab + Overview count)
        const reviewsRes = await api.get("/review/my-reviews");
        setReviews(reviewsRes.data);
      } catch (err: any) {
        const msg = err.response?.data?.msg || "Failed to load dashboard data";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, role, navigate, api]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600 ring-yellow-500/20",
      paid: "bg-green-500/10 text-green-600 ring-green-500/20",
      cod: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
      shipped: "bg-purple-500/10 text-purple-600 ring-purple-500/20",
      delivered: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
      cancelled: "bg-red-500/10 text-red-600 ring-red-500/20",
    };
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-medium ring-1 ring-inset ${colors[status] || "bg-gray-500/10 text-gray-600 ring-gray-500/20"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: <FaHome /> },
    { id: "orders", label: "My Orders", icon: <FaShoppingBag /> },
    { id: "payments", label: "Payments", icon: <FaCreditCard /> },
    { id: "reviews", label: "Reviews", icon: <FaStar /> },
    { id: "wishlist", label: "Wishlist", icon: <FaHeart /> },
    { id: "support", label: "Help & Support", icon: <FaQuestionCircle /> },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col lg:flex-row">
          {/* Mobile Header with Menu Toggle */}
          <div className="lg:hidden bg-gradient-to-r from-black to-gray-900 text-white p-6 flex justify-between items-center shadow-lg">
            <h2 className="text-2xl font-extralight tracking-wide underline underline-offset-4">Client Dashboard</h2>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-full hover:bg-white/10 transition">
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Side Navigation */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: mobileMenuOpen || window.innerWidth >= 1024 ? 0 : -300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`lg:w-72 bg-gradient-to-b from-black to-gray-900 text-white h-screen lg:h-auto lg:sticky lg:top-0 overflow-y-auto lg:block fixed lg:relative z-50 shadow-2xl lg:shadow-none transform ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
          >
            <div className="p-8">
              <div className="hidden lg:block mb-12">
                <h2 className="text-3xl font-extralight tracking-wider underline underline-offset-8">Client Dashboard</h2>
              </div>

              {/* Profile Section in Sidebar */}
              {profile && (
                <div className="flex flex-col items-center mb-12 border-b border-white/10 pb-8">
                  <FaUserCircle className="text-6xl text-white/60 mb-4" />
                  <h3 className="text-xl font-light text-white">
                    {profile.firstname} {profile.lastname}
                  </h3>
                  <p className="text-sm text-white/70 mt-1">{profile.email}</p>
                </div>
              )}

              <nav className="space-y-3">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-left ${
                      activeTab === item.id
                        ? "bg-white/10 text-white font-medium shadow-md"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-lg font-light tracking-wide">{item.label}</span>
                  </motion.button>
                ))}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all text-left mt-12"
                >
                  <FaSignOutAlt className="text-2xl" />
                  <span className="text-lg font-light tracking-wide">Logout</span>
                </motion.button>
              </nav>
            </div>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 p-8 lg:p-12">
            {/* Welcome Message - Visible on ALL screens */}
            {profile && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12 text-center lg:text-left"
              >
                <h1 className="text-4xl lg:text-5xl font-extralight text-gray-900 tracking-tight">
                  Welcome back, {profile.firstname} {profile.lastname}!
                </h1>
                <p className="mt-3 text-lg text-gray-600">{profile.email}</p>
              </motion.div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-96">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-16 w-16 border-t-4 border-b-4 border-black"
                ></motion.div>
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl shadow-md"
              >
                {error}
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-12"
                >
                  {/* Overview */}
                  {activeTab === "overview" && (
                    <div className="space-y-12">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                          { title: "Total Orders", value: orders.length, color: "text-black", icon: <FaShoppingBag className="text-4xl text-gray-700" /> },
                          { title: "Pending", value: orders.filter(o => o.status === "pending").length, color: "text-yellow-600", icon: <FaCalendarAlt className="text-4xl text-yellow-600" /> },
                          { title: "Delivered", value: orders.filter(o => o.status === "delivered").length, color: "text-emerald-600", icon: <FaTruck className="text-4xl text-emerald-600" /> },
                          { title: "Total Reviews", value: reviews.length, color: "text-purple-600", icon: <FaStar className="text-4xl text-purple-600" /> },
                        ].map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow"
                          >
                            <div className="flex justify-center mb-4">{stat.icon}</div>
                            <h3 className="text-xl font-medium text-gray-700 mb-3">{stat.title}</h3>
                            <p className={`text-5xl font-extralight ${stat.color}`}>{stat.value}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Wishlist Preview (placeholder) */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                      >
                        <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center gap-4">
                          <FaHeart className="text-red-500 text-3xl" /> My Wishlist
                        </h3>
                        <p className="text-xl text-gray-600">
                          You have <strong>0 items</strong> in your wishlist.
                        </p>
                        <p className="text-md text-gray-500 mt-4">
                          Discover and save premium products tailored for you.
                        </p>
                      </motion.div>
                    </div>
                  )}

                  {/* My Orders */}
                  {activeTab === "orders" && (
                    <div className="space-y-12">
                      <h2 className="text-3xl font-extralight text-gray-900 tracking-wide">My Orders</h2>

                      {orders.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl shadow-lg text-center text-gray-600">
                          You haven't placed any orders yet. Explore our collection!
                        </div>
                      ) : (
                        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50/50">
                                <tr>
                                  <th className="px-8 py-5 text-left text-md font-medium text-gray-700">Date</th>
                                  <th className="px-8 py-5 text-left text-md font-medium text-gray-700">Items</th>
                                  <th className="px-8 py-5 text-left text-md font-medium text-gray-700">Total</th>
                                  <th className="px-8 py-5 text-left text-md font-medium text-gray-700">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {orders.map((order) => (
                                  <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    whileHover={{ backgroundColor: "#f9fafb" }}
                                    className="transition-colors"
                                  >
                                    <td className="px-8 py-6 whitespace-nowrap text-md text-gray-600">
                                      {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-md text-gray-600">
                                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-md font-medium text-gray-900">
                                      KSh {order.total.toFixed(2)}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                      {getStatusBadge(order.status)}
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payments */}
                  {activeTab === "payments" && (
                    <div className="space-y-12">
                      <h2 className="text-3xl font-extralight text-gray-900 tracking-wide">Payments & Transactions</h2>
                      <div className="bg-white p-12 rounded-3xl shadow-lg text-center text-gray-600">
                        <FaDollarSign className="text-6xl text-gray-400 mb-6 mx-auto" />
                        <p className="text-xl">Your payment history and transaction details will appear here.</p>
                        <p className="mt-6 text-md">Secure M-Pesa, card payments, and refunds integration coming soon.</p>
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  {activeTab === "reviews" && (
                    <div className="space-y-12">
                      <h2 className="text-3xl font-extralight text-gray-900 tracking-wide">My Reviews</h2>

                      {reviews.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl shadow-lg text-center text-gray-600">
                          <FaCommentDots className="text-6xl text-gray-400 mb-6 mx-auto" />
                          You haven't written any reviews yet.
                          <p className="mt-6 text-md">Share your experiences with our premium products!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {reviews.map((review, index) => (
                            <motion.div
                              key={review.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`text-2xl ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-md text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="font-medium text-xl text-gray-800 mb-4">{review.product_name}</h4>
                              <p className="text-gray-600 leading-relaxed">{review.comment || "No comment provided."}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wishlist */}
                  {activeTab === "wishlist" && (
                    <div className="space-y-12">
                      <h2 className="text-3xl font-extralight text-gray-900 tracking-wide">My Wishlist</h2>
                      <div className="bg-white p-12 rounded-3xl shadow-lg text-center text-gray-600">
                        <FaHeart className="text-6xl text-red-400 mb-6 mx-auto" />
                        <p className="text-xl">Your wishlist is currently empty.</p>
                        <p className="mt-6 text-md">Curate your collection of favorite high-end items!</p>
                      </div>
                    </div>
                  )}

                  {/* Help & Support */}
                  {activeTab === "support" && (
                    <div className="space-y-12">
                      <h2 className="text-3xl font-extralight text-gray-900 tracking-wide">Help & Support</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                        >
                          <h3 className="text-2xl font-light text-gray-800 mb-8 flex items-center gap-4">
                            <FaHeadset className="text-3xl text-black" /> Get in Touch
                          </h3>
                          <div className="space-y-6 text-gray-700 text-lg">
                            <p><strong>Email:</strong> support@herocloth.com</p>
                            <p><strong>Phone:</strong> +254 700 000 000 (Mon–Sat, 8AM–8PM)</p>
                            <p><strong>WhatsApp:</strong> +254 700 000 000</p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                        >
                          <h3 className="text-2xl font-light text-gray-800 mb-8">Frequently Asked Questions</h3>
                          <div className="space-y-8 text-lg">
                            <div>
                              <p className="font-medium text-gray-800">How long does delivery take?</p>
                              <p className="text-gray-600 mt-2">Within Nairobi: 1–3 days. Outside Nairobi: 3–7 days.</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">What is your return policy?</p>
                              <p className="text-gray-600 mt-2">Returns accepted within 7 days for unused items in original packaging.</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">How do I track my order?</p>
                              <p className="text-gray-600 mt-2">Check status in "My Orders" or contact support.</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow"
                      >
                        <p className="text-xl text-gray-700 mb-8">Need immediate help? We're here 24/7.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="mailto:support@herocloth.com"
                            className="bg-black text-white px-10 py-5 rounded-2xl hover:bg-gray-800 transition shadow-md"
                          >
                            Email Support
                          </motion.a>
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="tel:+254700000000"
                            className="bg-gray-100 text-black px-10 py-5 rounded-2xl hover:bg-gray-200 transition shadow-md"
                          >
                            Call Us
                          </motion.a>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ClientDashboard;