import axios from "axios";

const createApiInstance = (token: string | null) => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: true, // Required for CORS with credentials
  });
  return api;
};

export default createApiInstance;