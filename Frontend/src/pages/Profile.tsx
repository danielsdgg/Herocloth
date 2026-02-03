import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  role: string;
}

const Profile = () => {
  const { token, firstname, lastname, setAuth } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });
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
        setFormData({
          firstname: response.data.firstname,
          lastname: response.data.lastname,
          email: response.data.email,
          phone: response.data.phone || "",
        });
        // Update auth context with fresh data
        setAuth(
          token!,
          "",
          response.data.role,
          response.data.firstname,
          response.data.lastname,
          response.data.id
        );
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
    if (!formData.firstname.trim()) return "First name is required.";
    if (!formData.lastname.trim()) return "Last name is required.";
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
      const response = await api.put<User>("/user/profile", formData, { withCredentials: true });
      setUser(response.data);
      setAuth(
        token!,
        "",
        response.data.role,
        response.data.firstname,
        response.data.lastname,
        response.data.id
      );
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
      setFormData({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone || "",
      });
    }
    setEditMode(false);
    setFormError(null);
  }, [user]);

  if (isLoading && !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600 text-xs font-light">Loading profile...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-900 text-xs font-light">
            {error || "No profile data available."}
          </p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-extralight tracking-widest mb-6">
              Your Profile
            </h1>
            <div className="h-px w-32 bg-gray-300 mx-auto" />
          </motion.header>

          {/* Error Message */}
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center text-red-600 text-sm font-light"
            >
              {formError}
            </motion.div>
          )}

          {/* Profile Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-3xl shadow-2xl p-12 md:p-16"
          >
            {editMode ? (
              <div className="space-y-10">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-600 block mb-3">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-light focus:border-gray-900 outline-none transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-600 block mb-3">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-light focus:border-gray-900 outline-none transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-600 block mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-light focus:border-gray-900 outline-none transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-600 block mb-3">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-light focus:border-gray-900 outline-none transition"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-6 pt-6">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="flex-1 py-5 bg-gray-900 text-white text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-black transition disabled:opacity-60"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="flex-1 py-5 border border-gray-300 text-gray-900 text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-12 text-center">
                <div>
                  <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-8 shadow-lg" />
                  <h2 className="text-4xl font-extralight tracking-widest mb-3">
                    {user.firstname} {user.lastname}
                  </h2>
                  <p className="text-sm uppercase tracking-widest text-gray-500 mb-10">
                    {user.role}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left max-w-2xl mx-auto">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-600 mb-3">
                      First Name
                    </p>
                    <p className="text-lg font-light">{user.firstname}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-600 mb-3">
                      Last Name
                    </p>
                    <p className="text-lg font-light">{user.lastname}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-600 mb-3">
                      Email Address
                    </p>
                    <p className="text-lg font-light">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-600 mb-3">
                      Phone Number
                    </p>
                    <p className="text-lg font-light">{user.phone || "Not provided"}</p>
                  </div>
                </div>

                <button
                  onClick={() => setEditMode(true)}
                  className="mt-12 px-20 py-6 bg-gray-900 text-white text-xs font-medium uppercase tracking-widest rounded-2xl hover:bg-black transition shadow-lg"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </motion.section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;