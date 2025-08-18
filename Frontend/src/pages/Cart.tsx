import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
      toast.success("Cart cleared!");
    }
  }, [clearCart]);

  const handleCheckout = useCallback(() => {
    navigate(ROUTES.CHECKOUT);
  }, [navigate]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

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
          {/* <div className="mb-8 inline-flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 fill-slate-900"
                aria-hidden="true"
              >
                <path d="M7 4h10l1 3h3v2h-1l-2 9H6L4 9H3V7h3l1-3zm2.2 5 1.5 7h7.1l1.6-7H9.2zM9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight">YourStore</span>
          </div> */}
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
            Your Cart
          </h1>

          {isLoading ? (
            <div className="text-center">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"
                role="status"
                aria-label="Loading cart"
              ></div>
              <p className="text-slate-400 font-medium mt-4">Loading your cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg font-medium mb-4">
                Your cart is empty.
              </p>
              <a
                href={ROUTES.HOME}
                className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg transition hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                Shop Now
              </a>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-xl shadow-black/40 p-6">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xl font-semibold text-cyan-400 mb-6">
                  Total: ${total}
                </p>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                  <button
                    onClick={handleClearCart}
                    disabled={isLoading}
                    className="w-full sm:w-auto py-3 px-6 rounded-xl border border-white/10 bg-slate-800/70 text-white font-medium text-sm transition hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Clear cart"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="group w-full sm:flex-1 relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg transition hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                    {isLoading ? "Processing..." : "Proceed to Checkout"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;