import { useEffect, useState } from "react";
import createApiInstance from "../utils/api";
import { type User } from "../types";
import { useAuth } from "../components/useAuth";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const api = createApiInstance(token);
        const response = await api.get("/user/profile");
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, [token]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
    </div>
  );
};

export default Profile;