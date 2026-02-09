import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import FloatingCartButton from "./components/FloatingCartButton";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetails from "./pages/ProductDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./Context/AuthContext";
import { CartProvider } from "./Context/CartContext";
import Contact from "./pages/Contact";
import Payment from "./payment/Payment";
import Orders from "./order/OrdersHistory";
import ClientDashboard from "./pages/ClientDashboard";

const AppContent = () => {
  const location = useLocation();

  // pages where FloatingCartButton should be hidden
  const hideCartButtonRoutes = ["/login", "/register"];

  const shouldShowCartButton = !hideCartButtonRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/checkout" element={<Payment/>} />
        <Route path="/orders" element={<Orders/>} />
      </Routes>

      {shouldShowCartButton && <FloatingCartButton />}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
