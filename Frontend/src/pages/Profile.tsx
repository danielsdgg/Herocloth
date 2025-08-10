import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import createApiInstance from "../utils/api";
import { type User } from "../types";
import { useAuth } from "../components/useAuth";
// import { toast } from "react-toastify"; // Uncomment if using react-toastify

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<Partial<User> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, logout } = useAuth();

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        const response = await api.get("/user/profile");
        setUser(response.data);
      } catch (error: AxiosError<{ msg: string }>) {
        const message = error.response?.data.msg || "Failed to fetch profile.";
        setError(message);
        // toast.error(message); // Uncomment if using react-toastify
        alert(message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Validate edit form inputs
  const validateUser = (userData: Partial<User>) => {
    if (!userData.username || userData.username.trim() === "") return "Username is required.";
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) return "Valid email is required.";
    return null;
  };

  // Handle edit profile
  const handleEdit = () => {
    if (user) {
      setEditUser({ username: user.username, email: user.email });
    }
  };

  // Handle save profile
  const handleSave = async () => {
    if (!editUser) return;
    const validationError = validateUser(editUser);
    if (validationError) {
      // toast.error(validationError); // Uncomment if using react-toastify
      alert(validationError);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const api = createApiInstance(token);
      const response = await api.put("/user/profile", editUser);
      setUser(response.data);
      setEditUser(null);
      // toast.success("Profile updated successfully!"); // Uncomment if using react-toastify
      alert("Profile updated successfully!");
    } catch (error: AxiosError<{ msg: string }>) {
      const message = error.response?.data.msg || "Failed to update profile.";
      setError(message);
      // toast.error(message); // Uncomment if using react-toastify
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 font-roboto text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-md font-roboto">
          {error || "Failed to load profile."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 font-poppins">
            Your Profile
          </h1>
          <p className="text-lg text-gray-600 mt-2 font-roboto">
            Manage your account details
          </p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md font-roboto">
            {error}
          </div>
        )}

        {/* Profile Card */}
        {!editUser ? (
          <div className="bg-white rounded-xl shadow-md p-6 transform transition duration-300 hover:shadow-xl">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-purple-600 font-poppins">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 font-poppins">
                {user.username}
              </h2>
              <p className="text-gray-600 font-roboto">{user.email}</p>
              <p className="text-sm text-gray-500 font-roboto capitalize mt-1">
                Role: {user.role}
              </p>
              <div className="mt-6 flex space-x-4 w-full">
                <button
                  onClick={handleEdit}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-full font-semibold font-roboto hover:bg-purple-700 transition duration-300"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 text-white py-3 rounded-full font-semibold font-roboto hover:bg-red-600 transition duration-300"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Profile Form */
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-poppins">
              Edit Profile
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Username *"
                value={editUser.username || ""}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
                required
                aria-label="Username"
              />
              <input
                type="email"
                placeholder="Email *"
                value={editUser.email || ""}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-roboto"
                required
                aria-label="Email"
              />
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`flex-1 bg-purple-600 text-white py-3 rounded-full font-semibold font-roboto transition duration-300 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
                }`}
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 bg-gray-300 text-gray-900 py-3 rounded-full font-semibold font-roboto hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;