"use client";

import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  CircleDot,
  RotateCcw,
  UserRoundPlus,
} from "lucide-react";

import type { TaskStatus } from "@/components/tasks/types";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

const statusConfig: Record<
  TaskStatus,
  {
    label: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  UNASSIGNED: {
    label: "Unassigned",
    className: "bg-muted text-muted-foreground border-border",
    icon: UserRoundPlus,
  },

  ASSIGNED: {
    label: "Assigned",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
    icon: CircleDot,
  },

  IN_PROGRESS: {
    label: "In progress",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50",
    icon: Clock3,
  },

  SUBMITTED: {
    label: "Submitted",
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/50",
    icon: FileCheck2,
  },

  REVISION_REQUIRED: {
    label: "Revision required",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
    icon: RotateCcw,
  },

  APPROVED: {
    label: "Approved",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
    icon: CheckCircle2,
  },
};

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  );
}
