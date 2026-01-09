import { createContext, useState, useEffect, type ReactNode } from "react";
import createApiInstance from "../utils/api";
import { type LoginResponse } from "../types";

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  firstname: string | null;
  lastname: string | null;
  userId: number | null;
  setAuth: (
    token: string,
    refreshToken: string,
    role: string,
    firstname?: string | null,
    lastname?: string | null,
    userId?: number | null
  ) => void;
  clearAuth: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [firstname, setFirstname] = useState<string | null>(
    localStorage.getItem("firstname")
  );
  const [lastname, setLastname] = useState<string | null>(
    localStorage.getItem("lastname")
  );
  const [userId, setUserId] = useState<number | null>(
    localStorage.getItem("userId")
      ? parseInt(localStorage.getItem("userId")!)
      : null
  );

  useEffect(() => {
    console.log("AuthContext initialized:", {
      token: !!token,
      role,
      firstname,
      lastname,
      userId,
    });
  }, [token, role, firstname, lastname, userId]);

  const setAuth = (
    newToken: string,
    newRefreshToken: string,
    newRole: string,
    newFirstname: string | null = null,
    newLastname: string | null = null,
    newUserId: number | null = null
  ) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setRole(newRole);
    setFirstname(newFirstname);
    setLastname(newLastname);
    setUserId(newUserId);

    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("role", newRole);
    if (newFirstname) localStorage.setItem("firstname", newFirstname);
    else localStorage.removeItem("firstname");
    if (newLastname) localStorage.setItem("lastname", newLastname);
    else localStorage.removeItem("lastname");
    if (newUserId !== null) localStorage.setItem("userId", newUserId.toString());
    else localStorage.removeItem("userId");

    console.log("setAuth called:", {
      role: newRole,
      firstname: newFirstname,
      lastname: newLastname,
      userId: newUserId,
    });
  };

  const clearAuth = () => {
    setToken(null);
    setRefreshToken(null);
    setRole(null);
    setFirstname(null);
    setLastname(null);
    setUserId(null);

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("firstname");
    localStorage.removeItem("lastname");
    localStorage.removeItem("userId");

    console.log("clearAuth called - all auth data cleared");
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

      console.log("Access token refreshed successfully");
    } catch (error: unknown) {
      console.error("Error refreshing token:", error);
      clearAuth();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        role,
        firstname,
        lastname,
        userId,
        setAuth,
        clearAuth,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};