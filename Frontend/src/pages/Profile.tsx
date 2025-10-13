import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";

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

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        const response = await api.get<User>("/user/profile", { withCredentials: true });
        setUser(response.data);
        setAuth(token!, "", response.data.role, response.data.username, response.data.id);
      } catch (error) {
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>No user data available.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-100">User Profile</h1>
      <div className="mt-6 bg-slate-900/70 p-6 rounded-lg">
        <p className="text-slate-100">Username: {user.username}</p>
        <p className="text-slate-100 mt-2">Email: {user.email}</p>
        <p className="text-slate-100 mt-2">Role: {user.role}</p>
      </div>
    </div>
  );
};

export default Profile;