import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  User,
  Briefcase,
  LayoutDashboard,
  BookOpen,
  Calendar,
  CheckCircle,
  Award,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import NotificationBell from "../components/common/NotificationBell";
import FloatingChatbot from "../components/common/FloatingChatbot";

export default function FacultyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login?role=faculty");
  };

  const navItems = [
    {
      to: "/faculty/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/faculty/profile",
      label: "Profile",
      icon: User,
    },
    {
      to: "/faculty/subjects",
      label: "Subjects Registry",
      icon: BookOpen,
    },
    {
      to: "/faculty/timetable",
      label: "Weekly Timetable",
      icon: Calendar,
    },
    {
      to: "/faculty/attendance",
      label: "Attendance Registry",
      icon: CheckCircle,
    },
    {
      to: "/faculty/marks",
      label: "Internal Marks",
      icon: Award,
    },
    {
      to: "/faculty/requests",
      label: "Request Approvals",
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-border bg-card py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="font-bold">CampusHub Faculty</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="hidden sm:block text-left select-none">
              <p className="text-xs font-bold leading-tight">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground">{user?.title || "Associate Professor"}</p>
            </div>
          </div>

          {user?.email && <NotificationBell userEmail={user.email} />}

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex flex-col sm:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full sm:w-64 border-r border-border bg-card p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Content Outlet */}
        <main className="flex-grow p-6 sm:p-8 bg-muted/20">
          <Outlet />
        </main>
      </div>
      {user?.email && <FloatingChatbot userEmail={user.email} role="faculty" />}
    </div>
  );
}
