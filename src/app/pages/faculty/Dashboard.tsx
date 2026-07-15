import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  BookOpen,
  Users,
  CheckCircle,
  TrendingUp,
  Calendar,
  AlertCircle,
  Bell,
  ArrowRight,
  Loader2,
  User,
  Shield,
  Clock,
  Sparkles,
  ClipboardCheck,
  FileSpreadsheet,
  CalendarDays,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

interface TimetableSlot {
  dayOfWeek: string;
  timeSlot: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  instructor: string;
  department: string;
  semester: string;
}

interface FacultyProfileData {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: string;
  joiningYear: number;
  avatar: string;
}

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [facultyDetail, setFacultyDetail] = useState<FacultyProfileData | null>(null);
  const [metrics, setMetrics] = useState({
    subjectsCount: 4,
    studentsCount: 148,
    attendanceRate: "92.4%",
    syllabusPercent: 68,
  });
  const [reqMetrics, setReqMetrics] = useState({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0,
  });
  const [todayLectures, setTodayLectures] = useState<TimetableSlot[]>([]);

  // Simple calendar grid data for July 2026
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const firstDayOffset = 3; // Wednesday start

  const loadRequestMetrics = async (dept: string) => {
    try {
      const res = await api.get(`/api/requests/faculty/${encodeURIComponent(dept)}`);
      const list = res.data;
      const pending = list.filter((r: any) => r.facultyStatus === "Pending").length;
      const todayStr = new Date().toISOString().split("T")[0];
      const approvedToday = list.filter((r: any) => r.facultyStatus === "Approved" && r.updatedDate && r.updatedDate.startsWith(todayStr)).length;
      const rejectedToday = list.filter((r: any) => r.facultyStatus === "Rejected" && r.updatedDate && r.updatedDate.startsWith(todayStr)).length;
      setReqMetrics({ pending, approvedToday, rejectedToday });
    } catch (err) {
      console.error("Failed to load request metrics", err);
    }
  };

  const loadFacultyAnalytics = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);

      // 1. Fetch Faculty Profile details
      const facultyRes = await api.get("/api/faculty");
      const currentFaculty = facultyRes.data.find((f: any) => f.email === user.email);

      if (currentFaculty) {
        setFacultyDetail(currentFaculty);
        const dept = currentFaculty.department;

        // 2. Fetch Timetable slots for this Instructor
        const timetableRes = await api.get("/api/timetable");
        const facultySlots: TimetableSlot[] = timetableRes.data.filter(
          (slot: TimetableSlot) => slot.instructor.toLowerCase() === user.email.toLowerCase()
        );

        // Calculate unique subject codes taught
        const uniqueSubjects = new Set(facultySlots.map((s) => s.subjectCode));
        const subjectsCount = uniqueSubjects.size > 0 ? uniqueSubjects.size : 4;

        // 3. Fetch Students in this department
        const studentRes = await api.get("/api/students");
        const deptStudents = studentRes.data.filter(
          (s: any) => s.department === dept
        );
        const studentsCount = deptStudents.length > 0 ? deptStudents.length : 148;

        // 4. Calculate today's lectures
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayName = days[new Date().getDay()];
        // Fallback to Monday if weekend
        const filterDay = (todayName === "Saturday" || todayName === "Sunday") ? "Monday" : todayName;

        const lectures = timetableRes.data.filter(
          (slot: TimetableSlot) =>
            slot.instructor.toLowerCase() === user.email.toLowerCase() &&
            slot.dayOfWeek.toLowerCase() === filterDay.toLowerCase()
        );
        setTodayLectures(lectures);

        setMetrics({
          subjectsCount,
          studentsCount,
          attendanceRate: "92.4%",
          syllabusPercent: 68,
        });

        // Load requests metrics
        loadRequestMetrics(dept);
      }
    } catch (err) {
      console.error("Failed to load faculty analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyAnalytics();
  }, [user?.email]);

  const stats = [
    {
      label: "My Subjects",
      value: `${metrics.subjectsCount} Classes`,
      subtext: user?.department || "Computer Science & Engineering",
      icon: BookOpen,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      label: "Total Students Assigned",
      value: `${metrics.studentsCount} Students`,
      subtext: "Across active semesters",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
    {
      label: "Attendance Rate Avg",
      value: metrics.attendanceRate,
      subtext: "Current semester average",
      icon: CheckCircle,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    },
    {
      label: "Syllabus Completion",
      value: `${metrics.syllabusPercent}%`,
      subtext: "On schedule for exams",
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
  ];

  const defaultClasses = [
    {
      timeSlot: "09:00 AM - 10:30 AM",
      subjectName: "Data Structures & Algorithms",
      subjectCode: "CS301",
      room: "LHC-201",
      semester: "3rd Semester - CSE",
    },
    {
      timeSlot: "11:00 AM - 12:30 PM",
      subjectName: "Database Management Systems",
      subjectCode: "CS302",
      room: "LHC-202",
      semester: "3rd Semester - CSE",
    },
  ];

  const announcements = [
    {
      title: "Mid-Term Evaluation Submission",
      date: "Due by Friday, 5 PM",
      priority: "high",
    },
    {
      title: "Department Faculty Meeting",
      date: "Tomorrow at 4:00 PM",
      priority: "medium",
    },
  ];

  const pendingTasks = [
    { text: "Grade Advanced SE Assignments", due: "Due in 2 days" },
    { text: "Submit Syllabus Mid-Term Audit", due: "Due in 5 days" },
  ];

  const defaultAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left font-sans pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white shadow-lg select-none">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
            Academic Session 2026-27
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "Faculty Member"}!
          </h1>
          <p className="text-emerald-100/90 max-w-xl text-sm sm:text-base font-medium leading-relaxed">
            Check today's lecture schedule, update attendance files, or grade incoming student assessment logs.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          {/* Quick Metrics Dials */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 select-none">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{item.label}</p>
                    <p className="text-2xl font-extrabold text-foreground tracking-tight leading-none">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{item.subtext}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Request Approvals Status */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Request Approvals Status</h3>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Pending Approvals</p>
                  <p className="text-2xl font-extrabold text-foreground tracking-tight leading-none">{reqMetrics.pending}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Awaiting faculty review</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 bg-amber-500/10">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Approved Today</p>
                  <p className="text-2xl font-extrabold text-foreground tracking-tight leading-none">{reqMetrics.approvedToday}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Endorsed to admin</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Rejected Today</p>
                  <p className="text-2xl font-extrabold text-foreground tracking-tight leading-none">{reqMetrics.rejectedToday}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Declined requests</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 bg-rose-500/10">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content Grid */}
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
            {/* Left/Middle Column (Today's Classes & Timetable & Calendar) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Lectures */}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-5 border-b border-border bg-secondary/10 flex justify-between items-center select-none">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-emerald-600" />
                      <span>Today's Lecture Schedule</span>
                    </h3>
                    <Link to="/faculty/timetable" className="text-xs font-bold text-emerald-600 hover:underline">
                      View Full Timetable
                    </Link>
                  </div>

                  <div className="p-5 divide-y divide-border/60">
                    {todayLectures.length > 0 ? (
                      todayLectures.map((lec, idx) => (
                        <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-foreground">{lec.subjectName} ({lec.subjectCode})</p>
                            <p className="text-[11px] text-muted-foreground font-medium">{lec.semester} - {lec.department}</p>
                          </div>
                          <div className="text-right sm:self-center select-none font-semibold">
                            <p className="text-foreground">{lec.timeSlot}</p>
                            <p className="text-[10px] text-muted-foreground">Room: {lec.room}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      defaultClasses.map((lec, idx) => (
                        <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-foreground">{lec.subjectName} ({lec.subjectCode})</p>
                            <p className="text-[11px] text-muted-foreground font-medium">{lec.semester}</p>
                          </div>
                          <div className="text-right sm:self-center select-none font-semibold">
                            <p className="text-foreground">{lec.timeSlot}</p>
                            <p className="text-[10px] text-muted-foreground">Room: {lec.room}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-border/50 text-center select-none">
                  <Link
                    to="/faculty/attendance"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                  >
                    <span>Go record student attendance logs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Monthly Calendar Widget */}
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center select-none border-b border-border/60 pb-3">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <CalendarDays className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Academic Calendar - July 2026</span>
                  </h3>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Summer Cycle</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center select-none">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <span key={day} className="text-[10px] font-bold text-muted-foreground py-1">{day}</span>
                  ))}
                  {Array.from({ length: firstDayOffset }).map((_, idx) => (
                    <span key={`offset-${idx}`} className="py-2" />
                  ))}
                  {daysInMonth.map((day) => {
                    const isToday = day === 14; // Mock today
                    return (
                      <span
                        key={day}
                        className={`py-2 text-[11px] font-semibold rounded-lg flex items-center justify-center transition-colors ${
                          isToday
                            ? "bg-emerald-600 text-white font-extrabold"
                            : "hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-6">
              {/* Faculty Profile Card */}
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm text-center relative overflow-hidden select-none">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-600" />
                <img
                  src={facultyDetail?.avatar || defaultAvatar}
                  alt={facultyDetail?.name || user?.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-card mx-auto shadow-sm"
                />
                <div className="mt-3">
                  <h4 className="font-bold text-base text-foreground leading-snug">{facultyDetail?.name || user?.name}</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                    {facultyDetail?.designation || "Associate Professor"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase mt-1">
                    Employee ID: {facultyDetail?.employeeId || "EMP-CS-301"}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Office Room:</span>
                    <strong className="text-foreground">{facultyDetail?.designation ? "Room 201, LHC" : "Room 301, LHC"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Office Hours:</span>
                    <strong className="text-foreground">Mon-Fri 2-4 PM</strong>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
                <h3 className="font-bold text-sm select-none border-b border-border/60 pb-2.5">Quick Actions Shortcuts</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    to="/faculty/attendance"
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:bg-secondary/40 text-center space-y-1.5 transition-colors cursor-pointer"
                  >
                    <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-[10px]">Take Attendance</span>
                  </Link>

                  <Link
                    to="/faculty/marks"
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:bg-secondary/40 text-center space-y-1.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-[10px]">Enter Marks</span>
                  </Link>

                  <div
                    onClick={() => {
                      const chatBtn = document.getElementById("chatbot-toggle-button");
                      if (chatBtn) chatBtn.click();
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-border hover:bg-secondary/40 text-center space-y-1.5 transition-colors cursor-pointer col-span-2"
                  >
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-[10px]">AI Assistant Chatbot</span>
                  </div>
                </div>
              </div>

              {/* Action Reminders & Pending Tasks */}
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2 select-none border-b border-border/60 pb-3">
                  <Bell className="w-4.5 h-4.5 text-amber-500 animate-swing" />
                  <span>Pending Tasks &amp; Notices</span>
                </h3>

                {/* Internal Marks Status */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Internal Marks uploaded for CS-301</span>
                </div>

                <div className="space-y-3">
                  {pendingTasks.map((task, idx) => (
                    <div key={idx} className="p-3 bg-secondary/30 rounded-xl border border-border flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 text-xs text-left">
                        <p className="font-bold text-foreground leading-snug">{task.text}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{task.due}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-3 border-t border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Announcements</p>
                  {announcements.map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs text-left">
                      <p className="font-bold text-foreground hover:text-emerald-600 transition-colors cursor-pointer">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{item.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
