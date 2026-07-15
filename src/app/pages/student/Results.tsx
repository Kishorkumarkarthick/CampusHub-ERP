import React, { useState, useEffect } from "react";
import { Award, FileText, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface SemGrade {
  code: string;
  name: string;
  internals: string;
  grade: string;
  points: number;
  status: "Pass" | "Fail";
}

export default function StudentResults() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [semGrades, setSemGrades] = useState<SemGrade[]>([]);
  const [cgpa, setCgpa] = useState("0.00");
  const [studentRollNo, setStudentRollNo] = useState("");
  const [studentSem, setStudentSem] = useState("5th Semester");

  const gradeToPoints = (g: string): number => {
    switch (g.toUpperCase()) {
      case "A+": return 10;
      case "A": return 9;
      case "B": return 8;
      case "C": return 7;
      case "D": return 6;
      default: return 0;
    }
  };

  const fetchResults = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      // 1. Fetch Student profile to get roll number
      const studentRes = await api.get("/api/students");
      const currentStudent = studentRes.data.find((s: any) => s.email === user.email);

      if (currentStudent) {
        setStudentRollNo(currentStudent.rollNo);
        setStudentSem(currentStudent.semester);

        // 2. Fetch subject names registry to map subject codes to names
        const subjectsRes = await api.get("/api/subjects");
        const subjectsMap: Record<string, string> = {};
        subjectsRes.data.forEach((sub: any) => {
          subjectsMap[sub.code] = sub.name;
        });

        // 3. Fetch exam marks from backend
        const marksRes = await api.get("/api/exams/marks");
        
        // Filter marks of current student
        const studentMarks = marksRes.data.filter(
          (m: any) => m.rollNo === currentStudent.rollNo
        );

        const mappedGrades: SemGrade[] = studentMarks.map((m: any) => {
          const letter = m.grade || "—";
          const points = gradeToPoints(letter);
          return {
            code: m.subjectCode,
            name: subjectsMap[m.subjectCode] || m.subjectCode || "Course Subject",
            internals: m.marks !== null && m.marks !== undefined ? `${m.marks}/100` : "Pending",
            grade: letter,
            points: points,
            status: m.status === "Pass" ? "Pass" : "Fail",
          };
        });

        setSemGrades(mappedGrades);

        // Calculate dynamic CGPA
        if (mappedGrades.length > 0) {
          const totalPoints = mappedGrades.reduce((acc, curr) => acc + curr.points, 0);
          const avg = (totalPoints / mappedGrades.length).toFixed(2);
          setCgpa(avg);
        } else {
          // Fallback to student's profile CGPA
          setCgpa((currentStudent.cgpa || 9.20).toFixed(2));
        }
      }
    } catch (err) {
      console.error("Failed to load student exam results", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [user?.email]);

  const hasBacklogs = semGrades.some((g) => g.status === "Fail");

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Results</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Review your cumulative CGPA status, internal evaluation marks, and semester transcripts.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Dials / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
            {/* Cumulative CGPA Card */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Cumulative CGPA
                </p>
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {cgpa}
                </p>
                <p className="text-[11px] text-muted-foreground">On a 10.0 scale index</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
            </div>

            {/* Current SGPA Card */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Current SGPA
                </p>
                <p className="text-3xl font-extrabold text-foreground">
                  {cgpa}
                </p>
                <p className="text-[11px] text-muted-foreground">{studentSem} GPA results</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Passing Status Card */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Academic Status
                </p>
                <p className="text-3xl font-extrabold text-foreground">
                  {hasBacklogs ? "Backlog" : "Passed"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {hasBacklogs ? "Requires improvement" : "No active backlogs"}
                </p>
              </div>
              <div className={`p-4 rounded-2xl ${hasBacklogs ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: GPA History Progression (Static reference) */}
            <div className="space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2 border-b border-border/40 pb-2 select-none">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <span>GPA Progression</span>
              </h3>

              <div className="space-y-3 pt-1 select-none">
                {[
                  { sem: "1st Semester", sgpa: "9.05" },
                  { sem: "2nd Semester", sgpa: "9.18" },
                  { sem: "3rd Semester", sgpa: "9.24" },
                  { sem: "4th Semester", sgpa: (Number(cgpa) > 0 ? cgpa : "9.32") },
                ].map((h) => (
                  <div
                    key={h.sem}
                    className="p-4 rounded-xl border border-border/80 bg-card shadow-sm flex justify-between items-center"
                  >
                    <span className="text-xs font-semibold text-muted-foreground">{h.sem}</span>
                    <span className="text-sm font-extrabold text-foreground">{h.sgpa}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Detailed active semester report from database */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2 border-b border-border/40 pb-2 select-none">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>{studentSem} Grade Ledger</span>
              </h3>

              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                        <th className="py-3 px-6">Subject</th>
                        <th className="py-3 px-6 text-center">Marks Scored</th>
                        <th className="py-3 px-6 text-center">Grade Letter</th>
                        <th className="py-3 px-6 text-center">Grade Point</th>
                        <th className="py-3 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {semGrades.length > 0 ? (
                        semGrades.map((grade) => (
                          <tr key={grade.code} className="hover:bg-secondary/15 transition-colors text-xs">
                            <td className="py-4 px-6 text-left">
                              <p className="font-bold text-foreground">{grade.name}</p>
                              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{grade.code}</p>
                            </td>
                            <td className="py-4 px-6 text-center text-muted-foreground font-semibold">
                              {grade.internals}
                            </td>
                            <td className="py-4 px-6 text-center font-extrabold text-foreground">
                              {grade.grade}
                            </td>
                            <td className="py-4 px-6 text-center font-extrabold text-muted-foreground">
                              {grade.points}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                                grade.status === "Pass"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-red-500/10 text-red-500"
                              } select-none`}>
                                {grade.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 px-6 text-center text-sm text-muted-foreground font-semibold">
                            No exam marks published in the grade ledger yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
