import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaHome, FaShoppingBag, FaCreditCard, FaHeart, FaSignOutAlt, FaBars, FaTimes, FaStar, FaQuestionCircle, FaHeadset } from "react-icons/fa";

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
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      cod: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-200 text-green-900",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
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

      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row">
          {/* Mobile Header with Menu Toggle */}
          <div className="lg:hidden bg-black text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-light underline">Client Dashboard</h2>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Side Navigation */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: mobileMenuOpen || window.innerWidth >= 1024 ? 0 : -300 }}
            transition={{ duration: 0.3 }}
            className={`lg:w-64 bg-black text-white h-screen lg:h-auto lg:sticky lg:top-0 overflow-y-auto border-r border-gray-800 lg:block fixed lg:relative z-40 transform ${
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
          >
            <div className="p-6">
              <h2 className="text-2xl font-extralight mb-10 hidden lg:block underline">Client Dashboard</h2>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-left ${
                      activeTab === item.id
                        ? "bg-white/10 text-white font-medium"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-xl opacity-80">{item.icon}</span>
                    <span className="text-lg font-light">{item.label}</span>
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-red-400 hover:bg-red-950/30 transition-all text-left mt-8"
                >
                  <FaSignOutAlt className="text-xl" />
                  <span className="text-lg font-light">Logout</span>
                </button>
              </nav>
            </div>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-10">
            {/* Welcome Message - Visible on ALL screens */}
            {profile && (
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-3xl lg:text-4xl font-extralight text-gray-900">
                  Welcome back, {profile.firstname} {profile.lastname}!
                </h1>
                <p className="mt-2 text-gray-600">{profile.email}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                {error}
              </div>
            ) : (
              <>
                {/* Overview */}
                {activeTab === "overview" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Total Orders</h3>
                        <p className="text-4xl font-light text-black">{orders.length}</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Pending</h3>
                        <p className="text-4xl font-light text-yellow-600">
                          {orders.filter(o => o.status === "pending").length}
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Delivered</h3>
                        <p className="text-4xl font-light text-green-600">
                          {orders.filter(o => o.status === "delivered").length}
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Total Reviews</h3>
                        <p className="text-4xl font-light text-purple-600">{reviews.length}</p>
                      </div>
                    </div>

                    {/* Wishlist Preview (placeholder) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center gap-3">
                        <FaHeart className="text-red-500" /> My Wishlist
                      </h3>
                      <p className="text-gray-600">
                        You have <strong>0 items</strong> in your wishlist.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Start adding products you love!
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* My Orders */}
                {activeTab === "orders" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <h2 className="text-2xl font-extralight text-gray-900">My Orders</h2>

                    {orders.length === 0 ? (
                      <div className="bg-white p-10 rounded-2xl shadow-sm text-center text-gray-600">
                        You haven't placed any orders yet.
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Items</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Total</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-5 text-sm text-gray-600">
                                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                  </td>
                                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                                    KSh {order.total.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    {getStatusBadge(order.status)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Payments */}
                {activeTab === "payments" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <h2 className="text-2xl font-extralight text-gray-900">Payments & Transactions</h2>
                    <div className="bg-white p-10 rounded-2xl shadow-sm text-center text-gray-600">
                      <p>Your payment history and transaction details will appear here.</p>
                      <p className="mt-4 text-sm">M-Pesa, card payments, and refunds coming soon.</p>
                    </div>
                  </motion.div>
                )}

                {/* Reviews */}
                {activeTab === "reviews" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <h2 className="text-2xl font-extralight text-gray-900">My Reviews</h2>

                    {reviews.length === 0 ? (
                      <div className="bg-white p-10 rounded-2xl shadow-sm text-center text-gray-600">
                        You haven't written any reviews yet.
                        <p className="mt-4 text-sm">Share your thoughts on products you've purchased!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-800 mb-2">{review.product_name}</h4>
                            <p className="text-gray-600">{review.comment || "No comment provided."}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Wishlist */}
                {activeTab === "wishlist" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <h2 className="text-2xl font-extralight text-gray-900">My Wishlist</h2>
                    <div className="bg-white p-10 rounded-2xl shadow-sm text-center text-gray-600">
                      <p>Your wishlist is currently empty.</p>
                      <p className="mt-4 text-sm">Start adding products you love!</p>
                    </div>
                  </motion.div>
                )}

                {/* Help & Support */}
                {activeTab === "support" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <h2 className="text-2xl font-extralight text-gray-900">Help & Support</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-medium text-gray-800 mb-6 flex items-center gap-3">
                          <FaHeadset className="text-2xl text-black" /> Get in Touch
                        </h3>
                        <div className="space-y-4 text-gray-700">
                          <p><strong>Email:</strong> support@herocloth.com</p>
                          <p><strong>Phone:</strong> +254 700 000 000 (Mon–Sat, 8AM–8PM)</p>
                          <p><strong>WhatsApp:</strong> +254 700 000 000</p>
                        </div>
                      </div>

                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-medium text-gray-800 mb-6">Frequently Asked Questions</h3>
                        <div className="space-y-6">
                          <div>
                            <p className="font-medium text-gray-800">How long does delivery take?</p>
                            <p className="text-gray-600 mt-1">Within Nairobi: 1–3 days. Outside Nairobi: 3–7 days.</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">What is your return policy?</p>
                            <p className="text-gray-600 mt-1">Returns accepted within 7 days for unused items in original packaging.</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">How do I track my order?</p>
                            <p className="text-gray-600 mt-1">Check status in "My Orders" or contact support.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                      <p className="text-lg text-gray-700 mb-4">Need immediate help? We're here 24/7.</p>
                      <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <a href="mailto:support@herocloth.com" className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition">
                          Email Support
                        </a>
                        <a href="tel:+254700000000" className="bg-gray-100 text-black px-8 py-4 rounded-xl hover:bg-gray-200 transition">
                          Call Us
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ClientDashboard;