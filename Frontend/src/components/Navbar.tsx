import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaShoppingCart, FaUser, FaEnvelope } from "react-icons/fa";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./useAuth";

const ROUTES = {
  HOME: "/",
  CART: "/cart",
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
      { to: ROUTES.HOME, label: "Home", icon: <FaHome className="w-5 h-5 mr-2" /> },
      { to: ROUTES.CART, label: "Cart", icon: <FaShoppingCart className="w-5 h-5 mr-2" /> },
      { to: ROUTES.CONTACT, label: "Contact", icon: <FaEnvelope className="w-5 h-5 mr-2" /> },
    ],
    []
  );

  const accountItems = useMemo(
    () =>
      token
        ? [
            { to: ROUTES.PROFILE, label: "Profile", icon: <FaUser className="w-4 h-4 mr-2" /> },
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
    <nav className="bg-slate-950 text-slate-100 sticky top-0 z-50 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={ROUTES.HOME} className="flex items-center group">
              <motion.div
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-slate-900"
                  aria-hidden="true"
                >
                  <path d="M7 4h10l1 3h3v2h-1l-2 9H6L4 9H3V7h3l1-3zm2.2 5 1.5 7h7.1l1.6-7H9.2zM9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                </svg>
              </motion.div>
              <span className="ml-3 text-xl font-semibold tracking-tight group-hover:text-cyan-300 transition-colors duration-200">
                Herocloth
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                  pathname === item.to
                    ? "text-cyan-300 bg-slate-800/50"
                    : "text-slate-100 hover:text-cyan-300 hover:bg-slate-800/50"
                }`}
                aria-label={item.label}
                aria-current={pathname === item.to ? "page" : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={toggleAccountDropdown}
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-100 hover:text-cyan-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                aria-label="Account menu"
                aria-expanded={isAccountOpen}
              >
                <FaUser className="w-5 h-5 mr-2" />
                Account
              </button>
              <AnimatePresence>
                {isAccountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-xl shadow-black/40 py-2"
                  >
                    {accountItems.map((item) =>
                      item.action ? (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="flex items-center w-full px-4 py-2 text-sm text-slate-100 hover:text-cyan-300 hover:bg-slate-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                          aria-label={item.label}
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={item.label}
                          to={item.to}
                          className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                            pathname === item.to
                              ? "text-cyan-300 bg-slate-800/50"
                              : "text-slate-100 hover:text-cyan-300 hover:bg-slate-800/50"
                          }`}
                          onClick={() => setIsAccountOpen(false)}
                          aria-label={item.label}
                          aria-current={pathname === item.to ? "page" : undefined}
                        >
                          {item.icon}
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
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-slate-100 hover:text-cyan-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-slate-900/70 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-lg"
          >
            <div className="px-6 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center w-full px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg ${
                    pathname === item.to
                      ? "text-cyan-300 bg-slate-800/50"
                      : "text-slate-100 hover:text-cyan-300 hover:bg-slate-800/50"
                  }`}
                  onClick={() => setIsOpen(false)}
                  aria-label={item.label}
                  aria-current={pathname === item.to ? "page" : undefined}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              {/* Mobile Account Menu */}
              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={toggleAccountDropdown}
                  className="flex items-center w-full px-4 py-3 text-base font-medium text-slate-100 hover:text-cyan-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  aria-label="Account menu"
                  aria-expanded={isAccountOpen}
                >
                  <FaUser className="w-5 h-5 mr-2" />
                  Account
                </button>
                <AnimatePresence>
                  {isAccountOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pl-4 space-y-2 mt-2"
                    >
                      {accountItems.map((item) =>
                        item.action ? (
                          <button
                            key={item.label}
                            onClick={item.action}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-100 hover:text-cyan-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                            aria-label={item.label}
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            key={item.label}
                            to={item.to}
                            className={`flex items-center w-full px-4 py-2 text-sm transition-all duration-200 ${
                              pathname === item.to
                                ? "text-cyan-300 bg-slate-800/50"
                                : "text-slate-100 hover:text-cyan-300 hover:bg-slate-800/50"
                            }`}
                            onClick={() => {
                              setIsOpen(false);
                              setIsAccountOpen(false);
                            }}
                            aria-label={item.label}
                            aria-current={pathname === item.to ? "page" : undefined}
                          >
                            {item.icon}
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