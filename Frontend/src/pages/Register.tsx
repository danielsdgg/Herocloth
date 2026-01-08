import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import createApiInstance from "../utils/api";

// Constants for maintainable routes
const ROUTES = {
  LOGIN: "/login",
  HOME: "/",
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError(null);
    },
    []
  );

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        const api = createApiInstance(null);
        await api.post("/auth/register", formData);
        toast.success("Registration successful! Please log in.");
        navigate(ROUTES.LOGIN);
      } catch (error) {
        const message =
          (error as AxiosError<{ msg: string }>).response?.data?.msg ||
          "Registration failed. Please try again.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, navigate]
  );

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* High-contrast black & white fashion background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{
          backgroundImage: "url('https://thumbs.dreamstime.com/b/high-contrast-black-white-portrait-beautiful-girl-femininity-beauty-free-space-your-text-116102201.jpg')",
        }}
      />

      {/* Subtle geometric pattern overlay for texture */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "url('https://media.istockphoto.com/id/1456866446/vector/seamless-geometric-vector-pattern.jpg?s=612x612&w=0&k=20&c=UmZBTcHsF4xT_gAWjKSeAyjKLLKt9SuMaBG_L5bG1bc=')",
          backgroundSize: "cover",
        }}
      />

      {/* Dark gradient overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column - Brand Info (sharpened: larger text, better spacing) */}
          <div className="flex flex-col justify-center text-left md:text-left">
            <div className="mb-12 inline-flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-xl">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-black" aria-hidden="true">
                  <path d="M7 4h10l1 3h3v2h-1l-2 9H6L4 9H3V7h3l1-3zm2.2 5 1.5 7h7.1l1.6-7H9.2zM9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                </svg>
              </div>
              <span className="text-3xl font-light tracking-widest">YOURSTORE</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extralight tracking-wide mb-6">
              Create Your<br />Account
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-lg">
              Join YourStore to access exclusive deals, track your orders, and enjoy<br />
              a personalized shopping experience.
            </p>

            <ul className="space-y-5 text-gray-400 text-lg">
              {[
                "Encrypted authentication & secure sessions",
                "Track orders and manage returns easily",
                "Exclusive deals tailored to you",
              ].map((text) => (
                <li key={text} className="flex items-center gap-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/70" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Register Form (sharpened: cleaner, more premium) */}
          <div className="flex items-center justify-center">
            <form
              onSubmit={handleRegister}
              className="w-full max-w-md rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/20 p-10 shadow-2xl"
              noValidate
            >
              <div className="mb-8 h-px bg-white/20" />

              {error && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Username */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="peer block w-full rounded-xl border border-white/30 bg-transparent px-6 py-4 text-white placeholder-transparent outline-none focus:border-white/70 focus:ring-4 focus:ring-white/20 transition"
                    autoComplete="username"
                    required
                  />
                  <label
                    htmlFor="username"
                    className="absolute left-6 top-4 -translate-y-1/2 text-gray-400 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs peer-focus:text-white/80 bg-transparent px-1"
                  >
                    Username
                  </label>
                </div>
              </div>

              {/* Email */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="peer block w-full rounded-xl border border-white/30 bg-transparent px-6 py-4 text-white placeholder-transparent outline-none focus:border-white/70 focus:ring-4 focus:ring-white/20 transition"
                    autoComplete="email"
                    required
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-6 top-4 -translate-y-1/2 text-gray-400 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs peer-focus:text-white/80 bg-transparent px-1"
                  >
                    Email Address
                  </label>
                </div>
              </div>

              {/* Password */}
              <div className="mb-8">
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="peer block w-full rounded-xl border border-white/30 bg-transparent px-6 py-4 pr-14 text-white placeholder-transparent outline-none focus:border-white/70 focus:ring-4 focus:ring-white/20 transition"
                    autoComplete="new-password"
                    required
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-6 top-4 -translate-y-1/2 text-gray-400 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs peer-focus:text-white/80 bg-transparent px-1"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8-3.582-8-8 0-.826.125-1.63.357-2.4m1.286-1.2A10.05 10.05 0 0112 5c4.418 0 8 3.582 8 8 0 .826-.125 1.63-.357 2.4m-1.286 1.2M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-white text-black font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Registering..." : "Register"}
              </button>

              <div className="my-8 h-px bg-white/20" />

              <div className="text-center text-sm text-gray-400 space-y-3">
                <p>
                  Already have an account?{" "}
                  <a href={ROUTES.LOGIN} className="text-white font-medium hover:underline">
                    Sign in
                  </a>
                </p>
                <p>
                  <a href={ROUTES.HOME} className="text-white font-medium hover:underline">
                    Go to Home
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;