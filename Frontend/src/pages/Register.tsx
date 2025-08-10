import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiUserCheck } from "react-icons/fi";
import createApiInstance from "../utils/api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user", // Default role
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const api = createApiInstance(null);
      await api.post("/auth/register", formData);
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Registration Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Create Your Account
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Join us and explore the latest fashion trends
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="relative">
            <FiUser className="absolute top-3 left-3 text-gray-400 text-lg" />
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              required
            />
          </div>

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

          {/* Role */}
          <div className="relative">
            <FiUserCheck className="absolute top-3 left-3 text-gray-400 text-lg" />
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-700 transform hover:scale-[1.02] transition"
          >
            Register
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-pink-600 hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
