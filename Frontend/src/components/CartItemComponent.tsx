import { useCallback, useState } from "react";
import { useCart } from "../Context/useCart";
import { type CartItem } from "../types";

interface CartItemProps {
  item: CartItem;
}

const CartItemComponent = ({ item }: CartItemProps) => {
  const { updateCartItem, removeFromCart, isLoading } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleQuantityChange = useCallback(
    async (quantity: number) => {
      if (quantity < 1) {
        await removeFromCart(item.id);
      } else {
        await updateCartItem(item.id, quantity);
      }
    },
    [item.id, updateCartItem, removeFromCart]
  );

  const handleImageError = useCallback(() => {
    console.error(`Failed to load image for ${item.name}: ${item.image1}`);
    setImageError(true);
  }, [item.name, item.image1]);

  const imageSrc = item.image1 && !imageError
    ? item.image1
    : "https://picsum.photos/80/80";

  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/10">
      <div className="w-20 h-20 flex-shrink-0">
        <img
          src={imageSrc}
          alt={item.name}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
          onError={handleImageError}
        />
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-slate-100 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          ${item.price.toFixed(2)} each
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-white/30 bg-slate-800/70 text-slate-100 hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-xl font-bold"
            aria-label={`Decrease quantity of ${item.name}`}
            disabled={isLoading || item.quantity <= 1}
          >
            -
          </button>
          {/* Quantity - Made SUPER CLEAR & VISIBLE */}
          <span className="text-xl font-bold text-cyan-300 w-12 text-center px-2 py-1 bg-slate-800/90 rounded-lg border border-white/20 shadow-md">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-white/30 bg-slate-800/70 text-slate-100 hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-xl font-bold"
            aria-label={`Increase quantity of ${item.name}`}
            disabled={isLoading || (!!item.stock && item.quantity >= item.stock)}
          >
            +
          </button>
          <button
            onClick={() => handleQuantityChange(0)}
            className="text-sm text-rose-400 hover:text-rose-300 ml-4 transition"
            aria-label={`Remove ${item.name} from cart`}
            disabled={isLoading}
          >
            Remove
          </button>
        </div>
      </div>
      <p className="text-sm font-semibold text-cyan-400">
        ${(item.price * item.quantity).toFixed(2)}
      </p>
    </div>
  );
};

export default CartItemComponent;