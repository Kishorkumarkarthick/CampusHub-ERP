import React from "react";
import DashboardCard from "../cards/DashboardCard";
import { Calendar, Award, BookOpen, BookMarked } from "lucide-react";

interface StatisticsProps {
  attendanceRate?: string;
  cumulativeGpa?: string;
  activeCourses?: number;
  libraryBooksCount?: number;
  libraryOverdueText?: string;
}

export default function Statistics({
  attendanceRate = "92.4%",
  cumulativeGpa = "9.15",
  activeCourses = 6,
  libraryBooksCount = 3,
  libraryOverdueText = "1 Overdue",
}: StatisticsProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Attendance Metrics */}
      <DashboardCard
        title="Attendance Rate"
        value={attendanceRate}
        icon={Calendar}
        colorAccent="emerald"
        trend={{ value: "+1.2%", type: "up" }}
        subValue="vs last month"
      />

      {/* GPA Metrics */}
      <DashboardCard
        title="Cumulative GPA"
        value={cumulativeGpa}
        icon={Award}
        colorAccent="indigo"
        trend={{ value: "Top 5%", type: "up" }}
        subValue="Class rank: 4th"
      />

      {/* Courses Metrics */}
      <DashboardCard
        title="Active Courses"
        value={String(activeCourses)}
        icon={BookOpen}
        colorAccent="blue"
        subValue="Fall 2026 term"
      />

      {/* Library Metrics */}
      <DashboardCard
        title="Library Books"
        value={String(libraryBooksCount)}
        icon={BookMarked}
        colorAccent="purple"
        badge={{
          text: libraryOverdueText,
          colorClass:
            libraryOverdueText === "0 Overdue"
              ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10 font-bold"
              : "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/10 font-bold",
        }}
        subValue="Return by Friday"
      />
    </div>
  );
}
