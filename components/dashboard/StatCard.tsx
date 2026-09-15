"use client";

import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  tone?: "default" | "warning" | "success";
}

export default function StatCard({
  title,
  value,
  description,
  icon,
  tone = "default",
}: StatCardProps) {
  const iconStyles = {
    default: "bg-muted text-muted-foreground",
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    success:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  };

  return (
    <div className="group rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        {icon && (
          <div
            className={`shrink-0 rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105 ${iconStyles[tone]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
