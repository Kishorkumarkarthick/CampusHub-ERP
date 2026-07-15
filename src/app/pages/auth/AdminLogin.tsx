import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const handleQuickFill = () => {
    setEmail("admin@college.edu");
    setPassword("password123");
    setError(null);
  };

  const validate = () => {
    if (!email) {
      setError("Email address is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid administrative email address");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLocalLoading(true);
    const result = await login(email, password, "admin");
    setLocalLoading(false);

    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Staff &amp; Executive Access</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Admin Gate</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to access courses, finance tools, and academic schedules.
        </p>
      </div>

      {/* Error Message Box */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Authentication Alert</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-foreground/80">
            Administrative Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. admin@college.edu"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/80 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-600 transition-all text-sm font-sans"
              disabled={localLoading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-semibold text-foreground/80">
              Admin Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-purple-600 hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-border/80 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-600 transition-all text-sm"
              disabled={localLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/10 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
          disabled={localLoading}
        >
          {localLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying Status...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Fill demo section */}
      <div className="pt-4 border-t border-border/40 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Testing Credentials</span>
          <button
            onClick={handleQuickFill}
            className="inline-flex items-center gap-1 text-xs text-purple-600 font-bold hover:underline cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Quick Fill
          </button>
        </div>
        <div className="p-3 bg-secondary/50 rounded-xl border border-border/50 text-[11px] text-muted-foreground leading-relaxed flex flex-col gap-1 select-all">
          <div><span className="font-semibold text-secondary-foreground">Email:</span> admin@college.edu</div>
          <div><span className="font-semibold text-secondary-foreground">Password:</span> password123</div>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Are you a student?{" "}
        <Link to="/student-login" className="font-bold text-purple-600 hover:underline">
          Go to Student Login
        </Link>
      </div>
    </div>
  );
}
