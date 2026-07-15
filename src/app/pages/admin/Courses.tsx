import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  X,
  BookOpen,
  CheckCircle,
  GraduationCap,
  Award,
  Users,
  AlertTriangle,
} from "lucide-react";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { cn } from "../../components/ui/utils";

interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  duration: string;
  faculty: string;
  studentCount: number;
  status: "Active" | "Archived";
  syllabus: string[];
}

interface CourseFormInputs {
  code: string;
  name: string;
  department: string;
  credits: number;
  duration: string;
  faculty: string;
  status: "Active" | "Archived";
}

const INITIAL_COURSES: Course[] = [
  {
    id: "crs_01",
    code: "CS-301",
    name: "Advanced Software Engineering",
    department: "Computer Science & Engineering",
    credits: 4,
    duration: "1 Semester",
    faculty: "Prof. Saradha Krishnan",
    studentCount: 42,
    status: "Active",
    syllabus: [
      "Software Life Cycle Models (Agile, DevOps)",
      "System Requirements Analysis & UML",
      "Software Design Patterns & Clean Code",
      "Automated Testing & CI/CD Pipelines",
    ],
  },
  {
    id: "crs_02",
    code: "CS-302",
    name: "Advanced Database Systems",
    department: "Computer Science & Engineering",
    credits: 4,
    duration: "1 Semester",
    faculty: "Dr. Anjali Menon",
    studentCount: 38,
    status: "Active",
    syllabus: [
      "Relational Query Optimization",
      "NoSQL Database Implementations",
      "Distributed Database Transactions (ACID/BASE)",
      "Data Warehousing & OLAP Cubes",
    ],
  },
  {
    id: "crs_03",
    code: "EE-201",
    name: "Core Electrical Networks",
    department: "Electrical Engineering",
    credits: 3,
    duration: "1 Semester",
    faculty: "Dr. Ramachandran Pillai",
    studentCount: 28,
    status: "Active",
    syllabus: [
      "AC/DC Circuit Theory Analysis",
      "Laplace Transforms in Networks",
      "Two-Port Network Parameters",
      "Filters & Impedance Matching",
    ],
  },
  {
    id: "crs_04",
    code: "ME-102",
    name: "Classical Mechanics & Thermodynamics",
    department: "Mechanical Engineering",
    credits: 3,
    duration: "1 Semester",
    faculty: "Dr. Meenakshi Sundaram",
    studentCount: 22,
    status: "Active",
    syllabus: [
      "Laws of Thermodynamics (First & Second)",
      "Entropy and Heat Engines",
      "Newtonian Rigid Body Dynamics",
      "Fluid Mechanics Foundations",
    ],
  },
  {
    id: "crs_05",
    code: "CS-401",
    name: "Systems Design & Analysis",
    department: "Computer Science & Engineering",
    credits: 4,
    duration: "1 Semester",
    faculty: "Prof. Alagappan Sundaram",
    studentCount: 45,
    status: "Active",
    syllabus: [
      "Distributed Systems Architecture",
      "Load Balancing & Caching Strategies",
      "Message Queues & Microservices",
      "System Scalability & Security Protocols",
    ],
  },
  {
    id: "crs_06",
    code: "BA-104",
    name: "Operations Management",
    department: "Business Administration",
    credits: 3,
    duration: "1 Semester",
    faculty: "Dr. Aravind Swamy",
    studentCount: 50,
    status: "Active",
    syllabus: [
      "Supply Chain Logistics Strategies",
      "Project Management & Gantt Planning",
      "Quality Control (Six Sigma, Lean)",
      "Inventory Management Algorithms",
    ],
  },
  {
    id: "crs_07",
    code: "ME-101",
    name: "Introductory Mechanics",
    department: "Mechanical Engineering",
    credits: 4,
    duration: "1 Semester",
    faculty: "Prof. Albert Einstein",
    studentCount: 15,
    status: "Archived",
    syllabus: [
      "Kinematics of Particles",
      "Friction and Torque Systems",
      "Work-Energy Theorem Principles",
      "Linear Momentum & Collisions",
    ],
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

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All Departments");
  const [filterCredits, setFilterCredits] = useState("All Credits");
  const [filterStatus, setFilterStatus] = useState("All Statuses");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Course details view
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Add/Edit Form Overlay State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");

  // Delete Confirm State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

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
    formState: { errors },
  } = useForm<CourseFormInputs>();

  // Filter course lists
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      filterDept === "All Departments" || course.department === filterDept;

    const matchesCredits =
      filterCredits === "All Credits" || course.credits === Number(filterCredits);

    const matchesStatus =
      filterStatus === "All Statuses" || course.status === filterStatus;

    return matchesSearch && matchesDept && matchesCredits && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when filter options change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDept, filterCredits, filterStatus]);

  // Open Form modal
  const openForm = (mode: "add" | "edit", course?: Course) => {
    setFormMode(mode);
    if (mode === "edit" && course) {
      setSelectedCourse(course);
      reset({
        code: course.code,
        name: course.name,
        department: course.department,
        credits: course.credits,
        duration: course.duration,
        faculty: course.faculty,
        status: course.status,
      });
    } else {
      setSelectedCourse(null);
      reset({
        code: "",
        name: "",
        department: DEPARTMENTS[0],
        credits: 3,
        duration: "1 Semester",
        faculty: "",
        status: "Active",
      });
    }
    setIsFormOpen(true);
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/api/courses");
      const normalized = res.data.map((c: any) => ({
        ...c,
        id: String(c.id),
        syllabus: c.syllabus || [
          "Module 1: Introduction & Basic Fundamentals",
          "Module 2: Advanced Topics & Case Studies",
          "Module 3: Project Architecture & Execution",
          "Module 4: Final Assessment & Evaluation",
        ],
      }));
      setCourses(normalized);
    } catch (err) {
      console.error("Failed to load courses", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Form Submit (Add/Edit logic)
  const onSubmit = async (data: CourseFormInputs) => {
    try {
      if (formMode === "add") {
        const payload = {
          code: data.code,
          name: data.name,
          department: data.department,
          credits: Number(data.credits),
          duration: data.duration,
          faculty: data.faculty,
          studentCount: 0,
          status: data.status,
          syllabus: "Module 1: Introduction & Basic Fundamentals, Module 2: Advanced Topics, Module 3: Project Architecture, Module 4: Final Evaluation",
        };
        await api.post("/api/courses", payload);
        triggerAlert("New course syllabus registered successfully!");
      } else if (formMode === "edit" && selectedCourse) {
        const payload = {
          id: Number(selectedCourse.id),
          code: data.code,
          name: data.name,
          department: data.department,
          credits: Number(data.credits),
          duration: data.duration,
          faculty: data.faculty,
          studentCount: selectedCourse.studentCount || 0,
          status: data.status,
          syllabus: Array.isArray(selectedCourse.syllabus) ? selectedCourse.syllabus.join(", ") : selectedCourse.syllabus,
        };
        await api.put(`/api/courses/${selectedCourse.id}`, payload);
        triggerAlert("Course details modified successfully!");
      }
      fetchCourses();
    } catch (err) {
      console.error("Failed to save course", err);
    }
    setIsFormOpen(false);
  };

  // Delete Action Confirm
  const handleDeleteRequest = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (courseToDelete) {
      try {
        await api.delete(`/api/courses/${courseToDelete.id}`);
        triggerAlert(`Course syllabus ${courseToDelete.code} archived successfully.`);
        fetchCourses();
      } catch (err) {
        console.error("Failed to delete course", err);
      }
      setIsDeleteOpen(false);
      setCourseToDelete(null);
    }
  };

  // Dashboard calculations
  const totalCount = courses.length;
  const totalStudents = courses.reduce((acc, curr) => acc + curr.studentCount, 0);
  const avgCredits = (courses.reduce((acc, curr) => acc + curr.credits, 0) / totalCount).toFixed(1);

  return (
    <div className="space-y-6 font-sans pb-12 transition-colors duration-300">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Course Registry</h1>
          <p className="text-xs text-muted-foreground">
            Configure subjects syllabus, balance credit indices, assign faculty profiles, and check class registers.
          </p>
        </div>

        <button
          onClick={() => openForm("add")}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Course
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
        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm select-none">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Courses</span>
            <span className="text-2xl font-extrabold">{totalCount}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm select-none">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Class Enrollments</span>
            <span className="text-2xl font-extrabold">{totalStudents}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm select-none">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Average Credits</span>
            <span className="text-2xl font-extrabold">{avgCredits} CR</span>
          </div>
        </div>
      </div>

      {/* Search & Filters Controls Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col lg:flex-row justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by course title or syllabus code..."
          className="flex-grow max-w-full lg:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-semibold text-foreground cursor-pointer"
          >
            <option value="All Departments">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Credits Filter */}
          <select
            value={filterCredits}
            onChange={(e) => setFilterCredits(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-semibold text-foreground cursor-pointer"
          >
            <option value="All Credits">All Credits</option>
            <option value="3">3 Credits Only</option>
            <option value="4">4 Credits Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-semibold text-foreground cursor-pointer"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Archived">Archived Only</option>
          </select>
        </div>
      </div>

      {/* Database grid list - responsive table */}
      <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        {paginatedCourses.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto opacity-75" />
            <p className="font-bold text-foreground">No courses matches found</p>
            <p className="text-xs">Adjust your search keyword or drop the filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/30 select-none text-[10px] uppercase font-bold text-muted-foreground">
                    <th className="py-4 px-6">Course Syllabus</th>
                    <th className="py-4 px-4">Subject Code</th>
                    <th className="py-4 px-4">Department &amp; Credits</th>
                    <th className="py-4 px-4">Assigned Faculty</th>
                    <th className="py-4 px-4">Enrollment</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-muted/15 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{course.name}</p>
                            <p className="text-[10px] text-muted-foreground">Term: {course.duration}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                        {course.code}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{course.department}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">{course.credits} CR weight</p>
                      </td>
                      <td className="py-4 px-4 font-semibold text-foreground">
                        {course.faculty || "Unassigned"}
                      </td>
                      <td className="py-4 px-4 font-bold text-sm text-foreground/80">
                        {course.studentCount} Students
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsDetailsOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          title="View Details &amp; Syllabus"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openForm("edit", course)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(course)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Archive Course"
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
              {paginatedCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{course.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{course.code}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider",
                        course.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {course.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Faculty / term</span>
                      <span className="font-medium block truncate">{course.faculty || "Unassigned"} ({course.duration})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Department &amp; CR</span>
                      <span className="font-bold block truncate">
                        {course.credits} CR <span className="font-normal text-[10px] text-muted-foreground">({course.department})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsDetailsOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      onClick={() => openForm("edit", course)}
                      className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline font-semibold cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(course)}
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
                totalItems={filteredCourses.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </>
        )}
      </div>

      {/* OVERLAY MODAL 1: Course Details & Syllabus */}
      {isDetailsOpen && selectedCourse && (
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

            <div className="flex gap-4 pb-4 border-b border-border/40 items-start">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                  {selectedCourse.code}
                </span>
                <h3 className="text-lg font-bold text-foreground">{selectedCourse.name}</h3>
                <span className="text-[10px] text-muted-foreground font-semibold mt-1 block">
                  Department: {selectedCourse.department}
                </span>
              </div>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/35 rounded-xl border border-border/45 select-none text-center">
                <div>
                  <span className="text-muted-foreground text-[9px] font-bold uppercase block">Credits</span>
                  <span className="font-extrabold text-sm text-foreground">{selectedCourse.credits} CR</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[9px] font-bold uppercase block">Students</span>
                  <span className="font-extrabold text-sm text-foreground">{selectedCourse.studentCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[9px] font-bold uppercase block">Term</span>
                  <span className="font-extrabold text-sm text-foreground">{selectedCourse.duration}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <span>Syllabus Modules Outline</span>
                  <span className="text-primary font-semibold">Fall Semester Cycle</span>
                </div>
                <div className="space-y-1.5">
                  {selectedCourse.syllabus.map((module, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-border/40 bg-card hover:bg-muted/10 transition-colors flex gap-2.5 items-start"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-foreground/90 font-medium">{module}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Assigned Professor:</span>
                <strong className="font-semibold text-foreground bg-secondary px-2.5 py-1 rounded-lg">
                  {selectedCourse.faculty || "Unallocated Staff"}
                </strong>
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

      {/* OVERLAY MODAL 2: Add / Edit Course Form */}
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
              {formMode === "add" ? "Register Subject Syllabus" : "Update Course Syllabus Settings"}
            </h3>

            {/* Error notifications block */}
            {Object.keys(errors).length > 0 && (
              <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] space-y-0.5 font-medium">
                <p className="font-bold">Form Submission Alerts:</p>
                {errors.code && <p>• {errors.code.message}</p>}
                {errors.name && <p>• {errors.name.message}</p>}
                {errors.credits && <p>• {errors.credits.message}</p>}
                {errors.faculty && <p>• {errors.faculty.message}</p>}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                {/* Course Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Course Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs"
                    {...register("name", { required: "Course title is required" })}
                  />
                </div>

                {/* Course Code */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Syllabus Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-mono"
                    placeholder="e.g. CS-301"
                    {...register("code", { required: "Course syllabus code is required" })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Department */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Academic Department</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs cursor-pointer"
                    {...register("department")}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Term Duration */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Duration Cycle</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs cursor-pointer"
                    {...register("duration")}
                  >
                    <option value="1 Semester">1 Semester</option>
                    <option value="2 Semesters">2 Semesters (Yearly)</option>
                    <option value="8 Weeks">8 Weeks (Short term)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Credits */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Credits weight</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-bold text-foreground"
                    {...register("credits", {
                      required: "Credits rating is required",
                      min: { value: 1, message: "Minimum CR load is 1" },
                      max: { value: 6, message: "Maximum CR load limit is 6" },
                    })}
                  />
                </div>

                {/* Assigned Faculty */}
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold text-muted-foreground">Allocated Professor</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs"
                    placeholder="e.g. Prof. Saradha Krishnan"
                    {...register("faculty", { required: "Allocated instructor is required" })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Status Setting</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-bold text-foreground cursor-pointer"
                    {...register("status")}
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  {formMode === "add" ? "Register Course" : "Modify Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY DIALOG 3: Reusable Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Confirm Course Archival"
        message={`Are you sure you want to delete or archive the course catalog "${courseToDelete?.name}" (${courseToDelete?.code})? This action removes syllabus outlines and restricts registrations. Existing enrollments remain unaffected.`}
        confirmLabel="Archive Catalog"
        cancelLabel="Discard"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setCourseToDelete(null);
        }}
        variant="warning"
      />
    </div>
  );
}
