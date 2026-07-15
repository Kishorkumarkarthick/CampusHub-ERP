import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "../../context/ThemeContext";
import {
  Lock,
  Bell,
  Sun,
  Moon,
  Globe,
  CheckCircle,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "../../components/ui/utils";

interface PasswordFormInputs {
  currentPass: string;
  newPass: string;
  confirmPass: string;
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    assignments: true,
    attendance: true,
    library: false,
    exams: true,
    fees: true,
  });

  const [language, setLanguage] = useState("English");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password hide/show states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const triggerAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // React Hook Form for Password Change
  const {
    register: registerPass,
    handleSubmit: handlePassSubmit,
    watch: watchPass,
    reset: resetPass,
    formState: { errors: passErrors },
  } = useForm<PasswordFormInputs>();

  const watchNewPassword = watchPass("newPass");

  const onPassSubmit = async (data: PasswordFormInputs) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    triggerAlert("Your security password has been changed successfully.");
    resetPass();
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = () => {
    triggerAlert("System configuration preferences saved successfully.");
  };

  return (
    <div className="space-y-6 font-sans pb-12 transition-colors duration-300">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-xs text-muted-foreground">
          Update password locks, configure notification triggers, adjust theme schemes, and select default languages.
        </p>
      </div>

      {/* Success Alert Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Security settings */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/40 pb-3 select-none">
            <Lock className="w-5 h-5 text-indigo-500" />
            <span>Change Portal Password</span>
          </h3>

          {/* Form error blocks */}
          {Object.keys(passErrors).length > 0 && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] space-y-0.5 font-medium">
              <p className="font-bold">Password Input Alerts:</p>
              {passErrors.currentPass && <p>• {passErrors.currentPass.message}</p>}
              {passErrors.newPass && <p>• {passErrors.newPass.message}</p>}
              {passErrors.confirmPass && <p>• {passErrors.confirmPass.message}</p>}
            </div>
          )}

          <form onSubmit={handlePassSubmit(onPassSubmit)} className="space-y-4 text-xs font-sans">
            {/* Current password */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs text-foreground"
                  {...registerPass("currentPass", { required: "Current password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">New Security Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs text-foreground"
                  {...registerPass("newPass", {
                    required: "New password is required",
                    minLength: { value: 6, message: "New password must be at least 6 characters long" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs text-foreground"
                  {...registerPass("confirmPass", {
                    required: "Confirming password is required",
                    validate: (val) => val === watchNewPassword || "Passwords combination entries do not match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 shadow-md shadow-primary/15 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Security Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Preferences & Notifications */}
        <div className="space-y-6">
          {/* Notifications config */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/40 pb-3 select-none">
              <Bell className="w-5 h-5 text-indigo-500" />
              <span>Email Notification Subscriptions</span>
            </h3>

            <div className="space-y-3.5 text-xs font-medium">
              {[
                { key: "assignments", label: "Assignment submissions notifications", desc: "Alert me when homework deadlines approach or grades are published." },
                { key: "attendance", label: "Attendance threshold warnings", desc: "Notify me if my attendance rate drops below the required 75% bar." },
                { key: "library", label: "Library textbook overdue alerts", desc: "Send warnings 2 days prior to borrowing period expirations." },
                { key: "exams", label: "Exam timetable scheduling updates", desc: "Alert me when hall ticket venues or dates are updated by registrar." },
                { key: "fees", label: "Financial invoice reminders", desc: "Receive invoice bills and payment confirmations ledger logs." },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex gap-3.5 p-3 rounded-xl border border-border/40 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={() => handleToggleNotification(item.key as any)}
                    className="w-4 h-4 shrink-0 rounded border-border text-primary focus:ring-primary cursor-pointer mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-foreground block">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-normal mt-0.5 block">
                      {item.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSavePreferences}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 shadow-md shadow-primary/15 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Notification Rules</span>
              </button>
            </div>
          </div>

          {/* Theme & Localization Settings */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/40 pb-3 select-none">
              <Globe className="w-5 h-5 text-indigo-500" />
              <span>System &amp; Localization Configs</span>
            </h3>

            <div className="space-y-4 text-xs">
              {/* Theme toggle switch */}
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <div>
                  <span className="font-bold text-foreground block">Visual Color Scheme</span>
                  <span className="text-[10px] text-muted-foreground">Switch the UI theme setting.</span>
                </div>

                <div className="grid grid-cols-2 gap-1 bg-secondary/50 p-1 rounded-xl border border-border/60 w-36">
                  <button
                    onClick={() => theme === "dark" && toggleTheme()}
                    className={cn(
                      "flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all",
                      theme === "light"
                        ? "bg-card text-foreground shadow-sm border border-border/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Sun className="w-3.5 h-3.5" /> Light
                  </button>
                  <button
                    onClick={() => theme === "light" && toggleTheme()}
                    className={cn(
                      "flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all",
                      theme === "dark"
                        ? "bg-card text-foreground shadow-sm border border-border/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Moon className="w-3.5 h-3.5" /> Dark
                  </button>
                </div>
              </div>

              {/* Language selection dropdown */}
              <div className="flex justify-between items-center py-2">
                <div>
                  <span className="font-bold text-foreground block">System Language</span>
                  <span className="text-[10px] text-muted-foreground">Select local formatting defaults.</span>
                </div>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-semibold text-foreground cursor-pointer"
                >
                  <option value="English">English (US)</option>
                  <option value="Spanish">Spanish (ES)</option>
                  <option value="French">French (FR)</option>
                  <option value="German">German (DE)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
