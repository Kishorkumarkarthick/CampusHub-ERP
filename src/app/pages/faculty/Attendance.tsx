import React, { useState, useEffect } from "react";
import { BookOpen, Calendar, CheckSquare, Users, Save, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface StudentAttendance {
  rollNo: string;
  name: string;
  isPresent: boolean;
}

export default function FacultyAttendance() {
  const subjects = [
    { code: "CS301", name: "Data Structures & Algorithms" },
    { code: "CS503P", name: "Operating Systems Lab" },
    { code: "CS702", name: "Introduction to Cloud Computing" },
    { code: "EE101", name: "Basic Electrical Engineering" },
  ];

  const [selectedSubject, setSelectedSubject] = useState(subjects[0].code);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/students");
      setDbStudents(res.data);
      applyFilter(selectedSubject, res.data);
    } catch (err) {
      console.error("Failed to fetch student roster", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (subjectCode: string, studentList: any[]) => {
    const targetDept = subjectCode.startsWith("EE")
      ? "Electrical Engineering"
      : "Computer Science & Engineering";
    
    const filtered = studentList
      .filter((s: any) => s.department === targetDept)
      .map((s: any) => ({
        rollNo: s.rollNo,
        name: s.name,
        isPresent: true,
      }));

    setStudents(filtered);
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const handleSubjectChange = (code: string) => {
    setSelectedSubject(code);
    applyFilter(code, dbStudents);
  };

  const toggleAttendance = (index: number) => {
    const updated = [...students];
    updated[index].isPresent = !updated[index].isPresent;
    setStudents(updated);
  };

  const handleSelectAll = (present: boolean) => {
    const updated = students.map((s) => ({ ...s, isPresent: present }));
    setStudents(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) {
      toast.warning("No students in the active class roster to register.");
      return;
    }

    try {
      setSaving(true);
      const payload = students.map((s) => ({
        entityId: s.rollNo,
        entityType: "STUDENT",
        date: selectedDate,
        status: s.isPresent ? "Present" : "Absent",
      }));

      await api.post("/api/attendance", payload);
      toast.success(`Attendance submitted successfully for ${selectedSubject}!`);
    } catch (err) {
      console.error("Failed to commit attendance", err);
      toast.error("Failed to save attendance logs.");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.isPresent).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Attendance Registry</h1>
        <p className="text-sm text-muted-foreground">
          Record daily class attendance and push log registers to student records.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Side: Filter Form */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6 self-start">
            <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/60 flex items-center gap-2 select-none">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>Class Selection</span>
            </h3>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label htmlFor="subject-select" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Select Subject
              </label>
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs font-sans"
              >
                {subjects.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="space-y-1.5">
              <label htmlFor="date-select" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Attendance Date
              </label>
              <div className="relative">
                <input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs font-sans font-semibold"
                  required
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-col gap-2 select-none">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="w-full py-2 px-4 rounded-xl border border-border hover:bg-secondary/40 text-foreground font-bold text-xs cursor-pointer text-center"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="w-full py-2 px-4 rounded-xl border border-border hover:bg-secondary/40 text-foreground font-bold text-xs cursor-pointer text-center"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Right Side: Roster Listing */}
          <div className="md:col-span-2 space-y-6">
            {/* Summary metrics header */}
            <div className="grid grid-cols-2 gap-4 select-none">
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider block">Present</span>
                <span className="text-2xl font-extrabold">{presentCount}</span>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider block">Absent</span>
                <span className="text-2xl font-extrabold">{absentCount}</span>
              </div>
            </div>

            {/* Student Roster Table card */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/20 font-bold text-sm text-foreground flex justify-between items-center select-none">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Student Roster ({students.length})</span>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Commit Attendance</span>
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                      <th className="py-3 px-6">Roll Number</th>
                      <th className="py-3 px-6">Student Name</th>
                      <th className="py-3 px-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {students.length > 0 ? (
                      students.map((student, idx) => (
                        <tr key={student.rollNo} className="hover:bg-secondary/15 transition-colors text-xs">
                          <td className="py-3 px-6 font-mono font-semibold text-muted-foreground">
                            {student.rollNo}
                          </td>
                          <td className="py-3 px-6 font-bold text-foreground">{student.name}</td>
                          <td className="py-3 px-6 text-center select-none">
                            <button
                              type="button"
                              onClick={() => toggleAttendance(idx)}
                              className={`inline-flex items-center gap-1 py-1 px-3.5 rounded-full font-bold text-[9px] uppercase tracking-wider cursor-pointer active:scale-95 transition-all border ${
                                student.isPresent
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-red-500/10 text-red-600 border-red-500/20"
                              }`}
                            >
                              {student.isPresent ? (
                                <>
                                  <Check className="w-3 h-3" /> Present
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3" /> Absent
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-8 px-6 text-center text-sm text-muted-foreground">
                          No student records associated with this subject block.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
