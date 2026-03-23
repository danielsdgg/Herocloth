import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaHome,
  FaShoppingBag,
  FaCreditCard,
  FaStar,
  FaHeart,
  FaHeadset,
  FaTruck,
  FaDollarSign,
  FaCalendarAlt,
  FaCommentDots,
} from "react-icons/fa";

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

  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "payments" | "reviews" | "wishlist" | "support"
  >("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<{
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Reviews
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
      delivered: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaHome /> },
    { id: "orders", label: "Orders", icon: <FaShoppingBag /> },
    { id: "payments", label: "Payments", icon: <FaCreditCard /> },
    { id: "reviews", label: "Reviews", icon: <FaStar /> },
    { id: "wishlist", label: "Wishlist", icon: <FaHeart /> },
    { id: "support", label: "Support", icon: <FaHeadset /> },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen mt-8 bg-gray-50">
        {/* Welcome Header */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border-b border-gray-200 py-10 md:py-14"
          >
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 text-4xl font-medium shadow-md">
                  {profile.firstname[0]}
                  {profile.lastname[0]}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
                    Welcome back, {profile.firstname} {profile.lastname}
                  </h1>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs Navigation (Horizontal on desktop, scrollable) */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto py-4 gap-2 no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm md:text-base font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg md:text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-16">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"
              />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center shadow-sm">
              {error}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                {/* ── OVERVIEW ──────────────────────────────────────── */}
                {activeTab === "overview" && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        {
                          title: "Total Orders",
                          value: orders.length,
                          icon: <FaShoppingBag className="text-3xl text-indigo-600" />,
                        },
                        {
                          title: "Pending",
                          value: orders.filter((o) => o.status === "pending").length,
                          icon: <FaCalendarAlt className="text-3xl text-yellow-600" />,
                        },
                        {
                          title: "Delivered",
                          value: orders.filter((o) => o.status === "delivered").length,
                          icon: <FaTruck className="text-3xl text-emerald-600" />,
                        },
                        {
                          title: "Reviews",
                          value: reviews.length,
                          icon: <FaStar className="text-3xl text-amber-600" />,
                        },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
                        >
                          <div className="mb-4 flex justify-center">{stat.icon}</div>
                          <h3 className="text-lg font-medium text-gray-700 mb-2">{stat.title}</h3>
                          <p className="text-4xl font-light text-gray-900">{stat.value}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Recent Orders Preview */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                      <h3 className="text-2xl font-light text-gray-900 mb-6">Recent Orders</h3>
                      {orders.length === 0 ? (
                        <p className="text-gray-600 text-center py-12">
                          You haven't placed any orders yet.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {orders.slice(0, 3).map((order) => (
                            <div
                              key={order.id}
                              className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  Order #{order.id}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  KSh {order.total.toFixed(2)}
                                </p>
                                {getStatusBadge(order.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── ORDERS ────────────────────────────────────────── */}
                {activeTab === "orders" && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-light text-gray-900">My Orders</h2>

                    {orders.length === 0 ? (
                      <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-gray-600 border border-gray-100">
                        <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-6" />
                        <p className="text-xl">No orders yet</p>
                        <p className="mt-4">Start shopping to see your orders here!</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Items</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Total</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-5 text-sm text-gray-900">#{order.id}</td>
                                  <td className="px-6 py-5 text-sm text-gray-600">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-5 text-sm text-gray-600">
                                    {order.items.length} item{order.items.length !== 1 && "s"}
                                  </td>
                                  <td className="px-6 py-5 text-sm font-medium text-gray-900">
                                    KSh {order.total.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-5">{getStatusBadge(order.status)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── PAYMENTS ──────────────────────────────────────── */}
                {activeTab === "payments" && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-light text-gray-900">Payments & Transactions</h2>
                    <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-gray-600 border border-gray-100">
                      <FaDollarSign className="text-7xl text-indigo-200 mx-auto mb-8" />
                      <p className="text-xl font-medium mb-4">No transactions yet</p>
                      <p className="text-gray-600">
                        Your payment history will appear here once you make a purchase.
                      </p>
                      <p className="mt-6 text-sm text-gray-500">
                        Secure payments via M-Pesa, card, and more coming soon.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── REVIEWS ───────────────────────────────────────── */}
                {activeTab === "reviews" && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-light text-gray-900">My Reviews</h2>

                    {reviews.length === 0 ? (
                      <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-gray-600 border border-gray-100">
                        <FaCommentDots className="text-7xl text-indigo-200 mx-auto mb-8" />
                        <p className="text-xl font-medium mb-4">No reviews yet</p>
                        <p className="text-gray-600">
                          Share your thoughts on products you've purchased!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.map((review, i) => (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex">
                                {[...Array(5)].map((_, idx) => (
                                  <FaStar
                                    key={idx}
                                    className={`text-xl ${
                                      idx < review.rating ? "text-amber-500" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-medium text-lg text-gray-900 mb-2">
                              {review.product_name}
                            </h4>
                            <p className="text-gray-700 leading-relaxed">
                              {review.comment || "No comment added."}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── WISHLIST ──────────────────────────────────────── */}
                {activeTab === "wishlist" && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-light text-gray-900">My Wishlist</h2>
                    <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-gray-600 border border-gray-100">
                      <FaHeart className="text-7xl text-rose-200 mx-auto mb-8" />
                      <p className="text-xl font-medium mb-4">Your wishlist is empty</p>
                      <p className="text-gray-600">
                        Save items you love for later — they'll be waiting for you.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── SUPPORT ───────────────────────────────────────── */}
                {activeTab === "support" && (
                  <div className="space-y-12">
                    <h2 className="text-3xl font-light text-gray-900">Help & Support</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-4">
                          <FaHeadset className="text-indigo-600 text-3xl" /> Contact Us
                        </h3>
                        <div className="space-y-5 text-gray-700">
                          <p>
                            <strong>Email:</strong>{" "}
                            <a
                              href="mailto:support@herocloth.com"
                              className="text-indigo-600 hover:underline"
                            >
                              support@herocloth.com
                            </a>
                          </p>
                          <p>
                            <strong>Phone/WhatsApp:</strong>{" "}
                            <a href="tel:+254707319080" className="text-indigo-600 hover:underline">
                              +254 707 319 080
                            </a>
                          </p>
                          <p className="text-sm text-gray-500">
                            Mon–Sat: 8AM – 8PM EAT
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="text-2xl font-medium text-gray-900 mb-6">
                          Frequently Asked Questions
                        </h3>
                        <div className="space-y-6 text-gray-700">
                          <div>
                            <p className="font-medium">How long does delivery take?</p>
                            <p className="text-sm mt-1 text-gray-600">
                              Nairobi: 1–3 days | Outside: 3–7 days
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">What is your return policy?</p>
                            <p className="text-sm mt-1 text-gray-600">
                              7 days for unused items in original condition
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">How do I track my order?</p>
                            <p className="text-sm mt-1 text-gray-600">
                              Check status in "My Orders" or contact support
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
                      <p className="text-xl text-gray-700 mb-8">
                        Need help right now? We're here for you.
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <a
                          href="mailto:support@herocloth.com"
                          className="px-10 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm"
                        >
                          Email Support
                        </a>
                        <a
                          href="tel:+254707319080"
                          className="px-10 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                        >
                          Call Us
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Bottom Navigation – Mobile only */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-around items-center h-16">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center gap-1 py-2 px-3 text-xs font-medium transition-colors ${
                    activeTab === tab.id ? "text-indigo-600" : "text-gray-600 hover:text-indigo-600"
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <Footer />
    </>
  );
};

export default ClientDashboard;