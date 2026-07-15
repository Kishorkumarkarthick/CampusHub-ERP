import React, { useState, useEffect } from "react";
import { Plus, Search, BookOpen, User, Calendar, Layers, Trash2, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface Subject {
  id?: number;
  code: string;
  name: string;
  department: string;
  semester: string;
  credits: number;
  instructor: string;
}

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const departmentsList = [
    "All Departments",
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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedSub, setSelectedSub] = useState<Subject | null>(null);

  // Form input states
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState(departmentsList[1]);
  const [editSem, setEditSem] = useState("1st Semester");
  const [editCredits, setEditCredits] = useState(4);
  const [editInstructor, setEditInstructor] = useState("");

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error("Failed to load subjects", err);
      toast.error("Failed to load subjects from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.instructor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === "All Departments" || s.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formMode === "add") {
        const exists = subjects.find((s) => s.code.toUpperCase() === editCode.toUpperCase());
        if (exists) {
          toast.error("Subject with this code already exists.");
          return;
        }

        const payload: Subject = {
          code: editCode.toUpperCase(),
          name: editName,
          department: editDept,
          semester: editSem,
          credits: Number(editCredits),
          instructor: editInstructor,
        };
        await api.post("/api/subjects", payload);
        toast.success("Subject syllabus registered successfully!");
      } else if (formMode === "edit" && selectedSub) {
        const payload: Subject = {
          code: selectedSub.code,
          name: editName,
          department: editDept,
          semester: editSem,
          credits: Number(editCredits),
          instructor: editInstructor,
        };
        await api.put(`/api/subjects/${selectedSub.id}`, payload);
        toast.success("Subject details updated!");
      }
      fetchSubjects();
    } catch (err) {
      console.error("Failed to save subject", err);
      toast.error("Failed to save subject details.");
    }

    setIsFormOpen(false);
    setSelectedSub(null);
    resetForm();
  };

  const resetForm = () => {
    setEditCode("");
    setEditName("");
    setEditDept(departmentsList[1]);
    setEditSem("1st Semester");
    setEditCredits(4);
    setEditInstructor("");
  };

  const handleEdit = (sub: Subject) => {
    setFormMode("edit");
    setSelectedSub(sub);
    setEditCode(sub.code);
    setEditName(sub.name);
    setEditDept(sub.department);
    setEditSem(sub.semester);
    setEditCredits(sub.credits);
    setEditInstructor(sub.instructor);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/subjects/${id}`);
      toast.success("Subject archived successfully.");
      fetchSubjects();
    } catch (err) {
      console.error("Failed to delete subject", err);
      toast.error("Failed to delete subject.");
    }
  };

  return (
    <div className="space-y-6 font-sans text-left pb-12 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Subjects</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Register academic curricula courses, configure syllabus credits, and assign faculty.
          </p>
        </div>

        <button
          onClick={() => {
            setFormMode("add");
            setSelectedSub(null);
            resetForm();
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer active:scale-95 transition-all select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by code, title, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans"
        >
          {departmentsList.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        /* Table grid display */
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                  <th className="py-3.5 px-6">Subject Code</th>
                  <th className="py-3.5 px-6">Subject Name</th>
                  <th className="py-3.5 px-6">Department Stream</th>
                  <th className="py-3.5 px-6 text-center">Semester</th>
                  <th className="py-3.5 px-6 text-center">Credits</th>
                  <th className="py-3.5 px-6">Instructor</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-secondary/15 transition-colors text-xs">
                      <td className="py-4 px-6 font-bold text-purple-600 dark:text-purple-400">
                        {sub.code}
                      </td>
                      <td className="py-4 px-6 font-bold text-foreground">{sub.name}</td>
                      <td className="py-4 px-6 text-muted-foreground font-medium">{sub.department}</td>
                      <td className="py-4 px-6 text-center font-semibold text-muted-foreground">
                        {sub.semester}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-purple-600/10 text-purple-600">
                          {sub.credits} Credits
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-foreground">{sub.instructor || "Not assigned"}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleEdit(sub)}
                            className="p-1.5 rounded-lg border border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => sub.id && handleDelete(sub.id)}
                            className="p-1.5 rounded-lg border border-border hover:bg-red-500/10 text-muted-foreground hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 px-6 text-center text-sm text-muted-foreground">
                      No curriculum subjects match your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Dialog Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6 relative overflow-hidden text-left animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b border-border/60 pb-3 mb-4 flex items-center gap-2 select-none">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>{formMode === "add" ? "Register Subject" : "Edit Subject"}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Subject Code</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  placeholder="e.g. CS301"
                  disabled={formMode === "edit"}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans disabled:opacity-50"
                  required
                />
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Subject Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Department Selection */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Department Stream</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground"
                  >
                    {departmentsList.slice(1).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Semester Cycle</label>
                  <select
                    value={editSem}
                    onChange={(e) => setEditSem(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground"
                  >
                    {["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester"].map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Credits */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Credits Points</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={editCredits}
                    onChange={(e) => setEditCredits(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans font-bold text-center"
                    required
                  />
                </div>

                {/* Instructor */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Faculty Assignment</label>
                  <input
                    type="text"
                    value={editInstructor}
                    onChange={(e) => setEditInstructor(e.target.value)}
                    placeholder="e.g. Prof. Saradha Krishnan"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
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
