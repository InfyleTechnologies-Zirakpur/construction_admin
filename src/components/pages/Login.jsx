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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-primary to-orange-600 px-6 py-8 text-white text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-orange-100">
            Constructor Control Center
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Admin Sign In
          </h1>
          <p className="mt-1 text-xs text-orange-100">
            Enter your credentials to access the management portal.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@infyle.com"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-3 text-slate-400 transition hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign in to Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
