import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, Clock, MapPin, Layers, User, Trash2, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface Slot {
  id?: number;
  dayOfWeek: string;
  timeSlot: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  instructor: string;
  department: string;
  semester: string;
}

export default function AdminTimetable() {
  const [loading, setLoading] = useState(true);
  const [assignedSlots, setAssignedSlots] = useState<Slot[]>([]);
  const [selectedDept, setSelectedDept] = useState("Computer Science & Engineering");

  const departmentsList = [
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

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "09:00 AM - 10:30 AM",
    "11:00 AM - 12:30 PM",
    "01:00 PM - 02:00 PM", // Lunch break
    "02:00 PM - 03:30 PM",
    "03:45 PM - 05:15 PM",
  ];

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [editDay, setEditDay] = useState("Monday");
  const [editTime, setEditTime] = useState("09:00 AM - 10:30 AM");
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editRoom, setEditRoom] = useState("");
  const [editInstructor, setEditInstructor] = useState("");
  const [editSem, setEditSem] = useState("3rd Semester");

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/timetable?department=${selectedDept}`);
      setAssignedSlots(res.data);
    } catch (err) {
      console.error("Failed to load timetable", err);
      toast.error("Failed to load timetable slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedDept]);

  const findSlot = (day: string, time: string) => {
    return assignedSlots.find((s) => s.dayOfWeek === day && s.timeSlot === time);
  };

  const handleEdit = (slot: Slot) => {
    setFormMode("edit");
    setSelectedSlot(slot);
    setEditDay(slot.dayOfWeek);
    setEditTime(slot.timeSlot);
    setEditCode(slot.subjectCode);
    setEditName(slot.subjectName);
    setEditRoom(slot.room);
    setEditInstructor(slot.instructor);
    setEditSem(slot.semester);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/timetable/${id}`);
      toast.success("Schedule slot removed successfully.");
      fetchTimetable();
    } catch (err) {
      console.error("Failed to delete slot", err);
      toast.error("Failed to delete schedule slot.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTime === "01:00 PM - 02:00 PM") {
      toast.error("Cannot assign slots during lunch break hour.");
      return;
    }

    try {
      if (formMode === "add") {
        // Check local conflict
        const conflict = assignedSlots.find((s) => s.dayOfWeek === editDay && s.timeSlot === editTime);
        if (conflict) {
          toast.error("Conflict: This day and time slot is already allocated.");
          return;
        }

        const payload: Slot = {
          dayOfWeek: editDay,
          timeSlot: editTime,
          subjectCode: editCode,
          subjectName: editName,
          room: editRoom,
          instructor: editInstructor,
          department: selectedDept,
          semester: editSem,
        };
        await api.post("/api/timetable", payload);
        toast.success("Lecture slot scheduled successfully!");
      } else if (formMode === "edit" && selectedSlot) {
        const payload: Slot = {
          dayOfWeek: editDay,
          timeSlot: editTime,
          subjectCode: editCode,
          subjectName: editName,
          room: editRoom,
          instructor: editInstructor,
          department: selectedDept,
          semester: editSem,
        };
        await api.put(`/api/timetable/${selectedSlot.id}`, payload);
        toast.success("Schedule slot updated successfully!");
      }
      fetchTimetable();
    } catch (err) {
      console.error("Failed to save schedule slot", err);
      toast.error("Failed to save schedule slot.");
    }

    setIsFormOpen(false);
    setSelectedSlot(null);
    resetForm();
  };

  const resetForm = () => {
    setEditDay("Monday");
    setEditTime("09:00 AM - 10:30 AM");
    setEditCode("");
    setEditName("");
    setEditRoom("");
    setEditInstructor("");
    setEditSem("3rd Semester");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Time Schedules</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Configure student and faculty schedules and assign classrooms.
          </p>
        </div>

        <button
          onClick={() => {
            setFormMode("add");
            setSelectedSlot(null);
            resetForm();
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer active:scale-95 transition-all select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Schedule Slot</span>
        </button>
      </div>

      {/* Filter and select dept */}
      <div className="flex justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground"
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
        /* Grid Layout Container */
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Table Headings */}
          <div className="hidden lg:grid lg:grid-cols-6 bg-secondary/50 border-b border-border text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-4 select-none">
            <div>Time Slot / Hour</div>
            {days.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="divide-y divide-border/60">
            {timeSlots.map((time) => {
              const isLunch = time === "01:00 PM - 02:00 PM";
              return (
                <div
                  key={time}
                  className={`grid grid-cols-1 lg:grid-cols-6 items-stretch ${
                    isLunch ? "bg-secondary/10 dark:bg-secondary/5 text-muted-foreground" : ""
                  }`}
                >
                  {/* Time Indicator Cell */}
                  <div className="py-4 px-6 border-b lg:border-b-0 lg:border-r border-border/60 flex items-center justify-center gap-2 shrink-0 select-none bg-secondary/20 lg:bg-transparent">
                    <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="text-xs font-bold whitespace-nowrap">{time}</span>
                  </div>

                  {/* Day Columns */}
                  {days.map((day) => {
                    const slot = findSlot(day, time);
                    return (
                      <div
                        key={`${day}-${time}`}
                        className="py-4 px-6 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col justify-center min-h-[110px]"
                      >
                        {/* Mobile Day Indicator */}
                        <span className="lg:hidden text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 select-none">
                          {day}
                        </span>

                        {isLunch ? (
                          <div className="text-center font-semibold text-xs py-2 uppercase tracking-widest text-muted-foreground/60 select-none">
                            Lunch Break
                          </div>
                        ) : slot ? (
                          <div className="p-3.5 rounded-xl border border-purple-600/20 bg-purple-600/5 text-foreground space-y-2 h-full flex flex-col justify-between group relative">
                            {/* Hover Actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 select-none transition-opacity bg-background p-1 rounded-lg border border-border/60 shadow-sm">
                              <button
                                onClick={() => handleEdit(slot)}
                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/40 cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => slot.id && handleDelete(slot.id)}
                                className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                {slot.subjectCode} ({slot.semester})
                              </p>
                              <h4 className="text-xs font-bold leading-tight mt-0.5 text-foreground font-sans">
                                {slot.subjectName}
                              </h4>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-purple-600/10 text-[10px] text-muted-foreground font-semibold">
                              <p className="flex items-center gap-1">
                                <User className="w-3 h-3 text-purple-600/80" />
                                <span className="truncate">{slot.instructor}</span>
                              </p>
                              <p className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-purple-600/80" />
                                <span>Room: {slot.room}</span>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-[10px] text-muted-foreground/40 font-semibold py-4 uppercase tracking-widest select-none">
                            Free Slot
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Dialog Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6 relative overflow-hidden text-left animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b border-border/60 pb-3 mb-4 flex items-center gap-2 select-none">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>{formMode === "add" ? "Schedule Lecture Slot" : "Modify Lecture Slot"}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                {/* Day Selection */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Day of Week</label>
                  <select
                    value={editDay}
                    onChange={(e) => setEditDay(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Selection */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Time Slot</label>
                  <select
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground"
                  >
                    {timeSlots.filter((t) => t !== "01:00 PM - 02:00 PM").map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Subject Code */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Subject Code</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="e.g. CS301"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans font-bold"
                    required
                  />
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

              {/* Subject Name */}
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
                {/* Room */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Classroom Room</label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    placeholder="e.g. LHC-201"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                    required
                  />
                </div>

                {/* Instructor */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Instructor Email</label>
                  <input
                    type="email"
                    value={editInstructor}
                    onChange={(e) => setEditInstructor(e.target.value)}
                    placeholder="e.g. faculty@college.edu"
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
