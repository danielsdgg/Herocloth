import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Order {
  id: number;
  status: string;
  total: number;
  created_at: string;
  items: { product_name: string; quantity: number; price: number }[];
}

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to view orders");
      return;
    }

    const fetchOrders = async () => {
      try {
        const api = createApiInstance(token);
        const res = await api.get("/order/my-orders");
        setOrders(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.msg || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "paid": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "cod": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "shipped": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "delivered": return "bg-green-100 text-green-800 border border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-50 pb-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-18 sm:pt-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-zinc-900">
              Your Orders
            </h1>
            <p className="mt-3 text-zinc-600 text-lg">
              Track and manage all your purchases
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="inline-block h-14 w-14 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
              <p className="mt-8 text-zinc-600 text-lg">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-sm py-20 px-8 text-center max-w-md mx-auto"
            >
              <div className="mx-auto w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="text-2xl font-light text-zinc-900 mb-3">No orders yet</h3>
              <p className="text-zinc-600 mb-10">
                You haven't placed any orders yet. Start shopping to see them here.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-10 py-4 bg-zinc-900 hover:bg-black text-white font-medium rounded-2xl transition-all active:scale-95"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="space-y-8">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-3xl shadow-sm overflow-hidden border border-zinc-100"
                  >
                    {/* Order Header */}
                    <div className="px-6 sm:px-8 py-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-zinc-500 font-medium">Order #{order.id}</p>
                        <p className="text-zinc-900 font-light mt-1">
                          {new Date(order.created_at).toLocaleDateString("en-KE", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <span
                        className={`px-5 py-2 text-sm font-medium rounded-2xl ${getStatusColor(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 sm:p-8">
                      <div className="space-y-6">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start py-3 border-b border-zinc-100 last:border-b-0 last:pb-0"
                          >
                            <div className="flex-1 pr-4">
                              <p className="font-medium text-zinc-900 leading-tight">
                                {item.product_name}
                              </p>
                              <p className="text-sm text-zinc-500 mt-1">
                                Quantity: <span className="font-medium">{item.quantity}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-zinc-900">
                                KSh {(item.price * item.quantity).toFixed(0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="mt-10 pt-6 border-t border-zinc-200 flex justify-between items-center">
                        <span className="text-lg font-medium text-zinc-900">Total Amount</span>
                        <span className="text-2xl font-semibold text-teal-600">
                          KSh {order.total.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons - Shown only when there are orders */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-700 font-medium rounded-2xl transition-all active:scale-95"
                >
                  Continue Shopping
                </Link>

                <Link
                  to="/dashboard"   // ← Change this if your dashboard route is different
                  className="inline-flex items-center justify-center px-8 py-4 bg-zinc-900 hover:bg-black text-white font-medium rounded-2xl transition-all active:scale-95"
                >
                  Go to Dashboard
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Orders;