import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import createApiInstance from "../utils/api";
import { type LoginResponse } from "../types";
import { useAuth } from "../components/useAuth";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const api = createApiInstance(null);
      const response = await api.post<LoginResponse>("/auth/login", formData);
      setAuth(response.data.access_token, response.data.role);
      navigate(response.data.role === "admin" ? "/admin" : "/");
    } catch (error) {
      console.error(error);
      alert("Invalid credentials");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1400&q=80')",
      }}
    >
      {/* Overlay for dark effect */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Sign in to continue shopping your favorite styles
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-gray-400 text-lg" />
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-gray-400 text-lg" />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-700 transform hover:scale-[1.02] transition"
          >
            Login
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Don’t have an account?{" "}
            <Link to={'/register'}> <span className="text-pink-600 hover:underline cursor-pointer">
              Sign Up
            </span> </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
