import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaWhatsapp, FaHome, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTachometerAlt } from "react-icons/fa";
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useAuth } from "./useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { token, role, clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
    setIsOpen(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality (e.g., navigate to /search?q=query)
  };

  const navItems = [
    { to: "/", label: "Home", icon: <FaHome className="w-5 h-5 mr-2" /> },
    ...(token
      ? [
          { to: "/profile", label: "Account", icon: <FaUser className="w-5 h-5 mr-2" /> },
          ...(role === "admin"
            ? [{ to: "/admin", label: "Dashboard", icon: <FaTachometerAlt className="w-5 h-5 mr-2" /> }]
            : []),
          { label: "Logout", action: handleLogout, icon: <FaSignOutAlt className="w-5 h-5 mr-2" /> },
        ]
      : [
          { to: "/login", label: "Login", icon: <FaSignInAlt className="w-5 h-5 mr-2" /> },
          { to: "/register", label: "Sign Up", icon: <FaUserPlus className="w-5 h-5 mr-2" /> },
        ]),
    {
      to: "https://wa.me/254123456789",
      label: "WhatsApp",
      icon: <FaWhatsapp className="w-5 h-5 mr-2" />,
      external: true,
    },
  ];

  return (
    <nav className="bg-white text-gray-900 sticky top-0 z-50 shadow-md font-montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="https://res.cloudinary.com/ddei3mzex/image/upload/v1709419077/IMG-20240109-WA0001_szj2fg.jpg"
                alt="Herocloth Logo"
                className="h-10 w-auto"
              />
              <span className="ml-3 text-2xl font-bold font-playfair text-gray-900">Herocloth</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 mx-8">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                aria-label="Search products"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) =>
              item.action ? (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center px-3 py-2 text-sm font-semibold text-gray-900 hover:text-orange-500 hover:bg-orange-100 rounded-md transition duration-300"
                  aria-label={item.label}
                >
                  {item.icon}
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center px-3 py-2 text-sm font-semibold text-gray-900 hover:text-orange-500 hover:bg-orange-100 rounded-md transition duration-300"
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={item.label}
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
              className="p-2 text-gray-900 hover:text-orange-500 rounded-md transition duration-300"
              aria-label={isOpen ? "Close menu" : "Open menu"}
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
        className="md:hidden overflow-hidden bg-white shadow-md"
      >
        <div className="px-4 pt-2 pb-4 space-y-2">
          {/* Mobile Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
              aria-label="Search products"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
          {navItems.map((item) =>
            item.action ? (
              <button
                key={item.label}
                onClick={item.action}
                className="flex items-center w-full px-4 py-2 text-base font-semibold text-gray-900 hover:text-orange-500 hover:bg-orange-100 rounded-md transition duration-300"
                aria-label={item.label}
              >
                {item.icon}
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center w-full px-4 py-2 text-base font-semibold text-gray-900 hover:text-orange-500 hover:bg-orange-100 rounded-md transition duration-300"
                onClick={() => setIsOpen(false)}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={item.label}
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