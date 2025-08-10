import { createContext, ReactNode, useState } from "react";

interface AuthContextType {
  token: string | null;
  role: string | null;
  setAuth: (token: string, role: string) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const setAuth = (newToken: string, newRole: string) => {
    setToken(newToken);
    setRole(newRole);
  };

  const clearAuth = () => {
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};