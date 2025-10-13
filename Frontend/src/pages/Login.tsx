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
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1">
          <div className="mb-8 inline-flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-slate-900" aria-hidden="true">
                <path d="M7 4h10l1 3h3v2h-1l-2 9H6L4 9H3V7h3l1-3zm2.2 5 1.5 7h7.1l1.6-7H9.2zM9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight">YourStore</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Sign in to your account
          </h1>
          <p className="mt-3 max-w-md text-slate-300">
            Access your orders, saved items, and personalized recommendations.
            Secure, fast, and simple.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {[
              "Encrypted authentication & secure sessions",
              "Track orders and manage returns easily",
              "Exclusive deals tailored to you",
            ].map((text) => (
              <li key={text} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 md:order-2">
          <form
            onSubmit={handleLogin}
            className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 shadow-xl shadow-black/40"
            noValidate
          >
            <div className="mb-6 h-1 w-full rounded bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500" />

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
              >
                {error}
              </div>
            )}

            <div className="mb-4">
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="peer block w-full rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                  autoComplete="email"
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? "email-error" : undefined}
                />
                <label
                  htmlFor="email"
                  className="pointer-events-none absolute left-4 top-3 origin-left -translate-y-1/2 bg-slate-900/70 px-1 text-slate-400 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-cyan-300"
                >
                  Email address
                </label>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder=" "
                  className="peer block w-full rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 pr-12 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
                  autoComplete="current-password"
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? "password-error" : undefined}
                />
                <label
                  htmlFor="password"
                  className="pointer-events-none absolute left-4 top-3 origin-left -translate-y-1/2 bg-slate-900/70 px-1 text-slate-400 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-cyan-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 my-auto mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-800/60 hover:bg-slate-800/90"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-slate-300" aria-hidden="true">
                      <path d="M2.8 2.1 1.4 3.5l3.2 3.1A12.5 12.5 0 0 0 .5 12s3.5 7 11.5 7c2.2 0 4.1-.5 5.7-1.3l3 3 1.4-1.4L2.8 2.1zM12 17c-2.8 0-5-2.2-5-5 0-.7.2-1.4.5-2l1.5 1.5A3 3 0 0 0 9 12a3 3 0 0 0 3 3c.5 0 1-.1 1.5-.3l1.5 1.5c-.6.3-1.3.5-2 .5zm9.5-5c-.5.9-1.3 2-2.5 3.1l-1.6-1.6A7.7 7.7 0 0 0 19.9 12C18 9.1 15.3 7.5 12 7.5c-.7 0-1.4.1-2 .3L8.3 6.2c1.1-.4 2.3-.7 3.7-.7 8 0 11.5 7 11.5 7z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-slate-300" aria-hidden="true">
                      <path d="M12 5c8 0 11.5 7 11.5 7S20 19 12 19 0.5 12 0.5 12 4 5 12 5zm0 2.5C8.7 7.5 6 9.1 4.1 12 6 14.9 8.7 16.5 12 16.5S18 14.9 19.9 12C18 9.1 15.3 7.5 12 7.5zm0 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-4 py-3 font-medium text-white shadow-lg transition hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <nav className="text-center text-sm text-slate-300 space-y-3">
              <p>
                Don’t have an account?{" "}
                <a href={ROUTES.REGISTER} className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline">
                  Create one
                </a>
              </p>
              <p>
                Go to{" "}
                <a href={ROUTES.HOME} className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline">
                  Home
                </a>
              </p>
            </nav>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;