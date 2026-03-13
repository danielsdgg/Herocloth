import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
// import { motion } from "framer-motion";
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
  const { token, setAuth } = useAuth();
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
        setAuth(
          token!,
          "",
          response.data.role,
          response.data.firstname,
          response.data.lastname,
          response.data.id
        );
      } catch (error: any) {
        const message = error.response?.data?.msg || "Failed to fetch profile.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchUser();
  }, [token, setAuth]);

  const validateForm = useCallback(() => {
    if (!formData.firstname.trim()) return "First name is required.";
    if (!formData.lastname.trim()) return "Last name is required.";
    if (!formData.email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Invalid email format.";
    return null;
  }, [formData]);

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
    } catch (error: any) {
      const message = error.response?.data?.msg || "Failed to update profile.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, formData, setAuth, validateForm]);

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Loading profile...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-red-600 mb-4 text-lg">{error || "No profile data available."}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 mt-6">

        {/* Hero / Header area */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-16 md:py-20">
            <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-12">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 text-5xl font-medium shadow-md ring-8 ring-white">
                  {user.firstname?.[0]}
                  {user.lastname?.[0]}
                </div>
              </div>

              {/* Name & role */}
              <div>
                <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">
                  {user.firstname} {user.lastname}
                </h1>
                <p className="text-lg text-indigo-600 font-medium tracking-wide uppercase">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-12 md:py-16">
          {/* Error */}
          {formError && (
            <div className="mb-10 p-5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-center">
              {formError}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
            {/* Left column - Info / Form */}
            <div className="md:col-span-2">
              {editMode ? (
                <div className="space-y-8 bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstname}
                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                        className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastname}
                        onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                        className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                      className="flex-1 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 font-medium"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                      className="flex-1 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">First Name</div>
                      <div className="text-xl text-gray-900">{user.firstname}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Last Name</div>
                      <div className="text-xl text-gray-900">{user.lastname}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Email Address</div>
                      <div className="text-xl text-gray-900 break-all">{user.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Phone Number</div>
                      <div className="text-xl text-gray-900">{user.phone || "—"}</div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-10 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition font-medium shadow-sm"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Quick info / future extensions */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-medium text-gray-900 mb-6">Account Details</h3>
                <div className="space-y-5 text-sm">
                  <div>
                    <div className="text-gray-500">Member since</div>
                    <div className="text-gray-900 font-medium">March 2024</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Role</div>
                    <div className="text-indigo-600 font-medium uppercase tracking-wide">{user.role}</div>
                  </div>
                  {/* <div>
                    <div className="text-gray-500">Email verified</div>
                    <div className="text-green-600 font-medium">Yes</div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Profile;