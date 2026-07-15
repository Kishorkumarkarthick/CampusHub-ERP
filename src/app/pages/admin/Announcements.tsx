import React, { useState, useEffect } from "react";
import { Plus, Search, Megaphone, Trash2, Calendar, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface Notice {
  id: number;
  title: string;
  category: "Exams" | "Events" | "General";
  date: string;
  sender: string;
  content: string;
  priority: "High" | "Medium" | "Low";
}

export default function AdminAnnouncements() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Exams", "Events", "General"];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Add Announcement dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCat, setEditCat] = useState<"Exams" | "Events" | "General">("General");
  const [editPriority, setEditPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/announcements");
      setNotices(res.data);
    } catch (err) {
      console.error("Failed to load announcements", err);
      toast.error("Failed to load announcements bulletin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.sender.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || notice.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newNotice = {
        title: editTitle,
        category: editCat,
        sender: "Office of the Administrator",
        content: editContent,
        priority: editPriority,
      };

      await api.post("/api/announcements", newNotice);
      toast.success("Notification bulletin published successfully!");
      fetchNotices();

      // Reset Form
      setIsFormOpen(false);
      setEditTitle("");
      setEditContent("");
      setEditCat("General");
      setEditPriority("Medium");
    } catch (err) {
      console.error("Failed to publish notice", err);
      toast.error("Failed to publish notice.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/announcements/${id}`);
      toast.success("Notification archived.");
      fetchNotices();
    } catch (err) {
      console.error("Failed to delete notice", err);
      toast.error("Failed to archive notice.");
    }
  };

  return (
    <div className="space-y-6 font-sans text-left pb-12 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Announcements Board</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Broadcast emergency alerts, campus notifications, and calendar bulletins to all portals.
          </p>
        </div>

        <button
          onClick={() => {
            setEditTitle("");
            setEditContent("");
            setEditCat("General");
            setEditPriority("Medium");
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer active:scale-95 transition-all select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Filter and search actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search active notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans"
          />
        </div>

        <div className="flex gap-2 select-none overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-purple-600 text-white"
                    : "bg-secondary/40 border border-border/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        /* Bulletins lists */
        <div className="space-y-6">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden text-left"
              >
                {/* Priority Bar Accent */}
                <div
                  className={`absolute top-0 inset-x-0 h-1 ${
                    notice.priority === "High"
                      ? "bg-red-500"
                      : notice.priority === "Medium"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                />

                {/* Notice Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                        notice.priority === "High"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : notice.priority === "Medium"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {notice.priority} Priority
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Category: {notice.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {notice.date}
                    </span>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="p-1 rounded-lg border border-border hover:bg-red-500/10 text-muted-foreground hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-base text-foreground leading-snug">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {notice.content}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 pt-2 text-[10px] font-semibold text-purple-600 dark:text-purple-400 select-none">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Issued by: {notice.sender}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border p-8 rounded-2xl text-center text-sm text-muted-foreground">
              No notices match your filter parameters.
            </div>
          )}
        </div>
      )}

      {/* Publish Notice modal overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6 relative overflow-hidden text-left animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b border-border/60 pb-3 mb-4 flex items-center gap-2 select-none">
              <ShieldAlert className="w-5 h-5 text-purple-600" />
              <span>Compose Notification Notice</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Notice Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Campus Holiday Notice"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Bulletin Details</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Details of the announcement bulletin..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Category</label>
                  <select
                    value={editCat}
                    onChange={(e) => setEditCat(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground"
                  >
                    <option value="General">General</option>
                    <option value="Exams">Exams</option>
                    <option value="Events">Events</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/50 select-none">
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  Publish Notice
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
