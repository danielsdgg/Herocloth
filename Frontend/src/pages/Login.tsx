import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const api = createApiInstance(null); // No token needed for login
      const response = await api.post<LoginResponse>("/auth/login", formData);
      setAuth(response.data.access_token, response.data.role);
      navigate(response.data.role === "admin" ? "/admin" : "/");
    } catch (error) {
      console.error(error);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <button type="submit" className="w-full bg-teal text-white py-2 px-4 rounded-md hover:bg-tealHover">Login</button>
      </form>
    </div>
  );
};

export default Login;