import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import { useCart } from "../Context/useCart";

const ROUTES = {
  CART: "/cart",
};

const FloatingCartButton = () => {
  const { cartItemCount } = useCart();

  return (
    <Link to={ROUTES.CART} aria-label={`View cart with ${cartItemCount} items`}>
      <motion.div
        className="fixed bottom-8 right-8 group flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 p-4 shadow-lg shadow-black/40 transition-all duration-300 hover:shadow-xl hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
        <FaShoppingCart className="h-6 w-6 text-white" />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
            {cartItemCount}
          </span>
        )}
      </motion.div>
    </Link>
  );
};

export default FloatingCartButton;