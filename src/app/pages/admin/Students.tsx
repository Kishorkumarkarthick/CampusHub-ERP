import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  X,
  Users,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { cn } from "../../components/ui/utils";

interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  department: string;
  semester: string;
  cgpa: number;
  status: "Active" | "Inactive";
  admissionYear: number;
  avatar?: string;
}

interface StudentFormInputs {
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  department: string;
  semester: string;
  cgpa: number;
  status: "Active" | "Inactive";
  admissionYear: number;
}

const INITIAL_STUDENTS: Student[] = [
  {
    id: "std_01",
    name: "Kishore Kumar",
    rollNo: "2023CS1045",
    email: "student@college.edu",
    phone: "+91 98765 43210",
    department: "Computer Science & Engineering",
    semester: "5th Semester",
    cgpa: 9.2,
    status: "Active",
    admissionYear: 2023,
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "std_02",
    name: "Jane Smith",
    rollNo: "2023CS1046",
    email: "janesmith@college.edu",
    phone: "+1 (555) 123-4567",
    department: "Computer Science & Engineering",
    semester: "5th Semester",
    cgpa: 8.8,
    status: "Active",
    admissionYear: 2023,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "std_03",
    name: "Robert Johnson",
    rollNo: "2024EE1089",
    email: "robert.j@college.edu",
    phone: "+1 (555) 234-5678",
    department: "Electrical Engineering",
    semester: "3rd Semester",
    cgpa: 7.9,
    status: "Active",
    admissionYear: 2024,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "std_04",
    name: "Emily Davis",
    rollNo: "2022ME2041",
    email: "emily.davis@college.edu",
    phone: "+1 (555) 345-6789",
    department: "Mechanical Engineering",
    semester: "7th Semester",
    cgpa: 8.1,
    status: "Inactive",
    admissionYear: 2022,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "std_05",
    name: "Michael Brown",
    rollNo: "2023BA1005",
    email: "mbrown@college.edu",
    phone: "+1 (555) 456-7890",
    department: "Business Administration",
    semester: "5th Semester",
    cgpa: 8.5,
    status: "Active",
    admissionYear: 2023,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "std_06",
    name: "Sophia Garcia",
    rollNo: "2023CS1047",
    email: "sophia.g@college.edu",
    phone: "+1 (555) 567-8901",
    department: "Computer Science & Engineering",
    semester: "5th Semester",
    cgpa: 9.5,
    status: "Active",
    admissionYear: 2023,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "std_07",
    name: "Daniel Wilson",
    rollNo: "2024EE1090",
    email: "dwilson@college.edu",
    phone: "+1 (555) 678-9012",
    department: "Electrical Engineering",
    semester: "3rd Semester",
    cgpa: 6.8,
    status: "Inactive",
    admissionYear: 2024,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "std_08",
    name: "Olivia Martinez",
    rollNo: "2023BA1006",
    email: "olivia.m@college.edu",
    phone: "+1 (555) 789-0123",
    department: "Business Administration",
    semester: "5th Semester",
    cgpa: 8.9,
    status: "Active",
    admissionYear: 2023,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  },
];

const DEPARTMENTS = [
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

export default function Students() {
  const { impersonate } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All Departments");
  const [filterStatus, setFilterStatus] = useState("All Statuses");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Student view/edit state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Add/Edit Form Overlay State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");

  // Delete Confirm State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Alert State
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Form hooks
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StudentFormInputs>();

  // Filter student lists
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      filterDept === "All Departments" || student.department === filterDept;

    const matchesStatus =
      filterStatus === "All Statuses" || student.status === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when filter options change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDept, filterStatus]);

  // Open Form modal
  const openForm = (mode: "add" | "edit", student?: Student) => {
    setFormMode(mode);
    if (mode === "edit" && student) {
      setSelectedStudent(student);
      reset({
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        phone: student.phone,
        department: student.department,
        semester: student.semester,
        cgpa: student.cgpa,
        status: student.status,
        admissionYear: student.admissionYear,
      });
    } else {
      setSelectedStudent(null);
      reset({
        name: "",
        rollNo: "",
        email: "",
        phone: "",
        department: DEPARTMENTS[0],
        semester: "1st Semester",
        cgpa: 0,
        status: "Active",
        admissionYear: new Date().getFullYear(),
      });
    }
    setIsFormOpen(true);
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/api/students");
      const normalized = res.data.map((s: any) => ({
        ...s,
        id: String(s.id),
      }));
      setStudents(normalized);
    } catch (err) {
      console.error("Failed to load students", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Form Submit (Add/Edit logic)
  const onSubmit = async (data: StudentFormInputs) => {
    try {
      if (formMode === "add") {
        const payload = {
          name: data.name,
          rollNo: data.rollNo,
          email: data.email,
          phone: data.phone,
          department: data.department,
          semester: data.semester,
          cgpa: Number(data.cgpa),
          admissionYear: Number(data.admissionYear),
          avatar: `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150`,
        };
        await api.post("/api/students", payload);
        triggerAlert("Student profile added successfully!");
      } else if (formMode === "edit" && selectedStudent) {
        const payload = {
          id: Number(selectedStudent.id),
          name: data.name,
          rollNo: data.rollNo,
          email: data.email,
          phone: data.phone,
          department: data.department,
          semester: data.semester,
          cgpa: Number(data.cgpa),
          admissionYear: Number(data.admissionYear),
          avatar: selectedStudent.avatar || `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150`,
        };
        await api.put(`/api/students/${selectedStudent.id}`, payload);
        triggerAlert("Student profile updated successfully!");
      }
      fetchStudents();
    } catch (err) {
      console.error("Failed to save student", err);
    }
    setIsFormOpen(false);
  };

  // Delete Action Confirm
  const handleDeleteRequest = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      try {
        await api.delete(`/api/students/${studentToDelete.id}`);
        triggerAlert(`Student ${studentToDelete.name} deleted successfully.`);
        fetchStudents();
      } catch (err) {
        console.error("Failed to delete student", err);
      }
      setIsDeleteOpen(false);
      setStudentToDelete(null);
    }
  };

  // Dashboard calculations
  const totalCount = students.length;
  const activeCount = students.filter((s) => s.status === "Active").length;
  const avgCgpa = (students.reduce((acc, curr) => acc + curr.cgpa, 0) / totalCount).toFixed(2);

  return (
    <div className="space-y-6 font-sans pb-12 transition-colors duration-300">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Database</h1>
          <p className="text-xs text-muted-foreground">
            Manage student profile records, register enrollments, and check academic indices.
          </p>
        </div>

        <button
          onClick={() => openForm("add")}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 shadow-md shadow-primary/20 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Student
        </button>
      </div>

      {/* Success Alert Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Key Metric Indicators Banner */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Students</span>
            <span className="text-2xl font-extrabold">{totalCount}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Active Enrollment</span>
            <span className="text-2xl font-extrabold">{activeCount}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Average CGPA</span>
            <span className="text-2xl font-extrabold">{avgCgpa}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters Controls Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by student name or roll number..."
          className="flex-grow max-w-full md:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Department filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-semibold text-foreground cursor-pointer"
          >
            <option value="All Departments">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-semibold text-foreground cursor-pointer"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Database grid list - responsive table */}
      <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        {paginatedStudents.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto opacity-75" />
            <p className="font-bold text-foreground">No students matches found</p>
            <p className="text-xs">Adjust your search keyword or drop the filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/30 select-none text-[10px] uppercase font-bold text-muted-foreground">
                    <th className="py-4 px-6">Student details</th>
                    <th className="py-4 px-4">Roll Number</th>
                    <th className="py-4 px-4">Department &amp; Semester</th>
                    <th className="py-4 px-4">CGPA Index</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-muted/15 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                            alt={student.name}
                            className="w-9 h-9 rounded-full object-cover border border-border"
                          />
                          <div>
                            <p className="font-bold text-sm text-foreground">{student.name}</p>
                            <p className="text-[10px] text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs font-semibold">
                        {student.rollNo}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{student.department}</p>
                        <p className="text-[10px] text-muted-foreground">{student.semester}</p>
                      </td>
                      <td className="py-4 px-4 font-bold text-sm">
                        {student.cgpa.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider",
                            student.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/15"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15"
                          )}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            const studentUser = {
                              id: String(student.id),
                              name: student.name,
                              email: student.email,
                              role: "student" as const,
                              department: student.department,
                              rollNo: student.rollNo,
                              semester: student.semester,
                              avatar: student.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
                              title: student.studentYear || "3rd Year",
                            };
                            impersonate(studentUser);
                            navigate("/student/dashboard");
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          title="Access Student Portal"
                        >
                          <LogIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsDetailsOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openForm("edit", student)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(student)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Grid Cards View */}
            <div className="block md:hidden p-4 space-y-4">
              {paginatedStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                      <div>
                        <p className="font-bold text-sm">{student.name}</p>
                        <p className="text-[10px] text-muted-foreground">{student.rollNo}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider",
                        student.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {student.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Department</span>
                      <span className="font-medium block truncate">{student.department}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">GPA / Semester</span>
                      <span className="font-bold block">
                        {student.cgpa.toFixed(2)} <span className="font-normal text-[10px] text-muted-foreground">({student.semester})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      onClick={() => {
                        const studentUser = {
                          id: String(student.id),
                          name: student.name,
                          email: student.email,
                          role: "student" as const,
                          department: student.department,
                          rollNo: student.rollNo,
                          semester: student.semester,
                          avatar: student.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
                          title: student.studentYear || "3rd Year",
                        };
                        impersonate(studentUser);
                        navigate("/student/dashboard");
                      }}
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
                      title="Access Portal"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Portal
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsDetailsOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      onClick={() => openForm("edit", student)}
                      className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline font-semibold cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(student)}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls Bar */}
            <div className="px-6 border-t border-border/40 bg-card">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredStudents.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </>
        )}
      </div>

      {/* OVERLAY MODAL 1: Student Detailed Information */}
      {isDetailsOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setIsDetailsOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-border/40">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary shadow-sm"
              />
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedStudent.name}</h3>
                <p className="text-xs text-muted-foreground font-mono font-bold mt-0.5">
                  {selectedStudent.rollNo}
                </p>
                <span
                  className={cn(
                    "inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider mt-2",
                    selectedStudent.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {selectedStudent.status}
                </span>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-border/30">
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Department</span>
                  <span className="font-semibold text-sm text-foreground">{selectedStudent.department}</span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Semester cycle</span>
                  <span className="font-semibold text-sm text-foreground">{selectedStudent.semester}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b border-border/30">
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">GPA Index score</span>
                  <span className="font-extrabold text-sm text-foreground">{selectedStudent.cgpa.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Admission Year</span>
                  <span className="font-semibold text-sm text-foreground">{selectedStudent.admissionYear}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b border-border/30">
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Email address</span>
                  <span className="font-semibold text-foreground truncate block select-all">{selectedStudent.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Mobile Phone</span>
                  <span className="font-semibold text-foreground block select-all">{selectedStudent.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-accent text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL 2: Add / Edit Student Data Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setIsFormOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold mb-4 border-b border-border/40 pb-2">
              {formMode === "add" ? "Register Student Enrollment" : "Update Student Profile"}
            </h3>

            {/* Error notifications block */}
            {Object.keys(errors).length > 0 && (
              <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] space-y-0.5">
                <p className="font-bold">Form Submission Alerts:</p>
                {errors.name && <p>• {errors.name.message}</p>}
                {errors.rollNo && <p>• {errors.rollNo.message}</p>}
                {errors.email && <p>• {errors.email.message}</p>}
                {errors.phone && <p>• {errors.phone.message}</p>}
                {errors.cgpa && <p>• {errors.cgpa.message}</p>}
                {errors.admissionYear && <p>• {errors.admissionYear.message}</p>}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                    {...register("name", { required: "Name is required" })}
                  />
                </div>

                {/* Roll Number */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Roll Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-mono"
                    placeholder="e.g. 2026CS1001"
                    {...register("rollNo", { required: "Roll number is required" })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">University Email</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email structure",
                      },
                    })}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Phone Contact</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                    placeholder="e.g. +1 (555) 123-4567"
                    {...register("phone", { required: "Phone number is required" })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Department</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                    {...register("department")}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Semester Cycle</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                    {...register("semester")}
                  >
                    {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((num) => (
                      <option key={num} value={`${num} Semester`}>
                        {num} Semester
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* CGPA */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">CGPA Index (0-10)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-bold"
                    {...register("cgpa", {
                      required: "CGPA index is required",
                      min: { value: 0, message: "GPA cannot be negative" },
                      max: { value: 10, message: "GPA cannot exceed 10.00" },
                    })}
                  />
                </div>

                {/* Admission Year */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Admission Year</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                    {...register("admissionYear", {
                      required: "Admission year is required",
                      min: { value: 2010, message: "Minimum valid year is 2010" },
                    })}
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">System Status</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-bold text-foreground"
                    {...register("status")}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-border/40 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/95 shadow-md shadow-primary/10 cursor-pointer"
                >
                  {formMode === "add" ? "Register Student" : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY DIALOG 3: Reusable Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Confirm Student Deletion"
        message={`Are you sure you want to delete the student profile for "${studentToDelete?.name}"? This action removes all historical database records for this student and cannot be undone.`}
        confirmLabel="Delete Permanently"
        cancelLabel="Discard"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setStudentToDelete(null);
        }}
        variant="danger"
      />
    </div>
  );
}
