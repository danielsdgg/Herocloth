import axios from "axios";

const createApiInstance = (token: string | null) => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://herocloth-1.onrender.com",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: true, // Required for CORS with credentials
  });
  return api;
};

export default createApiInstance;