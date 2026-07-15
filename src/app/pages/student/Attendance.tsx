import React, { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Users, BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface SubjectAttendance {
  code: string;
  name: string;
  attended: number;
  total: number;
  instructor: string;
}

interface AttendanceLog {
  id: number;
  entityId: string;
  entityType: string;
  date: string;
  status: string;
}

export default function StudentAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dbLogs, setDbLogs] = useState<AttendanceLog[]>([]);
  const [rollNo, setRollNo] = useState("");

  const loadAttendance = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      // 1. Fetch Student profile to get rollNo
      const studentRes = await api.get("/api/students");
      const currentStudent = studentRes.data.find((s: any) => s.email === user.email);
      if (currentStudent) {
        const rNo = currentStudent.rollNo;
        setRollNo(rNo);

        // 2. Fetch Attendance logs by Roll Number
        const attendanceRes = await api.get(`/api/attendance/entity/${rNo}?type=STUDENT`);
        setDbLogs(attendanceRes.data);
      }
    } catch (err) {
      console.error("Failed to load attendance logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [user?.email]);

  const defaultRecords: SubjectAttendance[] = [
    { code: "CS301", name: "Data Structures & Algorithms", attended: 26, total: 28, instructor: "Prof. Saradha Krishnan" },
    { code: "CS302", name: "Database Management Systems", attended: 22, total: 28, instructor: "Dr. Ramachandran Pillai" },
    { code: "CS303", name: "Computer Organization & Architecture", attended: 18, total: 28, instructor: "Prof. Alagappan Sundaram" },
    { code: "CS304", name: "Discrete Mathematics", attended: 25, total: 28, instructor: "Dr. Gayatri Venkataraman" },
    { code: "CS305", name: "Software Engineering", attended: 19, total: 28, instructor: "Dr. Anjali Menon" },
    { code: "CS306P", name: "Data Structures Lab", attended: 9, total: 14, instructor: "Prof. Saradha Krishnan" },
  ];

  // If we have database logs, calculate dynamic statistics
  const dbPresentCount = dbLogs.filter((log) => log.status === "Present").length;
  const dbTotalCount = dbLogs.length;

  const overallPercentage =
    dbTotalCount > 0
      ? Math.round((dbPresentCount / dbTotalCount) * 100)
      : Math.round(
          (defaultRecords.reduce((sum, r) => sum + r.attended, 0) /
            defaultRecords.reduce((sum, r) => sum + r.total, 0)) *
            100
        );

  const totalAttended = dbTotalCount > 0 ? dbPresentCount : defaultRecords.reduce((sum, r) => sum + r.attended, 0);
  const totalClasses = dbTotalCount > 0 ? dbTotalCount : defaultRecords.reduce((sum, r) => sum + r.total, 0);

  const lowAttendanceRecords = defaultRecords.filter(
    (r) => Math.round((r.attended / r.total) * 100) < 75
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Attendance Ledger</h1>
        <p className="text-sm text-muted-foreground">
          Track class participation percentages and verify semester attendance compliance limits.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
            {/* Overall Percentage Card */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Overall Attendance
                </p>
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {overallPercentage}%
                </p>
                <p className="text-[11px] text-muted-foreground">Semester cumulative rate</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            {/* Classes Attended Card */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Total Lectures
                </p>
                <p className="text-3xl font-extrabold text-foreground">
                  {totalAttended} <span className="text-base text-muted-foreground font-medium">/ {totalClasses}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">Attended vs Scheduled</p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Alert Card */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Action Required
                </p>
                <p className="text-3xl font-extrabold text-foreground">
                  {overallPercentage < 75 ? 1 : 0}{" "}
                  <span className="text-base text-muted-foreground font-medium">Alerts</span>
                </p>
                <p className="text-[11px] text-muted-foreground">Classes below 75% threshold</p>
              </div>
              <div
                className={`p-4 rounded-2xl ${
                  overallPercentage < 75
                    ? "bg-red-500/10 text-red-500 animate-pulse"
                    : "bg-emerald-500/10 text-emerald-600"
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Critical Warnings */}
          {overallPercentage < 75 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold space-y-1.5 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-bold">Attendance Deficit Warning</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed font-medium">
                Your cumulative semester attendance rate is currently at {overallPercentage}%, which is below the university regulations minimum requirement of 75% to sit for examinations.
              </p>
            </div>
          )}

          {/* Real-time DB Logs (if present) */}
          {dbLogs.length > 0 && (
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/20 font-bold text-sm text-foreground flex items-center gap-1.5 select-none">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Attendance Logs Register</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                      <th className="py-3 px-6">Record ID</th>
                      <th className="py-3 px-6">Roll Number</th>
                      <th className="py-3 px-6">Evaluation Date</th>
                      <th className="py-3 px-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {dbLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-secondary/15 transition-colors text-xs">
                        <td className="py-4 px-6 font-semibold text-foreground">ATT-{log.id}</td>
                        <td className="py-4 px-6 font-bold">{log.entityId}</td>
                        <td className="py-4 px-6 text-muted-foreground font-semibold">{log.date}</td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                              log.status === "Present"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-red-500/10 text-red-600"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subject-wise Participation Register (Fallback / Default view) */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/20 font-bold text-sm text-foreground flex items-center gap-1.5 select-none">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Subject-wise Participation Register</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                    <th className="py-3 px-6">Subject Code</th>
                    <th className="py-3 px-6">Course Name</th>
                    <th className="py-3 px-6">Instructor</th>
                    <th className="py-3 px-6 text-center">Lectures Attended</th>
                    <th className="py-3 px-6 text-center">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {defaultRecords.map((record) => {
                    const percent = Math.round((record.attended / record.total) * 100);
                    const isCritical = percent < 75;
                    return (
                      <tr key={record.code} className="hover:bg-secondary/15 transition-colors text-xs">
                        <td className="py-4 px-6 font-semibold text-foreground">{record.code}</td>
                        <td className="py-4 px-6 font-bold">{record.name}</td>
                        <td className="py-4 px-6 text-muted-foreground font-medium">{record.instructor}</td>
                        <td className="py-4 px-6 text-center text-muted-foreground">
                          <span className="font-semibold text-foreground">{record.attended}</span> / {record.total}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                              isCritical
                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                : percent >= 85
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            }`}
                          >
                            {percent}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
