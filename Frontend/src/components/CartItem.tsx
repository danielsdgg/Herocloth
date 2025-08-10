import { type CartItem } from "../types";

interface CartItemProps {
  item: CartItem;
}

const CartItem = ({ item }: CartItemProps) => {
  return (
    <div className="flex items-center border-b py-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{item.product_name}</h3>
        <p className="text-gray-600">Quantity: {item.quantity}</p>
        <p className="text-teal font-bold">${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default CartItem;