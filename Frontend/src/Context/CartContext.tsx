import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { toast } from "react-toastify";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import { type CartItem } from "../types";
import { AxiosError } from "axios";

interface CartContextType {
  cartItems: CartItem[];
  cartItemCount: number;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  isLoading: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token, refreshAccessToken, clearAuth } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!token) {
      console.warn("No token available, skipping cart fetch.");
      setCartItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      console.log("Fetching cart with baseURL:", api.defaults.baseURL);
      console.log("Token used for cart request:", token);
      const response = await api.get<CartItem[]>("/cart/");
      setCartItems(response.data);
    } catch (error: any) {
      console.error("Error fetching cart:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const message = error.code === "ERR_NETWORK"
        ? "Cannot connect to server. Please ensure the backend is running."
        : error.response?.data?.msg || "Failed to load cart.";
      toast.error(message);
      if (error.response?.status === 401) {
        try {
          await refreshAccessToken();
          await fetchCart();
        } catch (refreshError: any) {
          console.error("Refresh token error:", {
            message: refreshError.message,
            code: refreshError.code,
            response: refreshError.response?.data,
            status: refreshError.response?.status,
          });
          toast.error(refreshError.response?.data?.msg || "Session expired. Please log in again.");
          clearAuth();
        }
      }
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshAccessToken, clearAuth]);

  const addToCart = useCallback(async (productId: number, quantity: number) => {
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      console.log("Adding to cart with baseURL:", api.defaults.baseURL);
      console.log("Token used for cart request:", token);
      await api.post("/cart/add", { product_id: productId, quantity });
      await fetchCart();
      toast.success("Added to cart!");
    } catch (error: any) {
      console.error("Error adding to cart:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const message = error.code === "ERR_NETWORK"
        ? "Cannot connect to server. Please ensure the backend is running."
        : error.response?.data?.msg || "Failed to add item to cart.";
      toast.error(message);
      if (error.response?.status === 401) {
        try {
          await refreshAccessToken();
          await addToCart(productId, quantity);
        } catch (refreshError: any) {
          console.error("Refresh token error:", {
            message: refreshError.message,
            code: refreshError.code,
            response: refreshError.response?.data,
            status: refreshError.response?.status,
          });
          toast.error(refreshError.response?.data?.msg || "Session expired. Please log in again.");
          clearAuth();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshAccessToken, clearAuth]);

  const updateCartItem = useCallback(async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.patch(`/cart/${cartItemId}`, { quantity });
      await fetchCart();
      toast.success("Cart updated!");
    } catch (error: any) {
      console.error("Error updating cart item:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const message = error.code === "ERR_NETWORK"
        ? "Cannot connect to server. Please ensure the backend is running."
        : error.response?.data?.msg || "Failed to update cart item.";
      toast.error(message);
      if (error.response?.status === 401) {
        try {
          await refreshAccessToken();
          await updateCartItem(cartItemId, quantity);
        } catch (refreshError: any) {
          console.error("Refresh token error:", {
            message: refreshError.message,
            code: refreshError.code,
            response: refreshError.response?.data,
            status: refreshError.response?.status,
          });
          toast.error(refreshError.response?.data?.msg || "Session expired. Please log in again.");
          clearAuth();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshAccessToken, clearAuth]);

  const removeFromCart = useCallback(async (cartItemId: number) => {
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.delete(`/cart/${cartItemId}`);
      await fetchCart();
      toast.success("Item removed from cart!");
    } catch (error: any) {
      console.error("Error removing from cart:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const message = error.code === "ERR_NETWORK"
        ? "Cannot connect to server. Please ensure the backend is running."
        : error.response?.data?.msg || "Failed to remove item from cart.";
      toast.error(message);
      if (error.response?.status === 401) {
        try {
          await refreshAccessToken();
          await removeFromCart(cartItemId);
        } catch (refreshError: any) {
          console.error("Refresh token error:", {
            message: refreshError.message,
            code: refreshError.code,
            response: refreshError.response?.data,
            status: refreshError.response?.status,
          });
          toast.error(refreshError.response?.data?.msg || "Session expired. Please log in again.");
          clearAuth();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshAccessToken, clearAuth]);

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.delete("/cart/");
      await fetchCart();
      toast.success("Cart cleared!");
    } catch (error: any) {
      console.error("Error clearing cart:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      const message = error.code === "ERR_NETWORK"
        ? "Cannot connect to server. Please ensure the backend is running."
        : error.response?.data?.msg || "Failed to clear cart.";
      toast.error(message);
      if (error.response?.status === 401) {
        try {
          await refreshAccessToken();
          await clearCart();
        } catch (refreshError: any) {
          console.error("Refresh token error:", {
            message: refreshError.message,
            code: refreshError.code,
            response: refreshError.response?.data,
            status: refreshError.response?.status,
          });
          toast.error(refreshError.response?.data?.msg || "Session expired. Please log in again.");
          clearAuth();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshAccessToken, clearAuth]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartItemCount,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};