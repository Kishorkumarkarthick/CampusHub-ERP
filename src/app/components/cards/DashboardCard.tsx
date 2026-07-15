import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subValue?: string;
  trend?: {
    value: string;
    type: "up" | "down" | "neutral";
  };
  badge?: {
    text: string;
    colorClass: string;
  };
  onClick?: () => void;
  className?: string;
  colorAccent?: "indigo" | "purple" | "emerald" | "blue" | "rose" | "amber";
}

export default function DashboardCard({
  title,
  value,
  icon: IconComponent,
  subValue,
  trend,
  badge,
  onClick,
  className,
  colorAccent = "indigo",
}: DashboardCardProps) {
  const accentClasses = {
    indigo: "text-indigo-600 bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/10",
    purple: "text-purple-600 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-500/10",
    emerald: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10",
    blue: "text-blue-600 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-500/10",
    rose: "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/10",
    amber: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/10",
  };

  const trendClasses = {
    up: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    down: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
    neutral: "text-muted-foreground bg-muted",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all duration-300 select-none",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/40 active:scale-[0.99]",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            {title}
          </span>
          <span className="text-3xl font-extrabold tracking-tight block">
            {value}
          </span>
        </div>

        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", accentClasses[colorAccent])}>
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      {(subValue || trend || badge) && (
        <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center gap-2 text-xs">
          {trend && (
            <span className={cn("px-2 py-0.5 rounded-full font-bold flex items-center gap-1", trendClasses[trend.type])}>
              {trend.value}
            </span>
          )}

          {badge && (
            <span className={cn("px-2 py-0.5 rounded-full font-bold", badge.colorClass)}>
              {badge.text}
            </span>
          )}

          {subValue && (
            <span className="text-muted-foreground font-medium">
              {subValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
