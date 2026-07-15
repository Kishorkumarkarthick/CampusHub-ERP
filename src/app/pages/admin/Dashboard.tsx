import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  ShieldCheck,
  Mail,
  Landmark,
  Sparkles,
  UserCheck,
  Users,
  Briefcase,
  BookOpen,
  DollarSign,
  Loader2,
  BookMarked,
  GraduationCap,
  Clock,
  CheckCircle,
  Send,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    courses: 0,
    pendingFees: 0.0,
    books: 0,
  });
  const [reqMetrics, setReqMetrics] = useState({
    pending: 0,
    approved: 0,
    completed: 0,
  });

  const subRole = user?.subRole || (
    user?.email?.toLowerCase().includes("academic") ? "academic" :
    user?.email?.toLowerCase().includes("finance") ? "finance" :
    user?.email?.toLowerCase().includes("library") ? "library" :
    user?.email?.toLowerCase().includes("placement") ? "placement" :
    "super"
  );

  const loadDashboardAnalytics = async () => {
    try {
      setLoading(true);
      const [studentsRes, facultyRes, coursesRes, feesRes, booksRes] = await Promise.all([
        api.get("/api/students"),
        api.get("/api/faculty"),
        api.get("/api/courses"),
        api.get("/api/fees/invoices"),
        api.get("/api/books"),
      ]);

      const unpaidSum = feesRes.data
        .filter((inv: any) => inv.status === "Pending")
        .reduce((sum: number, inv: any) => sum + inv.amount, 0);

      setStats({
        students: studentsRes.data.length,
        faculty: facultyRes.data.length,
        courses: coursesRes.data.length,
        pendingFees: unpaidSum,
        books: booksRes.data.length,
      });

      if (subRole === "academic" || subRole === "super") {
        try {
          const res = await api.get("/api/requests/admin");
          const list = res.data;
          const pending = list.filter((r: any) => r.academicAdminStatus === "Pending").length;
          const approved = list.filter((r: any) => r.academicAdminStatus === "Approved" || r.finalStatus === "Academic Admin Approved").length;
          const completed = list.filter((r: any) => r.finalStatus === "Completed").length;
          setReqMetrics({ pending, approved, completed });
        } catch (err) {
          console.error("Failed to load admin request metrics", err);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardAnalytics();
  }, []);

  // Configure role-based stats cards
  const getCards = () => {
    switch (subRole) {
      case "academic":
        return [
          {
            label: "Enrolled Students",
            value: `${stats.students} Registered`,
            icon: Users,
            color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
          },
          {
            label: "Appointed Faculty",
            value: `${stats.faculty} Appointed`,
            icon: Briefcase,
            color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
          },
          {
            label: "Academic Courses",
            value: `${stats.courses} Active`,
            icon: BookOpen,
            color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
          },
        ];
      case "finance":
        return [
          {
            label: "Outstanding Dues",
            value: `₹${stats.pendingFees.toFixed(2)}`,
            icon: DollarSign,
            color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
          },
          {
            label: "Total Transactions",
            value: "148 Paid Invoices",
            icon: Landmark,
            color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
          },
        ];
      case "library":
        return [
          {
            label: "Library Inventory",
            value: `${stats.books} Registered Books`,
            icon: BookMarked,
            color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
          },
          {
            label: "Active Borrows",
            value: "2 Active Loans",
            icon: UserCheck,
            color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
          },
        ];
      case "placement":
        return [
          {
            label: "Placed Ratio",
            value: "84.2% Candidates Placed",
            icon: GraduationCap,
            color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
          },
          {
            label: "Active Recruitment Drives",
            value: "3 Schedules Pending",
            icon: Briefcase,
            color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
          },
        ];
      case "super":
      default:
        return [
          {
            label: "Enrolled Students",
            value: `${stats.students} Registered`,
            icon: Users,
            color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
          },
          {
            label: "Appointed Faculty",
            value: `${stats.faculty} Appointed`,
            icon: Briefcase,
            color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
          },
          {
            label: "Outstanding Dues",
            value: `₹${stats.pendingFees.toFixed(2)}`,
            icon: DollarSign,
            color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
          },
          {
            label: "Library Catalog size",
            value: `${stats.books} Volumes`,
            icon: BookMarked,
            color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
          },
        ];
    }
  };

  const cards = getCards();

  const getScope = () => {
    switch (subRole) {
      case "academic":
        return "Academics, Students, Course Curriculum & Schedules";
      case "finance":
        return "Fee Invoices, Receipts, and Financial Audits";
      case "library":
        return "Books Inventory, Fine collections, Borrows & Returns";
      case "placement":
        return "Placement Drives, Applications, and Interviews";
      case "super":
      default:
        return "Global Administrative Authority";
    }
  };

  const getTitle = () => {
    switch (subRole) {
      case "academic":
        return "Academic Controller Panel";
      case "finance":
        return "Finance & Accounts Dashboard";
      case "library":
        return "Library Console Portal";
      case "placement":
        return "Corporate Placements Desk";
      case "super":
      default:
        return "Super Admin Gateway";
    }
  };

  return (
    <div className="space-y-6 font-sans text-left pb-12">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-1/3 translate-x-1/10 opacity-10">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> {getTitle()}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name || "Admin"}!</h1>
          <p className="text-sm opacity-90">
            Institutional Management Console. Access Role: <strong className="uppercase">{subRole}</strong>.
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {card.label}
                </p>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mt-2" />
                ) : (
                  <p className="text-xl font-bold tracking-tight">{card.value}</p>
                )}
              </div>
              <div className={`p-4 rounded-2xl ${card.color} shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Management Dials for Academic / Super admin */}
      {(subRole === "academic" || subRole === "super") && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight">Academic Requests Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Admin Endorsement</p>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mt-2" />
                ) : (
                  <p className="text-xl font-bold tracking-tight">{reqMetrics.pending}</p>
                )}
              </div>
              <div className="p-4 rounded-2xl text-amber-600 dark:text-amber-400 bg-amber-500/10 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Certificates Generated</p>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mt-2" />
                ) : (
                  <p className="text-xl font-bold tracking-tight">{reqMetrics.approved}</p>
                )}
              </div>
              <div className="p-4 rounded-2xl text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Certificates Issued</p>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mt-2" />
                ) : (
                  <p className="text-xl font-bold tracking-tight">{reqMetrics.completed}</p>
                )}
              </div>
              <div className="p-4 rounded-2xl text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 shrink-0">
                <Send className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Profile Overview Card */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/80 pb-3 select-none">
            <UserCheck className="w-5 h-5 text-purple-500" />
            <span>Administrator Profile</span>
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Officer Name:</span>
              <span className="font-semibold">{user?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Official Title:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">{user?.title || "Administrator"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">System Authority:</span>
              <span className="font-semibold capitalize text-purple-600 dark:text-purple-400">{subRole} Admin</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/80 pb-3 select-none">
            <Landmark className="w-5 h-5 text-purple-500" />
            <span>Division Management</span>
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-semibold">{user?.department || "Administration"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Corporate Email:</span>
              <span className="font-semibold flex items-center gap-1.5 select-all">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {user?.email}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Access Scope:</span>
              <span className="font-semibold text-xs">{getScope()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
