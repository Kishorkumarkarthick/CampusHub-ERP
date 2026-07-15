import React, { useState } from "react";
import { BookOpen, Users, Search, ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";

interface Student {
  rollNo: string;
  name: string;
  email: string;
  attendance: string;
  marks: string;
}

interface Subject {
  code: string;
  name: string;
  semester: string;
  syllabus: number;
  students: Student[];
}

export default function FacultySubjects() {
  const mockSubjects: Subject[] = [
    {
      code: "CS301",
      name: "Data Structures & Algorithms",
      semester: "3rd Semester - CSE",
      syllabus: 78,
      students: [
        { rollNo: "2025CS1001", name: "Aaron Smith", email: "aaron@college.edu", attendance: "94%", marks: "26/30" },
        { rollNo: "2025CS1002", name: "Bella Swan", email: "bella@college.edu", attendance: "88%", marks: "24/30" },
        { rollNo: "2025CS1003", name: "Charles Xavier", email: "charles@college.edu", attendance: "96%", marks: "29/30" },
        { rollNo: "2025CS1004", name: "David Miller", email: "david@college.edu", attendance: "78%", marks: "18/30" },
        { rollNo: "2025CS1005", name: "Emma Watson", email: "emma@college.edu", attendance: "98%", marks: "28/30" },
        { rollNo: "2025CS1006", name: "Frank Lampard", email: "frank@college.edu", attendance: "84%", marks: "22/30" },
        { rollNo: "2025CS1007", name: "Grace Kelly", email: "grace@college.edu", attendance: "92%", marks: "25/30" },
      ],
    },
    {
      code: "CS503P",
      name: "Operating Systems Lab",
      semester: "5th Semester - CSE",
      syllabus: 60,
      students: [
        { rollNo: "2024CS2001", name: "Ian Somerhalder", email: "ian@college.edu", attendance: "91%", marks: "23/30" },
        { rollNo: "2024CS2002", name: "Jack Sparrow", email: "jack@college.edu", attendance: "65%", marks: "14/30" },
        { rollNo: "2024CS2003", name: "Katherine Pierce", email: "katherine@college.edu", attendance: "95%", marks: "28/30" },
        { rollNo: "2024CS2004", name: "Liam Neeson", email: "liam@college.edu", attendance: "87%", marks: "21/30" },
      ],
    },
    {
      code: "CS702",
      name: "Introduction to Cloud Computing",
      semester: "7th Semester - CSE",
      syllabus: 55,
      students: [
        { rollNo: "2023CS3001", name: "Oliver Queen", email: "oliver@college.edu", attendance: "93%", marks: "27/30" },
        { rollNo: "2023CS3002", name: "Peter Parker", email: "peter@college.edu", attendance: "82%", marks: "20/30" },
        { rollNo: "2023CS3003", name: "Quentin Lance", email: "quentin@college.edu", attendance: "90%", marks: "24/30" },
      ],
    },
  ];

  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const activeSubject = mockSubjects[selectedSubjectIndex];

  // Filtering
  const filteredStudents = activeSubject.students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handleSubjectChange = (idx: number) => {
    setSelectedSubjectIndex(idx);
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Subjects & Students</h1>
        <p className="text-sm text-muted-foreground">
          View assigned course details, syllabus progress, and search students enrolled in each subject.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Subject selection */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>Assigned Classes</span>
          </h2>

          <div className="space-y-3">
            {mockSubjects.map((sub, idx) => {
              const isSelected = selectedSubjectIndex === idx;
              return (
                <button
                  key={sub.code}
                  onClick={() => handleSubjectChange(idx)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600/5 text-foreground shadow-sm font-semibold"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {sub.code}
                  </p>
                  <h3 className="font-bold text-foreground mt-0.5">{sub.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{sub.students.length} Students Enrolled</span>
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Subject syllabus + student list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Syllabus Progress */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-foreground">{activeSubject.name}</h3>
                <p className="text-xs text-muted-foreground">{activeSubject.semester}</p>
              </div>
              <span className="font-extrabold text-emerald-600 text-xl">{activeSubject.syllabus}%</span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${activeSubject.syllabus}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
              Syllabus Completion Index
            </p>
          </div>

          {/* Student Registry Table Card */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Table actions */}
            <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-3">
              <h3 className="font-bold text-base text-foreground self-start sm:self-center">
                Student Registry ({filteredStudents.length})
              </h3>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or roll no..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs font-sans"
                />
              </div>
            </div>

            {/* Table grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                    <th className="py-3.5 px-6">Roll Number</th>
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6 text-center">Attendance</th>
                    <th className="py-3.5 px-6 text-center">Internal Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student) => (
                      <tr key={student.rollNo} className="hover:bg-secondary/20 transition-colors text-xs">
                        <td className="py-4 px-6 font-semibold text-foreground">{student.rollNo}</td>
                        <td className="py-4 px-6 font-bold">{student.name}</td>
                        <td className="py-4 px-6 text-muted-foreground">{student.email}</td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              parseFloat(student.attendance) >= 85
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : parseFloat(student.attendance) >= 75
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {student.attendance}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-foreground">
                          {student.marks}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 px-6 text-center text-sm text-muted-foreground">
                        No enrolled students match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex justify-between items-center bg-secondary/10">
                <span className="text-xs text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{startIndex + 1}</span> to{" "}
                  <span className="font-bold text-foreground">
                    {Math.min(startIndex + itemsPerPage, filteredStudents.length)}
                  </span>{" "}
                  of <span className="font-bold text-foreground">{filteredStudents.length}</span> students
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary/40 text-muted-foreground disabled:opacity-50 cursor-pointer disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary/40 text-muted-foreground disabled:opacity-50 cursor-pointer disabled:pointer-events-none"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
