import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import createApiInstance from "../utils/api";
import { type User } from "../types";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Profile = () => {
  const { token, setAuth } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<Partial<User & { password?: string }> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const api = createApiInstance(token);
        const response = await api.get<User>("/user/profile", { withCredentials: true });
        setUser(response.data);
      } catch (error: unknown) {
        const message =
          error instanceof AxiosError && error.response?.data?.msg
            ? error.response.data.msg
            : "Failed to fetch profile.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Validate form inputs
  const validateUser = useCallback(
    (userData: Partial<User & { password?: string }>) => {
      if (userData.username && (userData.username.trim() === "" || !isNaN(Number(userData.username))))
        return "Username must be a non-empty string.";
      if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email))
        return "Valid email is required.";
      if (userData.password && userData.password.length < 6)
        return "Password must be at least 6 characters.";
      return null;
    },
    []
  );

  // Handle edit button click
  const handleEdit = useCallback(() => {
    if (user) {
      setEditUser({ username: user.username, email: user.email, password: "" });
      setError(null);
      setSuccess(null);
    }
  }, [user]);

  // Handle profile save
  const handleSave = useCallback(async () => {
    if (!editUser) return;
    const validationError = validateUser(editUser);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }
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
      toast.info("No changes provided.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const api = createApiInstance(token);
      const response = await api.put<User>("/user/profile", payload, { withCredentials: true });
      setUser(response.data);
      setAuth({ username: response.data.username }); // Update auth context
      setEditUser(null);
      setSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      const message =
        error instanceof AxiosError && error.response?.data?.msg
          ? error.response.data.msg
          : "Failed to update profile.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [editUser, user, token, setAuth]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Ambient gradient glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <header className="mb-12 text-center">
            <div className="relative inline-block">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 animate-fade-in">
                Your Profile
              </h1>
              <motion.div
                className="absolute -bottom-2 left-10 h-1 w-24 rounded bg-gradient-to-r from-cyan-400 to-indigo-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <p className="text-lg text-slate-300 mt-3 max-w-2xl mx-auto animate-fade-in">
              Personalize your shopping experience by updating your account details.
            </p>
          </header>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
              aria-live="assertive"
              className="mb-8 rounded-lg bg-rose-500/10 px-6 py-4 text-sm text-rose-300 text-center shadow-md shadow-black/20"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="status"
              aria-live="polite"
              className="mb-8 rounded-lg bg-green-500/10 px-6 py-4 text-sm text-green-300 text-center shadow-md shadow-black/20"
            >
              {success}
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center min-h-[200px]">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"
                role="status"
                aria-label="Loading profile"
              ></div>
              <p className="text-slate-400 font-medium ml-4">Loading your profile...</p>
            </div>
          )}

          {/* Profile Details */}
          {!isLoading && user && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative bg-slate-900/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl shadow-black/30 max-w-lg mx-auto"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-2xl font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                <h2 className="text-2xl font-semibold text-slate-100">{user.username}</h2>
                <p className="text-slate-300 text-sm mt-1">{user.email}</p>
                <p className="text-sm text-slate-400 mt-1 capitalize">Role: {user.role}</p>
                <button
                  onClick={handleEdit}
                  className="group mt-8 relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 hover:scale-105"
                  aria-label="Edit profile"
                >
                  <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                  Edit Profile
                </button>
              </div>
            </motion.section>
          )}

          {/* Edit Profile Modal */}
          <AnimatePresence>
            {editUser && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                role="dialog"
                aria-modal="true"
                aria-label="Edit profile modal"
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900/70 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-xl shadow-black/30"
                >
                  <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-6">
                    Edit Profile
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-slate-300 mb-2"
                      >
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        value={editUser.username || ""}
                        onChange={(e) =>
                          setEditUser({ ...editUser, username: e.target.value })
                        }
                        className="w-full rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                        aria-label="Username"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-300 mb-2"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        value={editUser.email || ""}
                        onChange={(e) =>
                          setEditUser({ ...editUser, email: e.target.value })
                        }
                        className="w-full rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                        aria-label="Email"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-slate-300 mb-2"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        placeholder="Enter new password (optional)"
                        value={editUser.password || ""}
                        onChange={(e) =>
                          setEditUser({ ...editUser, password: e.target.value })
                        }
                        className="w-full rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                        aria-label="New password"
                      />
                      <p className="text-sm text-slate-400 mt-1">
                        Minimum 6 characters (leave blank to keep current)
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="group flex-1 relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                      aria-label="Save profile changes"
                    >
                      <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditUser(null)}
                      className="flex-1 rounded-xl bg-slate-800/70 border border-white/10 px-6 py-3 text-slate-100 font-medium hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-200 hover:scale-105"
                      aria-label="Cancel edit"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Profile;