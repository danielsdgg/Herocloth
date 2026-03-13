import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Bars3Icon, XMarkIcon, ShoppingBagIcon, UserIcon } from "@heroicons/react/24/outline";
import { useAuth } from "./useAuth";

const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  CONTACT: "/contact",
  CART: "/cart",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  DASHBOARD: "/admin",
  CLIENT_DASHBOARD: "/dashboard",
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { token, role, clearAuth } = useAuth();

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate(ROUTES.LOGIN);
    setIsOpen(false);
    setIsAccountOpen(false);
  }, [clearAuth, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (isOpen) setIsAccountOpen(false);
  }, [isOpen]);

  const closeMenus = useCallback(() => {
    setIsOpen(false);
    setIsAccountOpen(false);
  }, []);

  const navItems = useMemo(
    () => [
      { to: ROUTES.HOME, label: "Home" },
      { to: ROUTES.SHOP, label: "Shop" },
      { to: ROUTES.CONTACT, label: "Contact" },
      { to: ROUTES.CART, label: "Cart", icon: <ShoppingBagIcon className="w-5 h-5" /> },
    ],
    []
  );

  const accountItems = useMemo(
    () =>
      token
        ? [
            { to: ROUTES.PROFILE, label: "Profile", icon: <UserIcon className="w-5 h-5" /> },
            ...(role === "admin"
              ? [{ to: ROUTES.DASHBOARD, label: "Admin Dashboard" }]
              : [{ to: ROUTES.CLIENT_DASHBOARD, label: "My Dashboard" }]),
            { label: "Logout", action: handleLogout },
          ]
        : [
            { to: ROUTES.LOGIN, label: "Login" },
            { to: ROUTES.REGISTER, label: "Sign Up" },
          ],
    [token, role, handleLogout]
  );

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/95 backdrop-blur-xl shadow-xl"
          : "bg-black/90 backdrop-blur-md"
      } text-white border-b border-white/5`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">

          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center group" onClick={closeMenus}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center mr-3 shadow-md">
              <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 fill-black">
                <path d="M7 4h10l1 3h3v2h-1l-2 9H6L4 9H3V7h3l1-3zm2.2 5 1.5 7h7.1l1.6-7H9.2zM9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              </svg>
            </div>

            <span className="text-xl sm:text-2xl font-light tracking-widest group-hover:opacity-80 transition-opacity">
              HEROCLOTH
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-10 xl:space-x-12">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`text-base font-light tracking-wide transition-all duration-300 hover:opacity-90 ${
                  isActive(item.to)
                    ? "opacity-100 underline underline-offset-8 decoration-2 decoration-white/60"
                    : "opacity-70"
                } flex items-center gap-2`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* Desktop Account */}
            <div className="relative ml-6">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex items-center gap-2 text-base font-light opacity-80 hover:opacity-100 transition-all"
              >
                <UserIcon className="w-5 h-5" />
                <span>Account</span>
              </button>

              <AnimatePresence>
                {isAccountOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="absolute right-0 mt-4 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50"
                  >
                    {accountItems.map((item, i) => (
                      <div key={i}>
                        {item.action ? (
                          <button
                            onClick={() => {
                              item.action();
                              setIsAccountOpen(false);
                            }}
                            className="w-full text-left px-5 py-3 text-sm font-light hover:bg-white/10 transition-colors"
                          >
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            to={item.to}
                            onClick={() => setIsAccountOpen(false)}
                            className={`block px-5 py-3 text-sm font-light hover:bg-white/10 transition-colors ${
                              isActive(item.to) ? "bg-white/5" : ""
                            }`}
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/10 transition-all"
            onClick={toggleMobileMenu}
          >
            {isOpen ? (
              <XMarkIcon className="h-7 w-7 text-white" />
            ) : (
              <Bars3Icon className="h-7 w-7 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-black/98 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-6 pt-6 pb-10">

              {/* Nav Links */}
              <div className="flex flex-col space-y-6">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={closeMenus}
                    className={`flex items-center gap-3 text-lg font-light tracking-wide ${
                      isActive(item.to)
                        ? "text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Account */}
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-sm uppercase tracking-widest text-gray-400 mb-4">
                  Account
                </p>

                <div className="flex flex-col space-y-4">
                  {accountItems.map((item, i) => (
                    <div key={i}>
                      {item.action ? (
                        <button
                          onClick={() => {
                            item.action();
                            closeMenus();
                          }}
                          className="text-lg text-gray-300 hover:text-white"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          to={item.to}
                          onClick={closeMenus}
                          className={`text-lg ${
                            isActive(item.to)
                              ? "text-white"
                              : "text-gray-300 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;