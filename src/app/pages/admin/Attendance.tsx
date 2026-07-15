import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  GraduationCap,
  Sparkles,
  FileText,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { cn } from "../../components/ui/utils";
import api from "../../services/api";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Tab = "student" | "faculty" | "analytics";
type AttendanceStatus = "Present" | "Absent" | "Late" | "On Leave";

interface StudentRecord {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  semester: string;
  status: AttendanceStatus;
  avatar: string;
}

interface FacultyRecord {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  status: AttendanceStatus;
  avatar: string;
}

export default function AdminAttendance() {
  const [activeTab, setActiveTab] = useState<Tab>("student");
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core records lists
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [faculty, setFaculty] = useState<FacultyRecord[]>([]);

  // Filter States
  const [filterDept, setFilterDept] = useState("All Departments");
  const [filterSemester, setFilterSemester] = useState("All Semesters");

  const departmentsList = [
    "Computer Science & Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Business Administration",
    "Civil Engineering",
    "Electronics & Communication",
    "Information Technology",
    "Chemical Engineering",
    "Aerospace Engineering",
    "Physics & Materials Science",
  ];

  const fetchAttendanceLogs = async (targetDate: string) => {
    try {
      setLoading(true);
      const [studentsRes, facultyRes, logsRes] = await Promise.all([
        api.get("/api/students"),
        api.get("/api/faculty"),
        api.get(`/api/attendance?date=${targetDate}`),
      ]);

      const activeLogs = logsRes.data;

      // 1. Populate students
      const mappedStudents = studentsRes.data.map((s: any) => {
        const log = activeLogs.find((l: any) => l.entityId === s.rollNo && l.entityType === "STUDENT");
        return {
          id: String(s.id),
          name: s.name,
          rollNo: s.rollNo,
          department: s.department,
          semester: s.semester,
          avatar: s.avatar || `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150`,
          status: (log ? log.status : "Present") as AttendanceStatus,
        };
      });
      setStudents(mappedStudents);

      // 2. Populate faculty
      const mappedFaculty = facultyRes.data.map((f: any) => {
        const log = activeLogs.find((l: any) => l.entityId === f.employeeId && l.entityType === "FACULTY");
        return {
          id: String(f.id),
          name: f.name,
          employeeId: f.employeeId,
          department: f.department,
          designation: f.designation,
          avatar: f.avatar || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150`,
          status: (log ? log.status : "Present") as AttendanceStatus,
        };
      });
      setFaculty(mappedFaculty);

    } catch (err) {
      console.error("Failed to load attendance logs", err);
      toast.error("Failed to fetch database attendance registers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceLogs(selectedDate);
  }, [selectedDate]);

  const cycleStudentStatus = (id: string) => {
    setStudents(
      students.map((s) => {
        if (s.id === id) {
          let next: AttendanceStatus = "Present";
          if (s.status === "Present") next = "Absent";
          else if (s.status === "Absent") next = "Late";
          return { ...s, status: next };
        }
        return s;
      })
    );
  };

  const cycleFacultyStatus = (id: string) => {
    setFaculty(
      faculty.map((f) => {
        if (f.id === id) {
          let next: AttendanceStatus = "Present";
          if (f.status === "Present") next = "Absent";
          else if (f.status === "Absent") next = "On Leave";
          return { ...f, status: next };
        }
        return f;
      })
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any[] = [];

      // Add student logs
      students.forEach((s) => {
        payload.push({
          entityId: s.rollNo,
          entityType: "STUDENT",
          date: selectedDate,
          status: s.status,
        });
      });

      // Add faculty logs
      faculty.forEach((f) => {
        payload.push({
          entityId: f.employeeId,
          entityType: "FACULTY",
          date: selectedDate,
          status: f.status,
        });
      });

      await api.post("/api/attendance", payload);
      toast.success(`Attendance logs for ${selectedDate} committed successfully!`);
    } catch (err) {
      console.error("Failed to save attendance logs", err);
      toast.error("Failed to save attendance records.");
    } finally {
      setSaving(false);
    }
  };

  // Filter lists
  const filteredStudents = students.filter((record) => {
    const matchDept = filterDept === "All Departments" || record.department === filterDept;
    const matchSem = filterSemester === "All Semesters" || record.semester === filterSemester;
    return matchDept && matchSem;
  });

  const filteredFaculty = faculty.filter((record) => {
    const matchDept = filterDept === "All Departments" || record.department === filterDept;
    return matchDept;
  });

  // Calculate Metrics
  const getMetrics = () => {
    if (activeTab === "student") {
      const total = filteredStudents.length;
      if (total === 0) return { rate: "0%", p: 0, a: 0, l: 0 };
      const p = filteredStudents.filter((s) => s.status === "Present").length;
      const a = filteredStudents.filter((s) => s.status === "Absent").length;
      const l = filteredStudents.filter((s) => s.status === "Late").length;
      return {
        rate: `${Math.round((p / total) * 100)}%`,
        p,
        a,
        l,
      };
    } else {
      const total = filteredFaculty.length;
      if (total === 0) return { rate: "0%", p: 0, a: 0, l: 0 };
      const p = filteredFaculty.filter((f) => f.status === "Present").length;
      const a = filteredFaculty.filter((f) => f.status === "Absent").length;
      const l = filteredFaculty.filter((f) => f.status === "On Leave").length;
      return {
        rate: `${Math.round((p / total) * 100)}%`,
        p,
        a,
        l,
      };
    }
  };

  const metrics = getMetrics();

  // Calendar Trend Data for last 7 days
  const calendarTrends = [
    { date: "2026-07-14", rate: 94, status: "Excellent" },
    { date: "2026-07-13", rate: 91, status: "Excellent" },
    { date: "2026-07-12", rate: 88, status: "Good" },
    { date: "2026-07-11", rate: 82, status: "Good" },
    { date: "2026-07-10", rate: 71, status: "Deficit" },
    { date: "2026-07-09", rate: 89, status: "Good" },
    { date: "2026-07-08", rate: 92, status: "Excellent" },
  ];

  // Recharts Chart Data
  const chartsData = [
    { name: "CSE", Present: 92, Absent: 8 },
    { name: "EE", Present: 85, Absent: 15 },
    { name: "ME", Present: 80, Absent: 20 },
    { name: "BA", Present: 90, Absent: 10 },
  ];

  return (
    <div className="space-y-6 font-sans pb-12 transition-colors duration-300 text-left max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Audit Attendance</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Monitor daily attendance registers, review Recharts analytics, and generate absentees audit lists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans font-semibold text-foreground shadow-sm"
          />

          {activeTab !== "analytics" && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer active:scale-95 transition-all select-none disabled:opacity-5"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Commit Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="grid grid-cols-3 gap-3 bg-secondary/20 p-1.5 rounded-2xl select-none">
        <button
          type="button"
          onClick={() => setActiveTab("student")}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "student"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GraduationCap className="w-4.5 h-4.5" />
          <span>Student Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("faculty")}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "faculty"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4.5 h-4.5" />
          <span>Faculty Attendance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "analytics"
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="w-4.5 h-4.5" />
          <span>Charts & Trends</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : activeTab === "analytics" ? (
        /* Analytics View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Card */}
          <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 select-none">
              <TrendingUp className="w-4.5 h-4.5 text-purple-500" />
              <span>Attendance rate by stream department</span>
            </h3>

            <div className="w-full h-80 pt-2 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Present" fill="#8884d8" />
                  <Bar dataKey="Absent" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar Trend */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 select-none">
              <CalendarIcon className="w-4.5 h-4.5 text-purple-500" />
              <span>Historical Daily Calendars</span>
            </h3>

            <div className="space-y-3 pt-1 select-none text-xs">
              {calendarTrends.map((c) => (
                <div
                  key={c.date}
                  className="flex justify-between items-center p-3 border border-border/60 bg-secondary/10 rounded-xl"
                >
                  <span className="font-semibold text-muted-foreground">{c.date}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-foreground">{c.rate}%</span>
                    <span
                      className={cn(
                        "inline-block w-2.5 h-2.5 rounded-full",
                        c.status === "Excellent"
                          ? "bg-emerald-500"
                          : c.status === "Good"
                          ? "bg-indigo-500"
                          : "bg-red-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Student or Faculty List View */
        <>
          {/* Metrics Banner */}
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 select-none">
            <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Present Rate</span>
                <span className="text-2xl font-extrabold">{metrics.rate}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Present</span>
                <span className="text-2xl font-extrabold">{metrics.p}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Absent</span>
                <span className="text-2xl font-extrabold">{metrics.a}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                  {activeTab === "student" ? "Total Late" : "On Leave"}
                </span>
                <span className="text-2xl font-extrabold">{metrics.l}</span>
              </div>
            </div>
          </div>

          {/* Filtering actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 w-full select-none">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans w-full sm:w-64"
              >
                <option value="All Departments">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {activeTab === "student" && (
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans w-full sm:w-48"
                >
                  <option value="All Semesters">All Semesters</option>
                  {["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester"].map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* List display */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                    <th className="py-3 px-6">Profile Roster</th>
                    <th className="py-3 px-6">ID Reference</th>
                    <th className="py-3 px-6">Stream / Program details</th>
                    <th className="py-3 px-6">Status Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activeTab === "student" ? (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-secondary/15 transition-colors text-xs">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <img
                            src={s.avatar}
                            alt={s.name}
                            className="w-8 h-8 rounded-full border border-border object-cover shrink-0"
                          />
                          <span className="font-bold text-foreground">{s.name}</span>
                        </td>
                        <td className="py-4 px-6 font-mono font-semibold text-muted-foreground">
                          {s.rollNo}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold">{s.department}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{s.semester}</p>
                        </td>
                        <td className="py-4 px-6 select-none">
                          <button
                            onClick={() => cycleStudentStatus(s.id)}
                            className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-sm border border-transparent",
                              s.status === "Present" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                              s.status === "Absent" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                              s.status === "Late" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {s.status}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredFaculty.map((f) => (
                      <tr key={f.id} className="hover:bg-secondary/15 transition-colors text-xs">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <img
                            src={f.avatar}
                            alt={f.name}
                            className="w-8 h-8 rounded-full border border-border object-cover shrink-0"
                          />
                          <span className="font-bold text-foreground">{f.name}</span>
                        </td>
                        <td className="py-4 px-6 font-mono font-semibold text-muted-foreground">
                          {f.employeeId}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold">{f.department}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{f.designation}</p>
                        </td>
                        <td className="py-4 px-6 select-none">
                          <button
                            onClick={() => cycleFacultyStatus(f.id)}
                            className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-sm border border-transparent",
                              f.status === "Present" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                              f.status === "Absent" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                              f.status === "On Leave" && "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            )}
                          >
                            {f.status}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
