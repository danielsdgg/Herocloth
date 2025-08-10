import { useEffect, useState } from "react";
import createApiInstance from "../utils/api";
import { type CartItem } from "../types";
import CartItemComponent from "../components/CartItem";
import { useAuth } from "../components/useAuth";

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const api = createApiInstance(token);
        const response = await api.get("/cart");
        setCartItems(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCart();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          {cartItems.map((item) => (
            <CartItemComponent key={item.id} item={item} />
          ))}
          <div className="mt-4">
            <p className="text-xl font-bold">
              Total: ${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </p>
            <button className="mt-4 w-full bg-teal text-white py-2 px-4 rounded-md hover:bg-tealHover">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;