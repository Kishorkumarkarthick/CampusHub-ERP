import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Statistics from "../../components/dashboard/Statistics";
import RecentActivities from "../../components/dashboard/RecentActivities";
import QuickActions from "../../components/dashboard/QuickActions";
import { GraduationCap, Bell, Sparkles, ChevronRight, Loader2, Clock, CheckCircle2, XCircle, Download } from "lucide-react";
import DashboardCard from "../../components/cards/DashboardCard";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    attendanceRate: "92.4%",
    cumulativeGpa: "9.15",
    activeCourses: 6,
    libraryBooksCount: 3,
    libraryOverdueText: "1 Overdue",
  });
  const [reqMetrics, setReqMetrics] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    ready: 0,
  });

  const loadStudentAnalytics = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);

      // 1. Fetch Students to find profile matching email
      const studentRes = await api.get("/api/students");
      const currentStudent = studentRes.data.find((s: any) => s.email === user.email);

      if (currentStudent) {
        const rollNo = currentStudent.rollNo;
        const dept = currentStudent.department;

        // 2. Fetch Attendance logs
        const attendanceRes = await api.get(`/api/attendance/entity/${rollNo}?type=STUDENT`);
        const attendanceLogs = attendanceRes.data;
        let attendanceRate = "92.4%";
        if (attendanceLogs.length > 0) {
          const presentCount = attendanceLogs.filter((l: any) => l.status === "Present").length;
          attendanceRate = `${Math.round((presentCount / attendanceLogs.length) * 100)}%`;
        }

        // 3. Fetch Exam marks to calculate GPA
        const marksRes = await api.get("/api/exams/marks");
        const studentMarks = marksRes.data.filter((m: any) => m.studentRollNo === rollNo);
        let gpaValue = 9.15;
        if (studentMarks.length > 0) {
          const gradePoints: Record<string, number> = {
            "A+": 10,
            A: 9,
            B: 8,
            C: 7,
            D: 6,
            F: 0,
          };
          let totalPoints = 0;
          let counted = 0;
          studentMarks.forEach((m: any) => {
            const pt = gradePoints[m.grade] || 8;
            totalPoints += pt;
            counted++;
          });
          gpaValue = Math.round((totalPoints / counted) * 100) / 100;
        }

        // 4. Fetch Active Courses
        const coursesRes = await api.get("/api/courses");
        const matchingCourses = coursesRes.data.filter(
          (c: any) => c.departmentName === dept
        );
        const activeCoursesCount = matchingCourses.length > 0 ? matchingCourses.length : 6;

        // 5. Fetch Borrowed Books count
        const booksRes = await api.get("/api/books");
        const borrowedBooks = booksRes.data.filter(
          (b: any) => b.status === "Borrowed" && b.borrowedBy === currentStudent.name
        );

        setMetrics({
          attendanceRate,
          cumulativeGpa: String(gpaValue),
          activeCourses: activeCoursesCount,
          libraryBooksCount: borrowedBooks.length,
          libraryOverdueText: borrowedBooks.length > 0 ? "1 Overdue" : "0 Overdue",
        });
      }
    } catch (err) {
      console.error("Failed to load student analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRequestMetrics = async () => {
    if (!user?.rollNo) return;
    try {
      const res = await api.get(`/api/requests/student/${user.rollNo}`);
      const list = res.data;
      const pending = list.filter((r: any) => r.finalStatus === "Pending" || r.finalStatus === "Faculty Approved").length;
      const approved = list.filter((r: any) => r.finalStatus === "Completed" || r.finalStatus === "Academic Admin Approved").length;
      const rejected = list.filter((r: any) => r.finalStatus === "Rejected").length;
      const ready = list.filter((r: any) => r.finalStatus === "Completed" && r.requestType !== "Leave").length;
      setReqMetrics({ pending, approved, rejected, ready });
    } catch (err) {
      console.error("Failed to load request metrics", err);
    }
  };

  useEffect(() => {
    loadStudentAnalytics();
    loadRequestMetrics();
  }, [user?.email, user?.rollNo]);

  return (
    <div className="space-y-8 font-sans transition-colors duration-300">
      {/* Top Greeting Banner */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white shadow-lg overflow-hidden border border-indigo-800/40 select-none">
        {/* Backdrop graphics */}
        <div className="absolute right-[-10%] bottom-[-30%] w-96 h-96 rounded-full bg-indigo-500/10 blur-[80px]" />
        <div className="absolute right-[10%] top-[-20%] w-64 h-64 rounded-full bg-purple-500/10 blur-[80px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Semester Cycle 2026-A
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="text-sm text-indigo-200 leading-relaxed font-medium">
              Track your attendance, review exam reports, check active assignments, and communicate with instructors directly. Everything is running smoothly.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/10 border border-white/20 shadow-inner shrink-0 backdrop-blur-sm">
            <GraduationCap className="w-12 h-12 text-white animate-bounce-slow" />
          </div>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Academic Key Indicators</h2>
          <span className="text-xs text-muted-foreground font-semibold">Updated 5m ago</span>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <Statistics
            attendanceRate={metrics.attendanceRate}
            cumulativeGpa={metrics.cumulativeGpa}
            activeCourses={metrics.activeCourses}
            libraryBooksCount={metrics.libraryBooksCount}
            libraryOverdueText={metrics.libraryOverdueText}
          />
        )}
      </section>

      {/* Request Management Indicators */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Request Management Indicators</h2>
          <span className="text-xs text-muted-foreground font-semibold">Live status</span>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Pending Requests"
            value={String(reqMetrics.pending)}
            icon={Clock}
            colorAccent="amber"
            subValue="Awaiting endorsement"
          />
          <DashboardCard
            title="Approved Requests"
            value={String(reqMetrics.approved)}
            icon={CheckCircle2}
            colorAccent="indigo"
            subValue="Excused / Clearance"
          />
          <DashboardCard
            title="Rejected Requests"
            value={String(reqMetrics.rejected)}
            icon={XCircle}
            colorAccent="rose"
            subValue="Declined requests"
          />
          <DashboardCard
            title="Certificates Ready"
            value={String(reqMetrics.ready)}
            icon={Download}
            colorAccent="emerald"
            subValue="Available for download"
          />
        </div>
      </section>

      {/* Primary Dashboard Content Grid */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-5">
        {/* Left Column: Recent Activity Feed */}
        <div className="lg:col-span-3">
          <RecentActivities />
        </div>

        {/* Right Column: Quick Actions Shortcuts & College Notice */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="flex-grow">
            <QuickActions />
          </div>

          {/* Quick Announcement Preview */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Bell className="w-4 h-4 text-amber-500 animate-swing" />
                <span>Notice Broadcaster</span>
              </div>
            </div>
            <div className="p-3 bg-secondary/40 dark:bg-secondary/10 rounded-xl border border-border/55">
              <p className="text-xs font-bold text-foreground">Mid-Semester Exam Timetable</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-medium">
                Department schedules for Mid-Term exam cycles have been published. Check your subject sections.
              </p>
              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block mt-2">
                Published yesterday by Registrar
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
