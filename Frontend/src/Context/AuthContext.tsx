import { createContext, useState, useEffect, type ReactNode } from "react";
import createApiInstance from "../utils/api";
import { type LoginResponse } from "../types";

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  username: string | null; // Added
  userId: number | null; // Added
  setAuth: (token: string, refreshToken: string, role: string, username?: string, userId?: number) => void; // Updated
  clearAuth: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refreshToken"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username")); // Added
  const [userId, setUserId] = useState<number | null>(localStorage.getItem("userId") ? parseInt(localStorage.getItem("userId")!) : null); // Added

  useEffect(() => {
    console.log("AuthContext initialized with token:", token, "role:", role, "username:", username, "userId:", userId);
  }, [token, role, username, userId]);

  const setAuth = (newToken: string, newRefreshToken: string, newRole: string, newUsername?: string, newUserId?: number) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setRole(newRole);
    setUsername(newUsername || null);
    setUserId(newUserId || null);
    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("role", newRole);
    if (newUsername) localStorage.setItem("username", newUsername);
    else localStorage.removeItem("username");
    if (newUserId) localStorage.setItem("userId", newUserId.toString());
    else localStorage.removeItem("userId");
    console.log("setAuth called with token:", newToken, "role:", newRole, "username:", newUsername, "userId:", newUserId);
  };

  const clearAuth = () => {
    setToken(null);
    setRefreshToken(null);
    setRole(null);
    setUsername(null); // Added
    setUserId(null); // Added
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("username"); // Added
    localStorage.removeItem("userId"); // Added
    console.log("clearAuth called");
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      clearAuth();
      return;
    }
    try {
      const api = createApiInstance(refreshToken);
      const response = await api.post<LoginResponse>("/auth/refresh");
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem("token", access_token);
      console.log("Access token refreshed:", access_token);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { msg: string } } };
      console.error("Error refreshing token:", err.response?.data);
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider value={{ token, refreshToken, role, username, userId, setAuth, clearAuth, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};