import { useCart } from "../Context/useCart";
import { type CartItem } from "../types";

interface CartItemProps {
  item: CartItem;
}

const CartItemComponent = ({ item }: CartItemProps) => {
  const { updateCartItem, removeFromCart, isLoading } = useCart();

  return (
    <div className="flex items-center border-b border-gray-200 py-4">
      <div className="w-24 h-24 mr-4">
        <img
          src={item.image1 || "https://via.placeholder.com/100x100?text=No+Image"}
          alt={item.product_name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 font-playfair">{item.product_name}</h3>
        <p className="text-gray-600 font-montserrat">Quantity: {item.quantity}</p>
        <p className="text-xl font-bold text-pink-500 font-playfair">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        <div className="mt-2 flex space-x-2">
          <button
            onClick={() => updateCartItem(item.id, item.quantity + 1)}
            className="px-3 py-1 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition duration-300 font-montserrat"
            aria-label={`Increase quantity of ${item.product_name}`}
            disabled={isLoading}
          >
            +
          </button>
          <button
            onClick={() => updateCartItem(item.id, item.quantity - 1)}
            className="px-3 py-1 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition duration-300 font-montserrat"
            disabled={item.quantity <= 1 || isLoading}
            aria-label={`Decrease quantity of ${item.product_name}`}
          >
            -
          </button>
          <button
            onClick={() => removeFromCart(item.id)}
            className="px-3 py-1 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition duration-300 font-montserrat"
            aria-label={`Remove ${item.product_name} from cart`}
            disabled={isLoading}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;