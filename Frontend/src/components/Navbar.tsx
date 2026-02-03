import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaEnvelope } from "react-icons/fa";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./useAuth";

const ROUTES = {
  HOME: "/",
  // CART: "/cart",
  CONTACT: "/contact",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  DASHBOARD: "/admin",
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { token, role, clearAuth } = useAuth();

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate(ROUTES.LOGIN);
    setIsOpen(false);
    setIsAccountOpen(false);
  }, [clearAuth, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
    setIsAccountOpen(false);
  }, []);

  const toggleAccountDropdown = useCallback(() => {
    setIsAccountOpen((prev) => !prev);
  }, []);

  const navItems = useMemo(
    () => [
      { to: ROUTES.HOME, label: "Home", icon: <FaHome className="w-4 h-4" /> },
      // { to: ROUTES.CART, label: "Cart", icon: <FaShoppingCart className="w-4 h-4" /> },
      { to: ROUTES.CONTACT, label: "Contact", icon: <FaEnvelope className="w-4 h-4" /> },
    ],
    []
  );

  const accountItems = useMemo(
    () =>
      token
        ? [
            { to: ROUTES.PROFILE, label: "Profile", icon: <FaUser className="w-3.5 h-3.5" /> },
            ...(role === "admin"
              ? [{ to: ROUTES.DASHBOARD, label: "Dashboard", icon: null }]
              : []),
            { label: "Logout", action: handleLogout, icon: null },
          ]
        : [
            { to: ROUTES.LOGIN, label: "Login", icon: null },
            { to: ROUTES.REGISTER, label: "Sign Up", icon: null },
          ],
    [token, role, handleLogout]
  );

  return (
    <nav className="bg-black text-white sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={ROUTES.HOME} className="flex items-center group">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mr-4 shadow-lg">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-black" aria-hidden="true">
                  <path d="M7 4h10l1 3h3v2h-1l-2 9H6L4 9H3V7h3l1-3zm2.2 5 1.5 7h7.1l1.6-7H9.2zM9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                </svg>
              </div>
              <span className="text-2xl font-extralight tracking-widest group-hover:opacity-80 transition-opacity">
                HEROCLOTH
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center text-base font-light tracking-wide transition-all duration-300 hover:opacity-70 ${
                  pathname === item.to ? "opacity-100" : "opacity-60"
                }`}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Link>
            ))}

            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={toggleAccountDropdown}
                className="flex items-center text-base font-light tracking-wide opacity-60 hover:opacity-100 transition-all duration-300"
              >
                <FaUser className="w-4 h-4 mr-2" />
                Account
              </button>

              <AnimatePresence>
                {isAccountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-4 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl py-3"
                  >
                    {accountItems.map((item) =>
                      item.action ? (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="w-full text-left px-6 py-3 text-sm font-light tracking-wide hover:bg-white/10 transition"
                        >
                          {item.icon && <span className="mr-3">{item.icon}</span>}
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={item.label}
                          to={item.to!}
                          onClick={() => setIsAccountOpen(false)}
                          className="block px-6 py-3 text-sm font-light tracking-wide hover:bg-white/10 transition"
                        >
                          {item.icon && <span className="mr-3">{item.icon}</span>}
                          {item.label}
                        </Link>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-3 text-white hover:opacity-70 transition"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-black/95 backdrop-blur-md border-t border-white/10"
          >
            <div className="px-6 py-8 space-y-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center text-xl font-extralight tracking-wider transition-all ${
                    pathname === item.to ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {item.icon && <span className="mr-4">{item.icon}</span>}
                  {item.label}
                </Link>
              ))}

              <div className="pt-6 border-t border-white/10">
                <button
                  onClick={toggleAccountDropdown}
                  className="flex items-center text-xl font-extralight tracking-wider opacity-60 hover:opacity-100 w-full text-left"
                >
                  <FaUser className="w-6 h-6 mr-4" />
                  Account
                </button>

                <AnimatePresence>
                  {isAccountOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-6 space-y-5 pl-12"
                    >
                      {accountItems.map((item) =>
                        item.action ? (
                          <button
                            key={item.label}
                            onClick={item.action}
                            className="block text-lg font-light tracking-wide opacity-60 hover:opacity-100 text-left"
                          >
                            {item.icon && <span className="mr-4">{item.icon}</span>}
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            key={item.label}
                            to={item.to!}
                            onClick={() => {
                              setIsOpen(false);
                              setIsAccountOpen(false);
                            }}
                            className="block text-lg font-light tracking-wide opacity-60 hover:opacity-100"
                          >
                            {item.icon && <span className="mr-4">{item.icon}</span>}
                            {item.label}
                          </Link>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;