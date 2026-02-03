import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import { type LoginResponse } from "../types";

// Constants for better maintainability
const ROUTES = {
  HOME: "/",
  ADMIN: "/admin",
  REGISTER: "/register",
};

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError(null); // Clear error on input change
    },
    []
  );

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
        const api = createApiInstance(null);
        const response = await api.post<LoginResponse>("/auth/login", formData);
        const { access_token, refresh_token, role } = response.data;
        
        setAuth(access_token, refresh_token, role);
        toast.success("Logged in successfully!");
        navigate(role === "admin" ? ROUTES.ADMIN : ROUTES.HOME);
      } catch (error) {
        const message = 
          (error as AxiosError<{ msg: string }>).response?.data?.msg || 
          "Failed to log in. Please try again.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, setAuth, navigate]
  );

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* High-contrast black & white fashion background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{
          backgroundImage: "url('https://www.shutterstock.com/image-photo/monochrome-fashion-portrait-beautiful-sensual-600nw-2619914245.jpg')",
        }}
      />

      {/* Subtle geometric pattern overlay for texture */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "url('https://static.vecteezy.com/system/resources/previews/012/697/877/non_2x/black-and-white-seamless-geometric-pattern-monochrome-repeating-pattern-abstract-background-with-squares-rotated-by-45-degrees-vector.jpg')",
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
              Sign in to<br />your account
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-lg">
              Access your orders, saved items, and personalized recommendations.<br />
              Secure, fast, and effortless.
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

          {/* Right Column - Login Form (sharpened: cleaner, more premium) */}
          <div className="flex items-center justify-center">
            <form
              onSubmit={handleLogin}
              className="w-full max-w-md rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/20 p-10 shadow-2xl"
              noValidate
            >
              <div className="mb-8 h-px bg-white/20" />

              {error && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-4 text-sm text-red-300">
                  {error}
                </div>
              )}

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
                    Email address
                  </label>
                </div>
              </div>

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
                    autoComplete="current-password"
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
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <div className="my-8 h-px bg-white/20" />

              <div className="text-center text-sm text-gray-400 space-y-3">
                <p>
                  Don’t have an account?{" "}
                  <a href={ROUTES.REGISTER} className="text-white font-medium hover:underline">
                    Create one
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

export default Login;