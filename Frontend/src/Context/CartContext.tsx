import { createContext, useState, useEffect, type ReactNode } from "react";
import { AxiosError } from "axios";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import { type CartItem } from "../types";

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
  const { token } = useAuth();

  // Fetch cart items from API
  const fetchCart = async () => {
    setIsLoading(true);
    try {
      if (!token) return;
      const api = createApiInstance(token);
      const response = await api.get("/cart/"); // Use trailing slash
      setCartItems(response.data);
    } catch (error: AxiosError<{ msg: string }>) {
      console.error("Error fetching cart:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(error.response?.data.msg || "Failed to load cart.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId: number, quantity: number) => {
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.post("/cart/add", { product_id: productId, quantity });
      await fetchCart();
      alert("Added to cart!");
    } catch (error: AxiosError<{ msg: string }>) {
      console.error("Error adding to cart:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(error.response?.data.msg || "Failed to add item to cart.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.patch(`/cart/${cartItemId}`, { quantity });
      await fetchCart();
      alert("Cart updated!");
    } catch (error: AxiosError<{ msg: string }>) {
      console.error("Error updating cart item:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(error.response?.data.msg || "Failed to update cart item.");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId: number) => {
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.delete(`/cart/${cartItemId}`);
      await fetchCart();
      alert("Item removed from cart!");
    } catch (error: AxiosError<{ msg: string }>) {
      console.error("Error removing from cart:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(error.response?.data.msg || "Failed to remove item from cart.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    setIsLoading(true);
    try {
      const api = createApiInstance(token);
      await api.delete("/cart/"); // Use trailing slash
      await fetchCart();
      alert("Cart cleared!");
    } catch (error: AxiosError<{ msg: string }>) {
      console.error("Error clearing cart:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(error.response?.data.msg || "Failed to clear cart.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart on mount or when token changes
  useEffect(() => {
    fetchCart();
  }, [token]);

  // Calculate cart item count (number of unique items)
  const cartItemCount = cartItems.length; // Change to sum(cartItems.quantity) if preferred

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