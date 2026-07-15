import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, User, Briefcase, Shield } from "lucide-react";

type Role = "student" | "faculty" | "admin";

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedRole, setSelectedRole] = useState<Role>(() => {
    const roleParam = searchParams.get("role") as Role;
    if (roleParam === "student" || roleParam === "faculty" || roleParam === "admin") {
      return roleParam;
    }
    return "student";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Dynamic quick-fill data based on selected role
  const quickFillCredentials = {
    student: { email: "student@college.edu", password: "password123" },
    faculty: { email: "faculty@college.edu", password: "password123" },
    admin: { email: "admin@college.edu", password: "password123" },
  };

  const handleQuickFill = () => {
    const creds = quickFillCredentials[selectedRole];
    setValue("email", creds.email);
    setValue("password", creds.password);
    clearErrors();
    setAuthError(null);
  };

  const onSubmit = async (data: LoginFormInputs) => {
    setAuthError(null);
    setLocalLoading(true);

    const result = await login(data.email, data.password, selectedRole);
    setLocalLoading(false);

    if (result.success) {
      if (selectedRole === "admin") {
        navigate("/admin/dashboard");
      } else if (selectedRole === "faculty") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } else {
      setAuthError(result.error || "Authentication failed");
    }
  };

  // Color config based on selected role tab
  const roleThemes = {
    student: {
      accent: "indigo",
      text: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-600 hover:bg-indigo-700",
      border: "border-indigo-500",
      ring: "focus:ring-indigo-500/40 focus:border-indigo-500",
      tabBg: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    },
    faculty: {
      accent: "emerald",
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-600 hover:bg-emerald-700",
      border: "border-emerald-500",
      ring: "focus:ring-emerald-500/40 focus:border-emerald-500",
      tabBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    admin: {
      accent: "purple",
      text: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-600 hover:bg-purple-700",
      border: "border-purple-500",
      ring: "focus:ring-purple-500/40 focus:border-purple-500",
      tabBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
    },
  };

  const currentTheme = roleThemes[selectedRole];

  return (
    <div className="space-y-6 font-sans">
      {/* Title Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Sign In</h2>
        <p className="text-sm text-muted-foreground">
          Access your personalized dashboard by completing the credentials.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-secondary/50 p-1.5 rounded-2xl border border-border/60">
        {(["student", "faculty", "admin"] as Role[]).map((role) => {
          const isActive = selectedRole === role;
          const RoleIcon = { student: User, faculty: Briefcase, admin: Shield }[role];
          const label = { student: "Student", faculty: "Faculty", admin: "Admin" }[role];

          return (
            <button
              key={role}
              type="button"
              onClick={() => {
                setSelectedRole(role);
                setAuthError(null);
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? currentTheme.tabBg + " shadow-sm border border-border/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <RoleIcon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Message Box */}
      {(authError || errors.email || errors.password) && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Verification Alert</p>
            {authError && <p className="text-xs opacity-90">{authError}</p>}
            {errors.email && <p className="text-xs opacity-90">{errors.email.message}</p>}
            {errors.password && <p className="text-xs opacity-90">{errors.password.message}</p>}
          </div>
        </div>
      )}

      {/* Form Submission */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-foreground/80">
            Registered Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="text"
              placeholder={`e.g. ${quickFillCredentials[selectedRole].email}`}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border border-border/80 bg-input-background focus:outline-none focus:ring-2 focus:ring-opacity-40 transition-all text-sm font-sans ${currentTheme.ring}`}
              disabled={localLoading}
              {...register("email", {
                required: "Email address is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email format",
                },
              })}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-semibold text-foreground/80">
              Access Password
            </label>
            <Link
              to="/forgot-password"
              className={`text-xs font-semibold hover:underline transition-colors ${currentTheme.text}`}
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
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-3 rounded-xl border border-border/80 bg-input-background focus:outline-none focus:ring-2 focus:ring-opacity-40 transition-all text-sm ${currentTheme.ring}`}
              disabled={localLoading}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
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

        {/* Submit */}
        <button
          type="submit"
          className={`w-full py-3 rounded-xl text-white font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 cursor-pointer disabled:opacity-75 disabled:pointer-events-none ${currentTheme.bg}`}
          disabled={localLoading}
        >
          {localLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying status...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Fill Box */}
      <div className="pt-4 border-t border-border/40 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-medium">Testing Credentials</span>
          <button
            onClick={handleQuickFill}
            className={`inline-flex items-center gap-1 text-xs font-bold hover:underline cursor-pointer ${currentTheme.text}`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Quick Fill
          </button>
        </div>
        <div className="p-3 bg-secondary/50 rounded-xl border border-border/50 text-[11px] text-muted-foreground leading-relaxed flex flex-col gap-1 select-all">
          <div>
            <span className="font-semibold text-secondary-foreground">Role:</span>{" "}
            <span className="capitalize">{selectedRole}</span>
          </div>
          <div>
            <span className="font-semibold text-secondary-foreground">Email:</span>{" "}
            {quickFillCredentials[selectedRole].email}
          </div>
          <div>
            <span className="font-semibold text-secondary-foreground">Password:</span>{" "}
            {quickFillCredentials[selectedRole].password}
          </div>
        </div>
      </div>
    </div>
  );
}
