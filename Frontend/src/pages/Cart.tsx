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
      <div className="min-h-screen bg-white text-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          {/* Elegant Header - Maximum Visibility */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extralight tracking-widest text-black mb-4">
              Your Cart
            </h1>
            <div className="h-px w-32 bg-gray-400 mx-auto" />
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div
                className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent mx-auto"
                role="status"
                aria-label="Loading cart"
              />
              <p className="text-black mt-6 text-lg font-medium">Loading your cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-black text-xl font-medium mb-8">
                Your cart is currently empty.
              </p>
              <a
                href={ROUTES.HOME}
                className="inline-flex items-center justify-center px-10 py-4 bg-black text-white text-sm font-medium uppercase tracking-widest rounded-xl hover:bg-gray-800 transition"
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl shadow-xl p-8 lg:p-12">
              <div className="space-y-8 divide-y divide-gray-300">
                {cartItems.map((item, index) => (
                  <div key={item.id} className={index > 0 ? "pt-8" : ""}>
                    <CartItemComponent item={item} />
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-400">
                <div className="flex justify-between items-baseline mb-10">
                  <p className="text-2xl font-medium text-black">Total</p>
                  <p className="text-4xl font-bold tracking-wide text-black">
                    KSh {total}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button
                    onClick={handleClearCart}
                    disabled={isLoading}
                    className="px-8 py-4 border-2 border-black text-black text-sm font-medium uppercase tracking-widest rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="px-8 py-4 bg-black text-white text-sm font-medium uppercase tracking-widest rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
                  >
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