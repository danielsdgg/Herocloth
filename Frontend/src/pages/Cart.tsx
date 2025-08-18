import { useCart } from "../Context/useCart";
import CartItemComponent from "../components/CartItemComponent";
import { toast } from "react-toastify";

const Cart = () => {
  const { cartItems, isLoading, clearCart } = useCart();

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
      toast.success("Cart cleared!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-rose-500 font-playfair mb-8">
          Your Cart
        </h1>
        {isLoading ? (
          <div className="text-center">
            <div className="spinner-border text-pink-500" role="status"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <p className="text-gray-600 font-montserrat text-lg">Your cart is empty.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {cartItems.map((item) => (
              <CartItemComponent key={item.id} item={item} />
            ))}
            <div className="mt-6">
              <p className="text-xl font-bold text-pink-500 font-playfair">
                Total: ${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </p>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={handleClearCart}
                  className="bg-rose-500 text-white py-3 px-6 rounded-full font-semibold font-montserrat hover:bg-rose-600 transition duration-300"
                  disabled={isLoading}
                >
                  Clear Cart
                </button>
                <button
                  className="flex-1 bg-pink-500 text-white py-3 rounded-full font-semibold font-montserrat hover:bg-pink-600 transition duration-300"
                  disabled={isLoading}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;