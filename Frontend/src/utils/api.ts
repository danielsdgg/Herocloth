import axios from "axios";

const createApiInstance = (token: string | null) => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  });

  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    return config;
  });

  return api;
};

export default createApiInstance;