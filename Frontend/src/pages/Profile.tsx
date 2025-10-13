import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

const Profile = () => {
  const { token, setAuth } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        const response = await api.get<User>("/user/profile", { withCredentials: true });
        setUser(response.data);
        setFormData({ username: response.data.username, email: response.data.email });
        setAuth(token!, "", response.data.role, response.data.username, response.data.id);
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
          "Failed to fetch profile.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchUser();
  }, [token, setAuth]);

  // Validate form inputs
  const validateForm = useCallback(() => {
    if (!formData.username.trim()) return "Username is required.";
    if (!formData.email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Invalid email format.";
    return null;
  }, [formData]);

  // Handle profile update
  const handleUpdateProfile = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      return;
    }
    setIsLoading(true);
    setFormError(null);
    try {
      const api = createApiInstance(token);
      const response = await api.patch<User>("/user/profile", {
        username: formData.username,
        email: formData.email,
      }, { withCredentials: true });
      setUser(response.data);
      setAuth(token!, "", response.data.role, response.data.username, response.data.id);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
        "Failed to update profile.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, formData, setAuth, validateForm]);

  // Handle form cancellation
  const handleCancelEdit = useCallback(() => {
    if (user) {
      setFormData({ username: user.username, email: user.email });
    }
    setEditMode(false);
    setFormError(null);
  }, [user]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"
            role="status"
            aria-label="Loading profile"
          ></div>
          <p className="text-slate-400 font-medium mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error || "No user data available."}
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Ambient gradient glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12 text-center"
          >
            <div className="relative inline-block">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                Your Profile
              </h1>
              <motion.div
                className="absolute -bottom-2 left-10 h-1 w-32 rounded bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-50"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <p className="text-lg text-slate-300 mt-3 max-w-2xl mx-auto">
              Manage your account details below.
            </p>
          </motion.header>

          {/* Error Message */}
          {formError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
              aria-live="assertive"
              className="mb-8 rounded-lg bg-rose-500/10 px-6 py-4 text-sm text-rose-300 text-center shadow-md shadow-black/20"
            >
              {formError}
            </motion.div>
          )}

          {/* Profile Content */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-black/30 border border-white/10 p-8 max-w-lg mx-auto"
          >
            {editMode ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="username" className="text-sm text-slate-300">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    placeholder="Enter username"
                    aria-label="Username"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm text-slate-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    placeholder="Enter email"
                    aria-label="Email"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="group flex-1 relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                    aria-label="Save profile changes"
                  >
                    <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 font-medium hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-200 hover:scale-105"
                    aria-label="Cancel edit"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-400">Username</p>
                  <p className="text-lg text-slate-100">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-lg text-slate-100">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Role</p>
                  <p className="text-lg text-slate-100 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="group w-full relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 hover:scale-105"
                  aria-label="Edit profile"
                >
                  <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                  Edit Profile
                </button>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default Profile;