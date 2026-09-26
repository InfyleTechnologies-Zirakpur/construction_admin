import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { authApi, apiError } from "../../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@infyle.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAuthenticated = localStorage.getItem("adminToken");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({ email: email.trim(), password });
      const { user, accessToken } = response.data;

      localStorage.setItem("adminToken", accessToken);
      localStorage.setItem("adminUser", JSON.stringify(user));
      localStorage.setItem("adminAuth", "true");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-950 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-dark-700 bg-dark-800 shadow-2xl shadow-dark-950/40">
        <div className="bg-gradient-to-r from-primary to-primary-600 px-6 py-8 text-white">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-100">
            Admin portal
          </p>
          <h1 className="mt-3 text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-primary-100">
            Sign in to manage projects, users, and operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@infyle.com"
                className="w-full rounded-xl border border-dark-600 bg-dark-900 py-3 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-dark-600 bg-dark-900 py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-3.5 text-slate-400 transition hover:text-slate-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* <div className="flex items-center justify-between text-sm text-slate-400">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-dark-600 bg-dark-900" />
              Remember me
            </label> */}
            {/* <button type="button" className="text-primary-400 transition hover:text-primary-300">
              Forgot password?
            </button> */}
          {/* </div> */}

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-dark-800 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* <div className="rounded-xl border border-dark-700 bg-dark-900/70 px-3 py-2 text-xs text-slate-400">
            Demo credentials: <span className="font-medium text-slate-200">admin@infyle.com</span>
          </div> */}
        </form>
      </div>
    </div>
  );
}