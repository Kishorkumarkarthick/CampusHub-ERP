import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Layers, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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

export default function FacultyTimetable() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignedSlots, setAssignedSlots] = useState<Slot[]>([]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "09:00 AM - 10:30 AM",
    "11:00 AM - 12:30 PM",
    "01:00 PM - 02:00 PM", // Lunch break
    "02:00 PM - 03:30 PM",
    "03:45 PM - 05:15 PM",
  ];

  const fetchTimetable = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/timetable?instructor=${user.email}`);
      setAssignedSlots(res.data);
    } catch (err) {
      console.error("Failed to load timetable", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [user?.email]);

  const findSlot = (day: string, time: string) => {
    return assignedSlots.find((s) => s.dayOfWeek === day && s.timeSlot === time);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Weekly Timetable</h1>
        <p className="text-sm text-muted-foreground">
          Track scheduled lectures, labs, and office hours across the current academic term.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
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
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
                          <div className="p-3.5 rounded-xl border border-emerald-600/20 bg-emerald-600/5 text-foreground space-y-2 h-full flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                {slot.subjectCode}
                              </p>
                              <h4 className="text-xs font-bold leading-tight mt-0.5 text-foreground font-sans">
                                {slot.subjectName}
                              </h4>
                            </div>
                            <div className="space-y-1 pt-2 border-t border-emerald-600/10 text-[10px] text-muted-foreground font-semibold">
                              <p className="flex items-center gap-1">
                                <Layers className="w-3 h-3 text-emerald-600/80" />
                                <span>{slot.semester}</span>
                              </p>
                              <p className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-600/80" />
                                <span>{slot.room}</span>
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
    </div>
  );
}
