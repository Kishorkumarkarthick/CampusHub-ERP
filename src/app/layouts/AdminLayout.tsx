import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  User,
  Shield,
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Award,
  CreditCard,
  Landmark,
  BookMarked,
  Megaphone,
  BarChart3,
  Briefcase,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import NotificationBell from "../components/common/NotificationBell";
import FloatingChatbot from "../components/common/FloatingChatbot";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/admin-login");
  };

  const subRole = user?.subRole || (
    user?.email?.toLowerCase().includes("academic") ? "academic" :
    user?.email?.toLowerCase().includes("finance") ? "finance" :
    user?.email?.toLowerCase().includes("library") ? "library" :
    user?.email?.toLowerCase().includes("placement") ? "placement" :
    "super"
  );

  const allNavItems = [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["super", "academic", "finance", "library", "placement"],
    },
    {
      to: "/admin/students",
      label: "Students",
      icon: GraduationCap,
      roles: ["super", "academic"],
    },
    {
      to: "/admin/faculty",
      label: "Faculty",
      icon: Users,
      roles: ["super", "academic"],
    },
    {
      to: "/admin/departments",
      label: "Departments",
      icon: Landmark,
      roles: ["super", "academic"],
    },
    {
      to: "/admin/courses",
      label: "Courses",
      icon: BookOpen,
      roles: ["super", "academic"],
    },
    {
      to: "/admin/subjects",
      label: "Subjects",
      icon: BookOpen,
      roles: ["super", "academic"],
    },
    {
      to: "/admin/attendance",
      label: "Attendance",
      icon: Calendar,
      roles: ["super", "academic"],
    },
    {
      to: "/admin/timetable",
      label: "Timetable Schedule",
      icon: Calendar,
      roles: ["super", "academic"],
    },
    {
      to: "/admin/exams",
      label: "Exams",
      icon: Award,
      roles: ["super", "academic"],
    },
    {
      to: "/admin/fees",
      label: "Fees & Dues",
      icon: CreditCard,
      roles: ["super", "finance"],
    },
    {
      to: "/admin/library",
      label: "Library Catalog",
      icon: BookMarked,
      roles: ["super", "library"],
    },
    {
      to: "/admin/placements",
      label: "Placements Console",
      icon: Briefcase,
      roles: ["super", "placement"],
    },
    {
      to: "/admin/announcements",
      label: "Announcements",
      icon: Megaphone,
      roles: ["super"],
    },
    {
      to: "/admin/reports",
      label: "Reports & Analytics",
      icon: BarChart3,
      roles: ["super", "finance", "library", "placement"],
    },
    {
      to: "/admin/requests",
      label: "Request Approvals",
      icon: ClipboardCheck,
      roles: ["super", "academic"],
    },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(subRole));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header Bar */}
      <header className="border-b border-border bg-card py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-bold">CampusHub Admin</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/admin/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold leading-tight">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground">{user?.title || "Staff Member"}</p>
            </div>
          </Link>

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
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/10"
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
      {user?.email && <FloatingChatbot userEmail={user.email} role="admin" />}
    </div>
  );
}
