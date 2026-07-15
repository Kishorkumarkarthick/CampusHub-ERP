import React, { useState, useEffect } from "react";
import { BookOpen, Award, Users, Save, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface StudentMarks {
  rollNo: string;
  name: string;
  department: string;
  marks: string;
}

interface Subject {
  code: string;
  name: string;
  department: string;
}

export default function FacultyMarks() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentMarks[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("FINAL");

  const exams = [
    { id: "FINAL", name: "Final Semester Examination", maxMarks: 100 },
  ];

  const activeExam = exams.find((e) => e.id === selectedExam) || exams[0];

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch subjects
      const subRes = await api.get("/api/subjects");
      setSubjects(subRes.data);
      if (subRes.data.length > 0) {
        setSelectedSubject(subRes.data[0].code);
      }

      // Fetch students
      const studRes = await api.get("/api/students");
      setAllStudents(studRes.data);
    } catch (err) {
      console.error("Failed to load marks configuration", err);
      toast.error("Failed to load course subjects or rosters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update students roster when selected subject changes
  useEffect(() => {
    if (!selectedSubject || allStudents.length === 0) return;
    
    // Find selected subject's department stream
    const activeSub = subjects.find((s) => s.code === selectedSubject);
    if (!activeSub) return;

    // Filter students by that department
    const roster = allStudents
      .filter((s) => s.department === activeSub.department)
      .map((s) => ({
        rollNo: s.rollNo,
        name: s.name,
        department: s.department,
        marks: "",
      }));

    setStudents(roster);
  }, [selectedSubject, allStudents, subjects]);

  const handleMarksChange = (index: number, val: string) => {
    if (val !== "" && isNaN(Number(val))) return;

    const updated = [...students];
    updated[index].marks = val;
    setStudents(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalidStudent = students.find((s) => {
      const score = Number(s.marks);
      return score < 0 || score > activeExam.maxMarks || s.marks === "";
    });

    if (invalidStudent) {
      toast.error(`Please fill valid marks (0-${activeExam.maxMarks}) for all students.`);
      return;
    }

    try {
      setSaving(true);

      const payload = students.map((s) => {
        const score = Number(s.marks);
        let grade = "F";
        if (score >= 90) grade = "A+";
        else if (score >= 80) grade = "A";
        else if (score >= 70) grade = "B";
        else if (score >= 60) grade = "C";
        else if (score >= 50) grade = "D";

        return {
          studentName: s.name,
          rollNo: s.rollNo,
          department: s.department,
          marks: score,
          grade: grade,
          status: score >= 50 ? "Pass" : "Fail",
          subjectCode: selectedSubject,
        };
      });

      await api.post("/api/exams/marks", payload);
      toast.success(`Exam marks successfully published for ${selectedSubject}!`);
    } catch (err) {
      console.error("Failed to commit exam grades", err);
      toast.error("Failed to post marks to server database.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left font-sans pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Examination Marks Entry</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Record student final evaluation marks and publish grades online.
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
              <span>Class & Exam</span>
            </h3>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label htmlFor="subject-select" className="text-xs font-bold text-muted-foreground uppercase select-none">
                Select Subject
              </label>
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs font-sans text-foreground"
              >
                {subjects.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Selector */}
            <div className="space-y-1.5">
              <label htmlFor="exam-select" className="text-xs font-bold text-muted-foreground uppercase select-none">
                Evaluation Component
              </label>
              <select
                id="exam-select"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs font-sans text-foreground font-semibold"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} (Max {ex.maxMarks})
                  </option>
                ))}
              </select>
            </div>

            {/* Summary Box */}
            <div className="pt-4 border-t border-border/50 select-none">
              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-center space-y-1">
                <Award className="w-6 h-6 mx-auto" />
                <p className="text-[10px] font-bold uppercase">Max Obtainable Marks</p>
                <p className="text-2xl font-extrabold">{activeExam.maxMarks} Points</p>
              </div>
            </div>
          </div>

          {/* Right Side: Student Marks Grid */}
          <div className="bg-card border border-border rounded-2xl shadow-sm md:col-span-2 overflow-hidden flex flex-col">
            {/* Table Header */}
            <div className="p-4 border-b border-border bg-secondary/20 flex justify-between items-center select-none">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Marks Ledger - {activeExam.name}</span>
              </h3>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase select-none">
                Editing mode
              </span>
            </div>

            {/* Grid list of students */}
            <div className="divide-y divide-border/60 flex-grow max-h-[400px] overflow-y-auto">
              {students.length > 0 ? (
                students.map((student, idx) => (
                  <div
                    key={student.rollNo}
                    className="flex items-center justify-between p-4 hover:bg-secondary/15 transition-colors"
                  >
                    <div className="space-y-0.5 text-left">
                      <p className="text-xs font-bold text-foreground">{student.name}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">{student.rollNo}</p>
                    </div>

                    <div className="flex items-center gap-2 select-none">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={student.marks}
                          onChange={(e) => handleMarksChange(idx, e.target.value)}
                          className="w-16 px-3 py-1.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-center font-bold text-xs"
                          placeholder="0"
                          required
                        />
                        <span className="text-xs font-bold text-muted-foreground">/ {activeExam.maxMarks}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground font-semibold">
                  No students enrolled under this department stream.
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="p-4 border-t border-border/50 bg-secondary/10 flex justify-end">
              <button
                type="submit"
                disabled={saving || students.length === 0}
                className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer disabled:opacity-75 disabled:pointer-events-none active:scale-[0.98] transition-all select-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing marks...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Publish Marks</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
