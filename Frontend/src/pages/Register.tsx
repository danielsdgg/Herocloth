import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import createApiInstance from "../utils/api";
import { AxiosError } from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const api = createApiInstance(null);
      await api.post("/auth/register", { username, email, password });
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (error: AxiosError<{ msg: string }>) {
      console.error("Register error:", error.response?.data);
      const message = error.response?.data?.msg || "Registration failed.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold font-montserrat mb-6">Register</h1>
        {error && <p className="text-red-500 mb-4 font-montserrat">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border rounded-md mb-4 font-montserrat"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-md mb-4 font-montserrat"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-md mb-4 font-montserrat"
        />
        <button
          onClick={handleRegister}
          className="w-full bg-amber-600 text-white py-3 rounded-full font-montserrat hover:bg-amber-700 transition duration-300"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Register;