import React, { useState, useEffect } from "react";
import { Plus, Search, Building2, User, Landmark, Trash2, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface Department {
  id?: number;
  code: string;
  name: string;
  hod: string;
  block: string;
  facultiesCount: number;
  studentsCount: number;
}

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  
  // Form states
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editHod, setEditHod] = useState("");
  const [editBlock, setEditBlock] = useState("");

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to load departments", err);
      toast.error("Failed to load departments from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.hod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formMode === "add") {
        const exists = departments.find((d) => d.code.toUpperCase() === editCode.toUpperCase());
        if (exists) {
          toast.error("Department with this code already exists.");
          return;
        }

        const payload: Department = {
          code: editCode.toUpperCase(),
          name: editName,
          hod: editHod,
          block: editBlock,
          facultiesCount: 0,
          studentsCount: 0,
        };
        await api.post("/api/departments", payload);
        toast.success("Department registered successfully!");
      } else if (formMode === "edit" && selectedDept) {
        const payload: Department = {
          code: selectedDept.code,
          name: editName,
          hod: editHod,
          block: editBlock,
          facultiesCount: selectedDept.facultiesCount,
          studentsCount: selectedDept.studentsCount,
        };
        await api.put(`/api/departments/${selectedDept.id}`, payload);
        toast.success("Department details updated!");
      }
      fetchDepartments();
    } catch (err) {
      console.error("Failed to save department", err);
      toast.error("Failed to save department.");
    }

    // Reset Form
    setIsFormOpen(false);
    setSelectedDept(null);
    setEditCode("");
    setEditName("");
    setEditHod("");
    setEditBlock("");
  };

  const handleEdit = (dept: Department) => {
    setFormMode("edit");
    setSelectedDept(dept);
    setEditCode(dept.code);
    setEditName(dept.name);
    setEditHod(dept.hod);
    setEditBlock(dept.block);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/departments/${id}`);
      toast.success("Department archived successfully.");
      fetchDepartments();
    } catch (err) {
      console.error("Failed to delete department", err);
      toast.error("Failed to delete department.");
    }
  };

  return (
    <div className="space-y-6 font-sans text-left pb-12 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Departments</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Directory of administrative segments, room block structures, and designated HODs.
          </p>
        </div>

        <button
          onClick={() => {
            setFormMode("add");
            setSelectedDept(null);
            setEditCode("");
            setEditName("");
            setEditHod("");
            setEditBlock("");
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer active:scale-95 transition-all select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Filter and search actions */}
      <div className="flex justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by code, name, or HOD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        /* Grid listing */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDepts.map((dept) => (
            <div
              key={dept.id}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Header bar decorative */}
              <div className="absolute top-0 inset-x-0 h-1 bg-purple-600" />

              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600/10 text-purple-600 uppercase">
                      {dept.code}
                    </span>
                    <h3 className="text-lg font-bold mt-1.5 text-foreground leading-tight">
                      {dept.name}
                    </h3>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-1.5 rounded-lg border border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => dept.id && handleDelete(dept.id)}
                      className="p-1.5 rounded-lg border border-border hover:bg-red-500/10 text-muted-foreground hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-border/40 py-4 text-xs font-semibold text-muted-foreground select-none">
                  <div className="space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground">Students</span>
                    <span className="text-sm font-extrabold text-foreground">{dept.studentsCount} Enrolled</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground">Faculty</span>
                    <span className="text-sm font-extrabold text-foreground">{dept.facultiesCount} Appointed</span>
                  </div>
                </div>

                {/* Infrastructure */}
                <div className="space-y-2 text-xs">
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="text-muted-foreground">HOD:</span>
                    <span className="font-semibold text-foreground">{dept.hod}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-semibold text-foreground leading-normal">{dept.block}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6 relative overflow-hidden text-left animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b border-border/60 pb-3 mb-4 flex items-center gap-2 select-none">
              <Landmark className="w-5 h-5 text-purple-600" />
              <span>{formMode === "add" ? "Create New Department" : "Edit Department"}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Department Code</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  placeholder="e.g. CSE"
                  disabled={formMode === "edit"}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans disabled:opacity-50"
                  required
                />
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Department Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              {/* HOD */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Head of Department (HOD)</label>
                <input
                  type="text"
                  value={editHod}
                  onChange={(e) => setEditHod(e.target.value)}
                  placeholder="e.g. Prof. Saradha Krishnan"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              {/* Room block location */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Room Block Block Allocation</label>
                <input
                  type="text"
                  value={editBlock}
                  onChange={(e) => setEditBlock(e.target.value)}
                  placeholder="e.g. Main Block, LHC-200"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/50 select-none">
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
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
