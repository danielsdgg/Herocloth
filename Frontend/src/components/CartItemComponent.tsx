import { useCart } from "../Context/useCart";
import { type CartItem } from "../types";

interface CartItemProps {
  item: CartItem;
}

const CartItemComponent = ({ item }: CartItemProps) => {
  const { updateCartItem, removeFromCart } = useCart();

  return (
    <div className="flex items-center border-b border-gray-200 py-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 font-montserrat">{item.product_name}</h3>
        <p className="text-gray-600">Quantity: {item.quantity}</p>
        <p className="text-orange-600 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
        <div className="mt-2 flex space-x-2">
          <button
            onClick={() => updateCartItem(item.id, item.quantity + 1)}
            className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-300"
            aria-label={`Increase quantity of ${item.product_name}`}
          >
            +
          </button>
          <button
            onClick={() => updateCartItem(item.id, item.quantity - 1)}
            className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-300"
            disabled={item.quantity <= 1}
            aria-label={`Decrease quantity of ${item.product_name}`}
          >
            -
          </button>
          <button
            onClick={() => removeFromCart(item.id)}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
            aria-label={`Remove ${item.product_name} from cart`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;