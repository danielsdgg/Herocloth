import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useCart } from "../Context/useCart";
import Navbar from "../components/Navbar";
import CartItemComponent from "../components/CartItemComponent";

const ROUTES = {
  HOME: "/",
  CHECKOUT: "/checkout",
};

const Cart = () => {
  const { cartItems, isLoading, clearCart } = useCart();
  const navigate = useNavigate();

  const handleClearCart = useCallback(async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
      toast.success("Cart cleared successfully!");
    }
  }, [clearCart]);

  const handleCheckout = useCallback(() => {
    navigate(ROUTES.CHECKOUT);
  }, [navigate]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-50 pb-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-20 sm:pt-24">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-zinc-900">
              Your Cart
            </h1>
            <p className="mt-3 text-zinc-600">
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} • Review before checkout
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="inline-block h-14 w-14 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
              <p className="mt-8 text-zinc-600 text-lg">Loading your cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-sm py-20 px-8 text-center max-w-md mx-auto"
            >
              <div className="mx-auto w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                🛍️
              </div>
              <h3 className="text-2xl font-light text-zinc-900 mb-3">Your cart is empty</h3>
              <p className="text-zinc-600 mb-10">
                Looks like you haven't added anything yet.
              </p>
              <a
                href={ROUTES.HOME}
                className="inline-flex items-center justify-center px-10 py-4 bg-zinc-900 hover:bg-black text-white font-medium rounded-2xl transition-all active:scale-95"
              >
                Start Shopping
              </a>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">
                  <div className="space-y-8 divide-y divide-zinc-100">
                    {cartItems.map((item, index) => (
                      <div key={item.id} className={index > 0 ? "pt-8" : ""}>
                        <CartItemComponent item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 sticky top-24">
                  <h2 className="text-xl font-medium text-zinc-900 mb-6">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span className="font-medium text-zinc-900">KSh {total.toFixed(0)}</span>
                    </div>

                    <div className="flex justify-between text-zinc-600">
                      <span>Shipping</span>
                      <span className="text-emerald-600 font-medium">Calculated at checkout</span>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 flex justify-between items-baseline">
                      <span className="text-lg font-medium text-zinc-900">Total</span>
                      <span className="text-3xl font-semibold text-teal-600">
                        KSh {total.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="mt-8 w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:brightness-110 text-white font-medium rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    onClick={handleClearCart}
                    disabled={isLoading}
                    className="mt-4 w-full py-4 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium rounded-2xl transition-all active:scale-[0.98]"
                  >
                    Clear Cart
                  </button>

                  <p className="text-center text-xs text-zinc-500 mt-6">
                    Secure checkout powered by your preferred method
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Sticky Checkout Bar */}
        {!isLoading && cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 py-4 px-5 z-50 lg:hidden shadow-2xl">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Total</p>
                <p className="text-xl font-semibold text-teal-600">KSh {total.toFixed(0)}</p>
              </div>

              <button
                onClick={handleCheckout}
                className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-2xl transition"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Cart;