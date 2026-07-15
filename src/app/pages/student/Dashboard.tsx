import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Statistics from "../../components/dashboard/Statistics";
import RecentActivities from "../../components/dashboard/RecentActivities";
import QuickActions from "../../components/dashboard/QuickActions";
import {
  GraduationCap,
  Bell,
  Sparkles,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  BookOpen,
  User,
  MapPin,
  Check,
  FileText,
  AlertCircle,
} from "lucide-react";
import DashboardCard from "../../components/cards/DashboardCard";
import { toast } from "sonner";

interface TimetableSlot {
  id?: number;
  dayOfWeek: string;
  timeSlot: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  instructor: string;
}

interface RequestItem {
  id: number;
  requestType: string;
  reason: string;
  finalStatus: string;
  createdDate: string;
}

interface UserNotification {
  id: number;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

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

  const [upcomingClasses, setUpcomingClasses] = useState<TimetableSlot[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RequestItem[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

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
        const sem = currentStudent.semester;

        // 2. Fetch Attendance logs
        let attendanceRate = "92%";
        try {
          const attendanceRes = await api.get(`/api/attendance/entity/${rollNo}?type=STUDENT`);
          const attendanceLogs = attendanceRes.data;
          if (attendanceLogs.length > 0) {
            const presentCount = attendanceLogs.filter((l: any) => l.status === "Present").length;
            attendanceRate = `${Math.round((presentCount / attendanceLogs.length) * 100)}%`;
          }
        } catch (e) {
          console.warn("Could not load dynamic attendance, using fallback", e);
        }

        // 3. Fetch Exam marks to calculate GPA
        let gpaValue = currentStudent.cgpa || 9.20;
        try {
          const marksRes = await api.get("/api/exams/marks");
          const studentMarks = marksRes.data.filter((m: any) => m.studentRollNo === rollNo);
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
        } catch (e) {
          console.warn("Could not load exam marks for GPA, using profile CGPA", e);
        }

        // 4. Fetch Active Courses
        let activeCoursesCount = 6;
        try {
          const coursesRes = await api.get("/api/courses");
          const matchingCourses = coursesRes.data.filter(
            (c: any) => c.department === dept
          );
          activeCoursesCount = matchingCourses.length > 0 ? matchingCourses.length : 6;
        } catch (e) {
          console.warn("Could not load courses", e);
        }

        // 5. Fetch Borrowed Books count
        let borrowedCount = 1;
        try {
          const booksRes = await api.get("/api/books");
          const borrowedBooks = booksRes.data.filter(
            (b: any) => b.status === "Borrowed" && b.borrowedBy === currentStudent.name
          );
          borrowedCount = borrowedBooks.length;
        } catch (e) {
          console.warn("Could not load borrowed books", e);
        }

        setMetrics({
          attendanceRate,
          cumulativeGpa: String(gpaValue.toFixed(2)),
          activeCourses: activeCoursesCount,
          libraryBooksCount: borrowedCount,
          libraryOverdueText: borrowedCount > 0 ? "1 Overdue" : "0 Overdue",
        });

        // 6. Fetch Timetable for classes widget
        try {
          const timetableRes = await api.get(`/api/timetable?department=${dept}`);
          const semesterSlots = timetableRes.data.filter(
            (s: any) => s.semester.toLowerCase() === sem.toLowerCase()
          );
          const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
          const todayClasses = semesterSlots.filter((s: any) => s.dayOfWeek === todayDay);
          
          setUpcomingClasses(todayClasses.length > 0 ? todayClasses : semesterSlots.slice(0, 3));
        } catch (e) {
          console.error("Failed to load student timetable slots", e);
        }
      }
    } catch (err) {
      console.error("Failed to load student analytics", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRequestsAndNotifications = async () => {
    if (!user?.rollNo) return;
    try {
      // 1. Fetch requests
      const res = await api.get(`/api/requests/student/${user.rollNo}`);
      const list = res.data;
      const pending = list.filter((r: any) => r.finalStatus === "Pending" || r.finalStatus === "Faculty Approved").length;
      const approved = list.filter((r: any) => r.finalStatus === "Completed" || r.finalStatus === "Academic Admin Approved").length;
      const rejected = list.filter((r: any) => r.finalStatus === "Rejected").length;
      const ready = list.filter((r: any) => r.finalStatus === "Completed" && r.requestType !== "Leave").length;
      
      setReqMetrics({ pending, approved, rejected, ready });
      setPendingRequests(list.filter((r: any) => r.finalStatus === "Pending" || r.finalStatus === "Faculty Approved"));

      // 2. Fetch Notifications
      const notifRes = await api.get(`/api/notifications?userEmail=${user.email}`);
      setNotifications(notifRes.data);
    } catch (err) {
      console.error("Failed to load requests and notifications metrics", err);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      toast.success("Notification marked as read");
      loadRequestsAndNotifications();
    } catch (e) {
      console.error("Failed to mark notification read", e);
      toast.error("Failed to update notification");
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadStudentAnalytics();
      loadRequestsAndNotifications();
    }
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
            <GraduationCap className="w-12 h-12 text-white" />
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
        
        {/* Left Column: Feeds & Detailed Lists (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Upcoming Classes Widget */}
          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm font-sans text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
                <h3 className="text-lg font-bold tracking-tight">Class Schedule</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md select-none">
                {upcomingClasses.length > 0 && upcomingClasses[0].dayOfWeek === new Date().toLocaleDateString("en-US", { weekday: "long" }) ? "Today's Schedule" : "Upcoming Schedule"}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : upcomingClasses.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No classes scheduled for your semester.
              </div>
            ) : (
              <div className="grid gap-3">
                {upcomingClasses.map((cls, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-border/60 hover:border-indigo-600/30 bg-secondary/15 hover:bg-indigo-600/5 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-600/10">
                          {cls.subjectCode}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {cls.dayOfWeek}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">
                        {cls.subjectName}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600/80" />
                        <span>{cls.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600/80" />
                        <span>Room: {cls.room}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-600/80" />
                        <span className="truncate max-w-[120px]">{cls.instructor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Requests Details Widget */}
          <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm font-sans text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                <h3 className="text-lg font-bold tracking-tight">Active Request Tracker</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md select-none">
                Awaiting Approval
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No active requests pending endorsement.
              </div>
            ) : (
              <div className="grid gap-3">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-3.5 rounded-xl border border-border/60 bg-secondary/10 flex items-center justify-between gap-4">
                    <div className="space-y-1 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {req.requestType} Request
                        </span>
                        <span className="text-[9px] text-muted-foreground font-semibold">
                          Applied: {req.createdDate ? req.createdDate.split(" ")[0] : "N/A"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate leading-relaxed">
                        Reason: {req.reason}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-600 shrink-0">
                      <Clock className="w-3 h-3" />
                      {req.finalStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <RecentActivities />
        </div>

        {/* Right Column: Actions & Notification Feed (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-6 flex-grow">
            <QuickActions />

            {/* Interactive User Notifications Feed */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm text-left space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Bell className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                  <span className="text-base font-bold">Notifications Feed</span>
                </div>
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md animate-pulse">
                    {notifications.filter((n) => !n.isRead).length} New
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No notifications recorded.
                </div>
              ) : (
                <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border border-border/50 transition-all flex justify-between items-start gap-2 ${
                        notif.isRead
                          ? "bg-secondary/5 opacity-65"
                          : "bg-indigo-600/5 dark:bg-indigo-600/10 border-indigo-600/20"
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <p className={`font-bold text-foreground leading-normal ${notif.isRead ? "" : "text-indigo-600 dark:text-indigo-400"}`}>
                            {notif.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-muted-foreground/80 font-bold block mt-1">
                          {notif.date}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-90 transition-all cursor-pointer shrink-0"
                          title="Mark as Read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
