import { useCart } from "../Context/useCart";
import CartItemComponent from "../components/CartItemComponent";

const Cart = () => {
  const { cartItems, isLoading, clearCart } = useCart();

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold mb-6 font-playfair">Your Cart</h1>
      {isLoading ? (
        <p className="text-gray-600 font-montserrat">Loading cart...</p>
      ) : cartItems.length === 0 ? (
        <p className="text-gray-600 font-montserrat">Your cart is empty.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          {cartItems.map((item) => (
            <CartItemComponent key={item.id} item={item} />
          ))}
          <div className="mt-4">
            <p className="text-xl font-bold font-montserrat">
              Total: ${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleClearCart}
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 font-montserrat"
              >
                Clear Cart
              </button>
              <button className="mt-4 w-full bg-teal text-white py-2 px-4 rounded-md hover:bg-tealHover font-montserrat">
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;