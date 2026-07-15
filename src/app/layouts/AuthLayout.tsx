import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, ArrowLeft, GraduationCap } from "lucide-react";

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Determine if it is student or admin login based on URL for custom side illustrations
  const isAdmin = location.pathname.includes("admin");

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-300 font-sans">
      {/* Left Pane - Decorative Section (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white flex-col justify-between p-12 select-none border-r border-indigo-900/30">
        {/* Animated ambient light blobs */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse duration-7000" />

        {/* Brand/Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">
              CampusHub ERP
            </span>
            <span className="block text-[10px] text-indigo-300 font-medium tracking-widest uppercase">
              One Platform for Smart College Management
            </span>
          </div>
        </div>

        {/* Dynamic content depending on role */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            {isAdmin ? "Administrative Gateway" : "Student Portal Hub"}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {isAdmin
              ? "Oversee and elevate your institution's success."
              : "Access your entire academic universe in one tap."}
          </h1>
          <p className="text-slate-300 leading-relaxed text-base">
            {isAdmin
              ? "Manage departments, verify records, monitor academic progress, and make data-driven decisions seamlessly with real-time operations dashboards."
              : "Track daily attendance, view exam marks, review library checkouts, and stay updated with live announcements from faculty."}
          </p>

          <div className="pt-4 border-t border-slate-800 flex gap-8">
            <div>
              <p className="text-2xl font-bold text-white">99.8%</p>
              <p className="text-xs text-indigo-300 font-medium">Uptime SLA</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">15k+</p>
              <p className="text-xs text-indigo-300 font-medium">Active Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">4.9 ★</p>
              <p className="text-xs text-indigo-300 font-medium">User Rating</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400">
           &copy; {new Date().getFullYear()} CampusHub ERP. Powered by Spring Boot and React.
        </div>
      </div>

      {/* Right Pane - Form Card Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between min-h-screen relative p-6 sm:p-12">
        {/* Header Actions */}
        <header className="flex justify-between items-center w-full z-10">
          <Link
            to="/"
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Home</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-border/50 shadow-sm transition-all active:scale-95 duration-200 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-500 animate-spin-once" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 animate-spin-once" />
            )}
          </button>
        </header>

        {/* Centered Auth Card Container */}
        <main className="my-auto flex justify-center w-full">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>

        {/* Mobile-only Footer info */}
        <footer className="text-center text-xs text-muted-foreground mt-8 lg:hidden">
           &copy; {new Date().getFullYear()} CampusHub ERP. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
