import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaWhatsapp, FaHome, FaShoppingCart, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTachometerAlt } from "react-icons/fa";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useAuth } from "./useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { token, role, clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
    setIsOpen(false);
  };

  const navItems = [
    { to: "/", label: "Home", icon: <FaHome className="w-5 h-5 mr-2" /> },
    { to: "/cart", label: "Cart", icon: <FaShoppingCart className="w-5 h-5 mr-2" /> },
    ...(token
      ? [
          { to: "/profile", label: "Profile", icon: <FaUser className="w-5 h-5 mr-2" /> },
          ...(role === "admin"
            ? [{ to: "/admin", label: "Dashboard", icon: <FaTachometerAlt className="w-5 h-5 mr-2" /> }]
            : []),
          { label: "Logout", action: handleLogout, icon: <FaSignOutAlt className="w-5 h-5 mr-2" /> },
        ]
      : [
          { to: "/login", label: "Login", icon: <FaSignInAlt className="w-5 h-5 mr-2" /> },
          { to: "/register", label: "Register", icon: <FaUserPlus className="w-5 h-5 mr-2" /> },
        ]),
    {
      to: "https://wa.me/254123456789",
      label: "WhatsApp",
      icon: <FaWhatsapp className="w-5 h-5 mr-2" />,
      external: true,
    },
  ];

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
              <span className="ml-3 text-2xl font-bold font-playfair">Herocloth</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) =>
              item.action ? (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 rounded-md transition duration-300"
                >
                  {item.icon}
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 rounded-md transition duration-300"
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white hover:bg-amber-600 rounded-md transition duration-300"
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-gray-800"
      >
        <div className="px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) =>
            item.action ? (
              <button
                key={item.label}
                onClick={item.action}
                className="flex items-center w-full px-4 py-2 text-base font-semibold text-white hover:bg-amber-600 rounded-md transition duration-300"
              >
                {item.icon}
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center w-full px-4 py-2 text-base font-semibold text-white hover:bg-amber-600 rounded-md transition duration-300"
                onClick={() => setIsOpen(false)}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          )}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;