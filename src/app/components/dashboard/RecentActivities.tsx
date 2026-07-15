import React from "react";
import { Award, CheckCircle2, CreditCard, BookOpen, Clock } from "lucide-react";
import { cn } from "../ui/utils";

interface Activity {
  id: string;
  category: "Academics" | "Submission" | "Finance" | "Library";
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

const ACTIVITIES: Activity[] = [
  {
    id: "act_01",
    category: "Academics",
    title: "Midterm Grades Published",
    description: "Your results for Advanced DBMS midterm tests have been published. GPA: 9.5",
    time: "Today, 2:45 PM",
    icon: Award,
    colorClass: "text-indigo-600 bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/10",
  },
  {
    id: "act_02",
    category: "Submission",
    title: "Homework Submitted",
    description: "Assignment 3 - Software Architecture Designs uploaded successfully.",
    time: "Today, 9:15 AM",
    icon: CheckCircle2,
    colorClass: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10",
  },
  {
    id: "act_03",
    category: "Finance",
    title: "Tuition Fee Paid",
    description: "Online invoice transaction clear for Semester 5 tuition dues. Amt: $1,250",
    time: "Yesterday, 4:30 PM",
    icon: CreditCard,
    colorClass: "text-blue-600 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-500/10",
  },
  {
    id: "act_04",
    category: "Library",
    title: "Book Issued",
    description: "'Introduction to Algorithms, 4th Edition' checked out from Main Stack.",
    time: "3 days ago",
    icon: BookOpen,
    colorClass: "text-purple-600 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/10",
  },
];

export default function RecentActivities() {
  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm flex flex-col justify-between h-full font-sans">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold tracking-tight">Recent Activity Log</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-md">
            Live Feed
          </span>
        </div>

        <div className="relative border-l border-border/80 ml-3.5 pl-6 space-y-6">
          {ACTIVITIES.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="relative group">
                {/* Timeline Connector Dot */}
                <div
                  className={cn(
                    "absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border border-card flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110",
                    activity.colorClass
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                    <span className="font-semibold text-sm leading-none group-hover:text-primary transition-colors">
                      {activity.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium select-none">
                      <Clock className="w-3 h-3 shrink-0" />
                      {activity.time}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activity.description}
                  </p>

                  <div className="inline-flex py-0.5 px-2 rounded-md bg-secondary text-secondary-foreground text-[9px] font-bold uppercase tracking-wider select-none">
                    {activity.category}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-border/40 text-center">
        <button className="text-xs font-bold text-primary hover:underline cursor-pointer">
          View All System History
        </button>
      </div>
    </div>
  );
}
