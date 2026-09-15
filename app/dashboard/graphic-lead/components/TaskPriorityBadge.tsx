"use client";

import type { TaskPriority } from "@/components/tasks/types";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig: Record<
  TaskPriority,
  {
    label: string;
    className: string;
  }
> = {
  LOW: {
    label: "Low",
    className: "bg-muted text-muted-foreground border-border",
  },

  MEDIUM: {
    label: "Medium",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
  },

  HIGH: {
    label: "High",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50",
  },

  URGENT: {
    label: "Urgent",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50",
  },
};

export default function TaskPriorityBadge({
  priority,
}: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
