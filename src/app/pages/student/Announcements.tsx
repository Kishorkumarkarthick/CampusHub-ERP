import React, { useState, useEffect } from "react";
import { Search, Calendar, Megaphone, Loader2 } from "lucide-react";
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

export default function StudentAnnouncements() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Exams", "Events", "General"];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left font-sans pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Announcements Board</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Stay updated with important university bulletins, exam schedules, and student event notifications.
        </p>
      </div>

      {/* Filter Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-sans"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto select-none py-1 sm:py-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
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
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        /* Bulletins List */
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
                      className={`inline-flex px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider select-none ${
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
                <div className="flex items-center gap-2 pt-2 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 select-none">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Issued by: {notice.sender}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border border-border p-8 rounded-2xl text-center text-sm text-muted-foreground font-semibold">
              No notices match your filter parameters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
