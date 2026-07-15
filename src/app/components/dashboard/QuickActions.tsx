import React from "react";
import { Link } from "react-router-dom";
import { Calendar, CreditCard, BookMarked, FileText } from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgHoverClass: string;
}

const ACTIONS: ActionItem[] = [
  {
    id: "act_1",
    title: "Weekly Timetable",
    description: "Check your current schedule and lecture rooms.",
    path: "/student/timetable",
    icon: Calendar,
    colorClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    bgHoverClass: "hover:border-indigo-500/30 hover:bg-indigo-500/5",
  },
  {
    id: "act_2",
    title: "Tuition Fees Dues",
    description: "Review billing statements and clear outstanding dues.",
    path: "/student/fees",
    icon: CreditCard,
    colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    bgHoverClass: "hover:border-emerald-500/30 hover:bg-emerald-500/5",
  },
  {
    id: "act_3",
    title: "Library Catalog",
    description: "Browse academic publications and reserve textbook issues.",
    path: "/student/library",
    icon: BookMarked,
    colorClass: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    bgHoverClass: "hover:border-blue-500/30 hover:bg-blue-500/5",
  },
  {
    id: "act_4",
    title: "Active Assignments",
    description: "Upload your submission files and check status reports.",
    path: "/student/assignments",
    icon: FileText,
    colorClass: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    bgHoverClass: "hover:border-purple-500/30 hover:bg-purple-500/5",
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm font-sans flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-bold tracking-tight mb-2">Academic Shortways</h3>
        <p className="text-xs text-muted-foreground mb-6">
          Access core services across the campus network.
        </p>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.path}
                className={`group flex items-start gap-4 p-4 rounded-xl border border-border bg-card transition-all duration-300 active:scale-[0.98] ${action.bgHoverClass}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${action.colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-sm block group-hover:text-primary transition-colors">
                    {action.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-snug block">
                    {action.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-border/40 text-center">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block select-none">
          Active Student Session
        </span>
      </div>
    </div>
  );
}
