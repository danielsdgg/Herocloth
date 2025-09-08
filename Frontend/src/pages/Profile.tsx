// src/components/Profile.tsx
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import createApiInstance from "../utils/api";
import { type User } from "../types";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<Partial<User & { password?: string }> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { token, logout } = useAuth();

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const api = createApiInstance(token);
        const response = await api.get("/user/profile", { withCredentials: true });
        setUser(response.data);
      } catch (error: unknown) {
        const message = error instanceof AxiosError && error.response?.data?.msg
          ? error.response.data.msg
          : "Failed to fetch profile.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Validate form inputs
  const validateUser = (userData: Partial<User & { password?: string }>) => {
    if (userData.username && (userData.username.trim() === "" || !isNaN(Number(userData.username))))
      return "Username must be a non-empty string.";
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email))
      return "Valid email is required.";
    if (userData.password && userData.password.length < 6)
      return "Password must be at least 6 characters.";
    return null;
  };

  const handleEdit = () => {
    if (user) {
      setEditUser({ username: user.username, email: user.email, password: "" });
      setError(null);
      setSuccess(null);
    }
  };

  const handleSave = async () => {
    if (!editUser) return;
    const validationError = validateUser(editUser);
    if (validationError) {
      setError(validationError);
      return;
    }
    // Only include fields that have changed or are non-empty
    const payload: Partial<User & { password?: string }> = {};
    if (editUser.username && editUser.username !== user?.username) {
      payload.username = editUser.username;
    }
    if (editUser.email && editUser.email !== user?.email) {
      payload.email = editUser.email;
    }
    if (editUser.password) {
      payload.password = editUser.password;
    }
    if (Object.keys(payload).length === 0) {
      setError("No changes provided.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const api = createApiInstance(token);
      const response = await api.put("/user/profile", payload, { withCredentials: true });
      setUser(response.data);
      setEditUser(null);
      setSuccess("Profile updated successfully!");
    } catch (error: unknown) {
      const message = error instanceof AxiosError && error.response?.data?.msg
        ? error.response.data.msg
        : "Failed to update profile.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cyan-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="text-slate-600 text-lg font-medium animate-pulse">
              Loading...
            </div>
          </div>
        )}

        {!isLoading && (error || !user) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-lg w-full text-center font-medium">
              {error || "Failed to load profile."}
            </div>
          </motion.div>
        )}

        {!isLoading && user && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-slate-300"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900">
                Your Profile
              </h1>
              <p className="text-slate-600 mt-2">
                Manage and update your account details
              </p>
            </div>

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-100 text-green-700 px-6 py-4 rounded-lg shadow-md mb-6 text-center font-medium"
              >
                {success}
              </motion.div>
            )}

            {!editUser ? (
              // View Mode
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-md mb-6">
                  <span className="text-3xl font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {user.username}
                </h2>
                <p className="text-slate-600">{user.email}</p>
                <p className="text-sm text-slate-500 mt-1 capitalize">
                  Role: {user.role}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-sm">
                  <button
                    onClick={handleEdit}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                  Edit Profile
                </h2>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={editUser.username || ""}
                      onChange={(e) =>
                        setEditUser({ ...editUser, username: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-cyan-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={editUser.email || ""}
                      onChange={(e) =>
                        setEditUser({ ...editUser, email: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-cyan-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={editUser.password || ""}
                      onChange={(e) =>
                        setEditUser({ ...editUser, password: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-cyan-50 text-slate-900"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Minimum 6 characters (leave blank to keep current)
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={`flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold transition ${
                      isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-indigo-700"
                    }`}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditUser(null)}
                    className="flex-1 bg-gray-300 text-slate-900 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Profile;