import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import { type LoginResponse } from "../types";
import { AxiosError } from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const api = createApiInstance(null);
      const response = await api.post<LoginResponse>("/auth/login", { email, password });
      console.log("Login response:", response.data);
      const { access_token, refresh_token, role } = response.data;
      setAuth(access_token, refresh_token, role);
      toast.success("Logged in successfully!");
      navigate(role === "admin" ? "/admin" : "/");
    } catch (error: AxiosError<{ msg: string }>) {
      console.error("Login error:", error.response?.data);
      const message = error.response?.data?.msg || "Login failed.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold font-playfair mb-6 text-rose-500">Login</h1>
        {error && <p className="text-rose-500 mb-4 font-montserrat">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md mb-4 font-montserrat focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md mb-4 font-montserrat focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-pink-500 text-white py-3 rounded-full font-montserrat font-semibold hover:bg-pink-600 transition duration-300"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;