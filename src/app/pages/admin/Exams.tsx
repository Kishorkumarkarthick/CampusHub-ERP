import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Printer,
  ArrowRight,
  GraduationCap,
  Award,
  BookOpen,
  TrendingUp,
  X,
  Users,
  Loader2,
  Plus,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

type ExamTab = "schedule" | "marks" | "tickets";
type LetterGrade = "A+" | "A" | "B" | "C" | "D" | "F" | "—";

interface ExamScheduleItem {
  id?: number;
  code: string;
  name: string;
  date: string;
  time: string;
  room: string;
  maxMarks: number;
}

interface StudentMarksRecord {
  id?: number;
  studentName: string;
  rollNo: string;
  department: string;
  marks?: number;
  grade: LetterGrade;
  status: string;
  subjectCode: string;
}

export default function Exams() {
  const [activeTab, setActiveTab] = useState<ExamTab>("schedule");
  const [scheduleList, setScheduleList] = useState<ExamScheduleItem[]>([]);
  const [studentsList, setStudentsList] = useState<StudentMarksRecord[]>([]);
  const [studentsRoster, setStudentsRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter selection state for marks entry
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  // Filter selection state for hall ticket
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Add schedule form modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addCode, setAddCode] = useState("");
  const [addName, setAddName] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addTime, setAddTime] = useState("09:30 AM - 12:30 PM");
  const [addRoom, setAddRoom] = useState("LH-101");
  const [addMaxMarks, setAddMaxMarks] = useState(100);

  const [committing, setCommitting] = useState(false);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Fetch schedules
      const schedRes = await api.get("/api/exams/schedules");
      setScheduleList(schedRes.data);

      // Fetch subjects for select dropdowns
      const subRes = await api.get("/api/subjects");
      setSubjectsList(subRes.data);
      if (subRes.data.length > 0) {
        setSelectedSubject(subRes.data[0].code);
      }

      // Fetch students for hall tickets
      const studRes = await api.get("/api/students");
      setStudentsRoster(studRes.data);
      if (studRes.data.length > 0) {
        setSelectedStudentId(studRes.data[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to load exams configurations", err);
      toast.error("Failed to load initial configurations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMarksForSubject = async () => {
    if (!selectedSubject) return;
    try {
      const marksRes = await api.get(`/api/exams/marks?subjectCode=${selectedSubject}`);
      setStudentsList(marksRes.data);
    } catch (err) {
      console.error("Failed to load marks", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchMarksForSubject();
  }, [selectedSubject]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: ExamScheduleItem = {
        code: addCode.toUpperCase(),
        name: addName,
        date: addDate,
        time: addTime,
        room: addRoom,
        maxMarks: Number(addMaxMarks),
      };
      await api.post("/api/exams/schedules", payload);
      toast.success("Exam scheduled successfully!");
      setIsAddOpen(false);
      
      // Reload schedules
      const schedRes = await api.get("/api/exams/schedules");
      setScheduleList(schedRes.data);
    } catch (err) {
      console.error("Failed to schedule exam", err);
      toast.error("Failed to save exam schedule.");
    }
  };

  const handleMarksChange = (rollNo: string, value: string) => {
    const score = value === "" ? undefined : Math.min(100, Math.max(0, Number(value)));

    setStudentsList(
      studentsList.map((record) => {
        if (record.rollNo === rollNo) {
          if (score === undefined) {
            return { ...record, marks: undefined, grade: "—", status: "Pending" };
          }
          let grade: LetterGrade = "F";
          if (score >= 90) grade = "A+";
          else if (score >= 80) grade = "A";
          else if (score >= 70) grade = "B";
          else if (score >= 60) grade = "C";
          else if (score >= 50) grade = "D";

          return {
            ...record,
            marks: score,
            grade,
            status: score >= 50 ? "Pass" : "Fail",
          };
        }
        return record;
      })
    );
  };

  const handleCommitGrades = async () => {
    try {
      setCommitting(true);
      await api.post("/api/exams/marks", studentsList);
      toast.success(`Exam results for ${selectedSubject} updated in database.`);
      fetchMarksForSubject();
    } catch (err) {
      console.error("Failed to commit marks", err);
      toast.error("Failed to update grades.");
    } finally {
      setCommitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Metrics calculations
  const totalExams = scheduleList.length;
  const gradedStudentsCount = studentsList.filter((s) => s.status !== "Pending").length;
  const submissionRate = studentsList.length > 0 ? `${Math.round((gradedStudentsCount / studentsList.length) * 100)}%` : "0%";
  const activeMarks = studentsList.filter((s) => s.marks !== undefined);
  const classAvg = activeMarks.length > 0 ? (activeMarks.reduce((acc, curr) => acc + (curr.marks || 0), 0) / activeMarks.length).toFixed(1) : "0.0";

  const selectedStudent = studentsRoster.find((s) => s.id.toString() === selectedStudentId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Examination Module</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Manage mid-term & final semester examination schedules, grade sheets, and print hall tickets.
          </p>
        </div>

        {activeTab === "schedule" && (
          <button
            onClick={() => {
              setAddCode("");
              setAddName("");
              setAddDate("");
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer active:scale-95 transition-all select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Exam</span>
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border select-none">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-all ${
            activeTab === "schedule" ? "border-purple-600 text-purple-600" : "border-transparent text-muted-foreground"
          }`}
        >
          Exam Schedules
        </button>
        <button
          onClick={() => setActiveTab("marks")}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-all ${
            activeTab === "marks" ? "border-purple-600 text-purple-600" : "border-transparent text-muted-foreground"
          }`}
        >
          Marks ledger
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-all ${
            activeTab === "tickets" ? "border-purple-600 text-purple-600" : "border-transparent text-muted-foreground"
          }`}
        >
          Hall Ticket Generator
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <>
          {activeTab === "schedule" && (
            <div className="space-y-6">
              {/* Schedules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scheduleList.map((sched) => (
                  <div
                    key={sched.id}
                    className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-purple-600" />
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600/10 text-purple-600 uppercase">
                            {sched.code}
                          </span>
                          <h3 className="text-base font-bold mt-1.5 leading-tight">{sched.name}</h3>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs font-semibold text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
                          <span>Date:</span>
                          <span className="text-foreground">{sched.date}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                          <span>Time Slot:</span>
                          <span className="text-foreground">{sched.time}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
                          <span>Room Hall:</span>
                          <span className="text-foreground">{sched.room}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "marks" && (
            <div className="space-y-6">
              {/* Analytics Header bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 select-none text-left">
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Active Exams</span>
                  <span className="text-xl font-extrabold text-foreground">{totalExams} Schedules</span>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Grading Status</span>
                  <span className="text-xl font-extrabold text-foreground">{submissionRate} Complete</span>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Class Average</span>
                  <span className="text-xl font-extrabold text-indigo-600">{classAvg} / 100</span>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">Commits Queue</span>
                  <span className="text-xl font-extrabold text-emerald-600">{gradedStudentsCount} Records</span>
                </div>
              </div>

              {/* Selector */}
              <div className="flex gap-4 items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground font-semibold w-80"
                >
                  {subjectsList.map((sub) => (
                    <option key={sub.code} value={sub.code}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleCommitGrades}
                  disabled={committing || studentsList.length === 0}
                  className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer select-none active:scale-95 disabled:opacity-50"
                >
                  {committing ? "Saving ledger..." : "Commit Grades"}
                </button>
              </div>

              {/* Table Ledger */}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                        <th className="py-3 px-6">Student Name</th>
                        <th className="py-3 px-6 text-center">Roll No</th>
                        <th className="py-3 px-6 text-center">Subject Code</th>
                        <th className="py-3 px-6 text-center">Score (Max 100)</th>
                        <th className="py-3 px-6 text-center">Grade</th>
                        <th className="py-3 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {studentsList.length > 0 ? (
                        studentsList.map((record) => (
                          <tr key={record.rollNo} className="hover:bg-secondary/15 transition-colors text-xs">
                            <td className="py-4 px-6 text-left font-bold text-foreground">{record.studentName}</td>
                            <td className="py-4 px-6 text-center font-semibold text-muted-foreground">{record.rollNo}</td>
                            <td className="py-4 px-6 text-center font-bold text-purple-600">{record.subjectCode}</td>
                            <td className="py-4 px-6 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={record.marks ?? ""}
                                onChange={(e) => handleMarksChange(record.rollNo, e.target.value)}
                                className="w-16 px-2.5 py-1 rounded-lg border border-border text-center font-bold text-xs bg-input-background"
                              />
                            </td>
                            <td className="py-4 px-6 text-center font-extrabold text-foreground">{record.grade}</td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                                record.status === "Pass"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-red-500/10 text-red-500"
                              } select-none`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 px-6 text-center text-sm text-muted-foreground font-semibold">
                            No student marks published for this subject code yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="space-y-6">
              {/* Dropdown Selector */}
              <div className="flex gap-4 items-center bg-card border border-border p-4 rounded-2xl shadow-sm select-none">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground font-semibold w-85"
                >
                  {studentsRoster.map((s) => (
                    <option key={s.id} value={s.id.toString()}>
                      {s.rollNo} - {s.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket</span>
                </button>
              </div>

              {/* Hall Ticket Layout Card */}
              {selectedStudent && (
                <div id="print-area" className="bg-card border border-border p-8 rounded-3xl max-w-2xl mx-auto shadow-sm space-y-6 relative overflow-hidden text-left border-l-4 border-l-purple-600">
                  <div className="flex justify-between items-start border-b border-border/80 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-foreground uppercase tracking-wide">University Admit Card</h2>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">End Semester Theory Examinations 2026</p>
                    </div>
                    <GraduationCap className="w-10 h-10 text-purple-600" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <span className="block text-[10px] text-muted-foreground uppercase">Candidate Name</span>
                      <span className="text-foreground font-bold">{selectedStudent.name}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-muted-foreground uppercase">Roll Identification</span>
                      <span className="text-foreground font-bold">{selectedStudent.rollNo}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-muted-foreground uppercase">Department Stream</span>
                      <span className="text-foreground font-bold leading-normal">{selectedStudent.department}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-muted-foreground uppercase">Current Sem Cycle</span>
                      <span className="text-foreground font-bold">{selectedStudent.semester}</span>
                    </div>
                  </div>

                  {/* Registered Exam Schedules List */}
                  <div className="space-y-3 pt-4 border-t border-border/60">
                    <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider select-none">Exam Schedule Cycles</h4>
                    <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden">
                      {scheduleList.length > 0 ? (
                        scheduleList.map((sched) => (
                          <div key={sched.id} className="p-3 bg-secondary/10 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-foreground">{sched.name}</p>
                              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{sched.code}</p>
                            </div>
                            <div className="text-right font-semibold text-muted-foreground">
                              <p>{sched.date}</p>
                              <p className="text-[10px] text-purple-600">{sched.time}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-center text-xs text-muted-foreground select-none">No active exam schedules published.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Exam Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6 relative overflow-hidden text-left animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b border-border/60 pb-3 mb-4 flex items-center gap-2 select-none">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>Schedule New Exam</span>
            </h3>

            <form onSubmit={handleAddSchedule} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Subject Code</label>
                <input
                  type="text"
                  value={addCode}
                  onChange={(e) => setAddCode(e.target.value)}
                  placeholder="e.g. CS-302"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Subject Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Advanced Database Systems"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={addDate}
                    onChange={(e) => setAddDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Room Hall</label>
                  <input
                    type="text"
                    value={addRoom}
                    onChange={(e) => setAddRoom(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Time Slot</label>
                  <select
                    value={addTime}
                    onChange={(e) => setAddTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground font-semibold"
                  >
                    <option value="09:30 AM - 12:30 PM">09:30 AM - 12:30 PM</option>
                    <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Max Marks</label>
                  <input
                    type="number"
                    min={30}
                    max={100}
                    value={addMaxMarks}
                    onChange={(e) => setAddMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans font-bold text-center"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/50 select-none">
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="py-2 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
