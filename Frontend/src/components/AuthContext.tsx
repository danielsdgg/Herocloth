import { createContext, useState, useEffect, type ReactNode } from "react";
import { AxiosError } from "axios"; 
import createApiInstance from "../utils/api";
import { type LoginResponse } from "../types"; 

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  setAuth: (token: string, refreshToken: string, role: string) => void;
  clearAuth: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refreshToken"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));

  useEffect(() => {
    console.log("AuthContext initialized with token:", token, "role:", role);
  }, [token, role]);

  const setAuth = (newToken: string, newRefreshToken: string, newRole: string) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setRole(newRole);
    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("role", newRole);
    console.log("setAuth called with token:", newToken, "role:", newRole);
  };

  const clearAuth = () => {
    setToken(null);
    setRefreshToken(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
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
    } catch (error: AxiosError<{ msg: string }>) {
      console.error("Error refreshing token:", error.response?.data);
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider value={{ token, refreshToken, role, setAuth, clearAuth, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};