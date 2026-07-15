import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  X,
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  Users,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { cn } from "../../components/ui/utils";

interface FacultyMember {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: "Active" | "On Leave" | "Retired";
  joiningYear: number;
  avatar?: string;
}

interface FacultyFormInputs {
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: "Active" | "On Leave" | "Retired";
  joiningYear: number;
}

const INITIAL_FACULTY = [
  {
    id: "fac_01",
    name: "Prof. Saradha Krishnan",
    employeeId: "EMP-CS-201",
    email: "faculty@college.edu",
    phone: "+1 (555) 111-2222",
    department: "Computer Science & Engineering",
    designation: "Associate Professor",
    status: "Active",
    joiningYear: 2018,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "fac_02",
    name: "Dr. Ramachandran Pillai",
    employeeId: "EMP-EE-302",
    email: "rvance@college.edu",
    phone: "+1 (555) 222-3333",
    department: "Electrical Engineering",
    designation: "Professor",
    status: "Active",
    joiningYear: 2015,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "fac_03",
    name: "Dr. Anjali Menon",
    employeeId: "EMP-CS-202",
    email: "alovelace@college.edu",
    phone: "+1 (555) 333-4444",
    department: "Computer Science & Engineering",
    designation: "Associate Professor",
    status: "Active",
    joiningYear: 2019,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "fac_04",
    name: "Prof. Alagappan Sundaram",
    employeeId: "EMP-CS-203",
    email: "aturing@college.edu",
    phone: "+1 (555) 444-5555",
    department: "Computer Science & Engineering",
    designation: "Professor",
    status: "On Leave",
    joiningYear: 2012,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "fac_05",
    name: "Dr. Meenakshi Sundaram",
    employeeId: "EMP-ME-102",
    email: "mcurie@college.edu",
    phone: "+1 (555) 555-6666",
    department: "Mechanical Engineering",
    designation: "Professor",
    status: "Active",
    joiningYear: 2014,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "fac_06",
    name: "Prof. Adikesavan Sridhar",
    employeeId: "EMP-ME-101",
    email: "aeinstein@college.edu",
    phone: "+1 (555) 666-7777",
    department: "Mechanical Engineering",
    designation: "Professor",
    status: "Active",
    joiningYear: 2010,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "fac_07",
    name: "Dr. Gayatri Venkataraman",
    employeeId: "EMP-CS-204",
    email: "ghopper@college.edu",
    phone: "+1 (555) 777-8888",
    department: "Computer Science & Engineering",
    designation: "Lecturer",
    status: "Retired",
    joiningYear: 2008,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
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

const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
];

export default function Faculty() {
  const { impersonate } = useAuth();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All Departments");
  const [filterDesignation, setFilterDesignation] = useState("All Designations");
  const [filterStatus, setFilterStatus] = useState("All Statuses");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Faculty details view
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Add/Edit Form Overlay State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");

  // Delete Confirm State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<FacultyMember | null>(null);

  // Alert State
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Form hook
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FacultyFormInputs>();

  // Filter faculty lists
  const filteredFaculty = faculty.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      filterDept === "All Departments" || member.department === filterDept;

    const matchesDesg =
      filterDesignation === "All Designations" || member.designation === filterDesignation;

    const matchesStatus =
      filterStatus === "All Statuses" || member.status === filterStatus;

    return matchesSearch && matchesDept && matchesDesg && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);
  const paginatedFaculty = filteredFaculty.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when filter options change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDept, filterDesignation, filterStatus]);

  // Open Form modal
  const openForm = (mode: "add" | "edit", member?: FacultyMember) => {
    setFormMode(mode);
    if (mode === "edit" && member) {
      setSelectedFaculty(member);
      reset({
        name: member.name,
        employeeId: member.employeeId,
        email: member.email,
        phone: member.phone,
        department: member.department,
        designation: member.designation,
        status: member.status,
        joiningYear: member.joiningYear,
      });
    } else {
      setSelectedFaculty(null);
      reset({
        name: "",
        employeeId: "",
        email: "",
        phone: "",
        department: DEPARTMENTS[0],
        designation: DESIGNATIONS[0],
        status: "Active",
        joiningYear: new Date().getFullYear(),
      });
    }
    setIsFormOpen(true);
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.get("/api/faculty");
      const normalized = res.data.map((f: any) => ({
        ...f,
        id: String(f.id),
      }));
      setFaculty(normalized);
    } catch (err) {
      console.error("Failed to load faculty", err);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Form Submit (Add/Edit logic)
  const onSubmit = async (data: FacultyFormInputs) => {
    try {
      if (formMode === "add") {
        const payload = {
          name: data.name,
          employeeId: data.employeeId,
          email: data.email,
          phone: data.phone,
          department: data.department,
          designation: data.designation,
          status: data.status,
          joiningYear: Number(data.joiningYear),
          avatar: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150`,
        };
        await api.post("/api/faculty", payload);
        triggerAlert("Faculty profile registered successfully!");
      } else if (formMode === "edit" && selectedFaculty) {
        const payload = {
          id: Number(selectedFaculty.id),
          name: data.name,
          employeeId: data.employeeId,
          email: data.email,
          phone: data.phone,
          department: data.department,
          designation: data.designation,
          status: data.status,
          joiningYear: Number(data.joiningYear),
          avatar: selectedFaculty.avatar || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150`,
        };
        await api.put(`/api/faculty/${selectedFaculty.id}`, payload);
        triggerAlert("Faculty profile updated successfully!");
      }
      fetchFaculty();
    } catch (err) {
      console.error("Failed to save faculty member", err);
    }
    setIsFormOpen(false);
  };

  // Delete Action Confirm
  const handleDeleteRequest = (member: FacultyMember) => {
    setFacultyToDelete(member);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (facultyToDelete) {
      try {
        await api.delete(`/api/faculty/${facultyToDelete.id}`);
        triggerAlert(`Faculty member ${facultyToDelete.name} deleted successfully.`);
        fetchFaculty();
      } catch (err) {
        console.error("Failed to delete faculty", err);
      }
      setIsDeleteOpen(false);
      setFacultyToDelete(null);
    }
  };

  // Dashboard calculations
  const totalCount = faculty.length;
  const activeCount = faculty.filter((f) => f.status === "Active").length;
  const leaveCount = faculty.filter((f) => f.status === "On Leave").length;

  return (
    <div className="space-y-6 font-sans pb-12 transition-colors duration-300">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Faculty Directory</h1>
          <p className="text-xs text-muted-foreground">
            Manage faculty records, configure teaching designations, and inspect department divisions.
          </p>
        </div>

        <button
          onClick={() => openForm("add")}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-purple-600/20 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Faculty
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
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Faculty</span>
            <span className="text-2xl font-extrabold">{totalCount}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Active Teaching</span>
            <span className="text-2xl font-extrabold">{activeCount}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">On Leave</span>
            <span className="text-2xl font-extrabold">{leaveCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters Controls Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col lg:flex-row justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by faculty name or employee ID..."
          className="flex-grow max-w-full lg:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-semibold text-foreground cursor-pointer"
          >
            <option value="All Departments">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Designation Filter */}
          <select
            value={filterDesignation}
            onChange={(e) => setFilterDesignation(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-semibold text-foreground cursor-pointer"
          >
            <option value="All Designations">All Designations</option>
            {DESIGNATIONS.map((desg) => (
              <option key={desg} value={desg}>
                {desg}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-semibold text-foreground cursor-pointer"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="On Leave">On Leave Only</option>
            <option value="Retired">Retired Only</option>
          </select>
        </div>
      </div>

      {/* Database grid list - responsive table */}
      <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        {paginatedFaculty.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto opacity-75" />
            <p className="font-bold text-foreground">No faculty matches found</p>
            <p className="text-xs">Adjust your search keyword or drop the filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/30 select-none text-[10px] uppercase font-bold text-muted-foreground">
                    <th className="py-4 px-6">Faculty Profile</th>
                    <th className="py-4 px-4">Employee ID</th>
                    <th className="py-4 px-4">Department &amp; Title</th>
                    <th className="py-4 px-4">Joining Year</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedFaculty.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-muted/15 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-9 h-9 rounded-full object-cover border border-border"
                          />
                          <div>
                            <p className="font-bold text-sm text-foreground">{member.name}</p>
                            <p className="text-[10px] text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs font-semibold">
                        {member.employeeId}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium">{member.department}</p>
                        <p className="text-[10px] text-muted-foreground">{member.designation}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold">
                        {member.joiningYear}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider",
                            member.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/15"
                              : member.status === "On Leave"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/15"
                              : "bg-slate-500/10 text-slate-600 dark:text-slate-400 dark:bg-slate-500/15"
                          )}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            const facultyUser = {
                              id: String(member.id),
                              name: member.name,
                              email: member.email,
                              role: "faculty" as const,
                              department: member.department,
                              avatar: member.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                              title: member.designation || "Associate Professor",
                              employeeId: member.employeeId,
                            };
                            impersonate(facultyUser);
                            navigate("/faculty/dashboard");
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          title="Access Faculty Portal"
                        >
                          <LogIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFaculty(member);
                            setIsDetailsOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openForm("edit", member)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(member)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Faculty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Grid View */}
            <div className="block md:hidden p-4 space-y-4">
              {paginatedFaculty.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm hover:shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                      <div>
                        <p className="font-bold text-sm">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground">{member.employeeId}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider",
                        member.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : member.status === "On Leave"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {member.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Department</span>
                      <span className="font-medium block truncate">{member.department}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Title / Join Date</span>
                      <span className="font-bold block">
                        {member.designation} <span className="font-normal text-[10px] text-muted-foreground">({member.joiningYear})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      onClick={() => {
                        const facultyUser = {
                          id: String(member.id),
                          name: member.name,
                          email: member.email,
                          role: "faculty" as const,
                          department: member.department,
                          avatar: member.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                          title: member.designation || "Associate Professor",
                          employeeId: member.employeeId,
                        };
                        impersonate(facultyUser);
                        navigate("/faculty/dashboard");
                      }}
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
                      title="Access Portal"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Portal
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFaculty(member);
                        setIsDetailsOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <button
                      onClick={() => openForm("edit", member)}
                      className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline font-semibold cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(member)}
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
                totalItems={filteredFaculty.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </>
        )}
      </div>

      {/* OVERLAY MODAL 1: Faculty Detailed Information */}
      {isDetailsOpen && selectedFaculty && (
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
                src={selectedFaculty.avatar}
                alt={selectedFaculty.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-purple-500 shadow-sm"
              />
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedFaculty.name}</h3>
                <p className="text-xs text-muted-foreground font-mono font-bold mt-0.5">
                  {selectedFaculty.employeeId}
                </p>
                <span
                  className={cn(
                    "inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider mt-2",
                    selectedFaculty.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : selectedFaculty.status === "On Leave"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {selectedFaculty.status}
                </span>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs leading-relaxed">
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-border/30">
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Department</span>
                  <span className="font-semibold text-sm text-foreground">{selectedFaculty.department}</span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Designation</span>
                  <span className="font-semibold text-sm text-foreground">{selectedFaculty.designation}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b border-border/30">
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Office Email</span>
                  <span className="font-semibold text-foreground truncate block select-all">{selectedFaculty.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Mobile Phone</span>
                  <span className="font-semibold text-foreground block select-all">{selectedFaculty.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b border-border/30">
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Year of Joining</span>
                  <span className="font-semibold text-sm text-foreground">{selectedFaculty.joiningYear}</span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] font-bold block">Credentials Class</span>
                  <span className="font-semibold text-sm text-foreground">Faculty Member</span>
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

      {/* OVERLAY MODAL 2: Add / Edit Faculty Data Form */}
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
              {formMode === "add" ? "Register Faculty Appointment" : "Update Faculty Profile"}
            </h3>

            {/* Error notifications block */}
            {Object.keys(errors).length > 0 && (
              <div className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] space-y-0.5">
                <p className="font-bold">Form Submission Alerts:</p>
                {errors.name && <p>• {errors.name.message}</p>}
                {errors.employeeId && <p>• {errors.employeeId.message}</p>}
                {errors.email && <p>• {errors.email.message}</p>}
                {errors.phone && <p>• {errors.phone.message}</p>}
                {errors.joiningYear && <p>• {errors.joiningYear.message}</p>}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
                    {...register("name", { required: "Name is required" })}
                  />
                </div>

                {/* Employee ID */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Employee ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-mono"
                    placeholder="e.g. EMP-CS-205"
                    {...register("employeeId", { required: "Employee ID is required" })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Office Email</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
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
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
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
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs cursor-pointer"
                    {...register("department")}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Designation</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs cursor-pointer"
                    {...register("designation")}
                  >
                    {DESIGNATIONS.map((desg) => (
                      <option key={desg} value={desg}>
                        {desg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Joining Year */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Year of Joining</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs"
                    {...register("joiningYear", {
                      required: "Joining year is required",
                      min: { value: 1990, message: "Valid year starts at 1990" },
                    })}
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Employment Status</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-bold text-foreground cursor-pointer"
                    {...register("status")}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Retired">Retired</option>
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
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-md shadow-purple-600/10 cursor-pointer"
                >
                  {formMode === "add" ? "Register Faculty" : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY DIALOG 3: Reusable Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Confirm Faculty Deletion"
        message={`Are you sure you want to delete the faculty profile for "${facultyToDelete?.name}"? This action removes all department records, subject allocations, and logins associated, and cannot be undone.`}
        confirmLabel="Delete Permanently"
        cancelLabel="Discard"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setFacultyToDelete(null);
        }}
        variant="danger"
      />
    </div>
  );
}
