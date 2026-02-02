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
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "paid": return "bg-green-100 text-green-800";
      case "cod": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-200 text-green-900";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extralight tracking-wider text-center mb-12"
          >
            Your Orders
          </motion.h1>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent" />
              <p className="mt-6 text-lg text-gray-600">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
              <p className="text-xl text-gray-600 mb-8">You haven't placed any orders yet.</p>
              <Link
                to="/"
                className="inline-flex items-center px-10 py-4 bg-black text-white text-sm font-medium uppercase tracking-widest rounded-xl hover:bg-gray-800 transition"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-md overflow-hidden"
                >
                  <div className="p-6 sm:p-8 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Order #{order.id}</p>
                        <p className="text-lg font-medium mt-1">
                          {new Date(order.created_at).toLocaleDateString("en-KE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <span className={`px-6 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="space-y-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">KSh {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between text-lg font-medium">
                      <span>Total</span>
                      <span>KSh {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Orders;