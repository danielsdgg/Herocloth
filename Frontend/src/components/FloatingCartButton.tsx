import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import { useCart } from "../Context/useCart";

const FloatingCartButton = () => {
  const { cartItemCount } = useCart();

  return (
    <Link to="/cart">
      <motion.div
        className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`View cart with ${cartItemCount} items`}
      >
        <FaShoppingCart className="h-6 w-6" />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartItemCount}
          </span>
        )}
      </motion.div>
    </Link>
  );
};

export default FloatingCartButton;