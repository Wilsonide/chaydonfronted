"use client";

import { Filter, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { TaskPriority, TaskStatus } from "@/components/tasks/types";

interface TaskFiltersProps {
  search: string;
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | "ALL") => void;
  onPriorityChange: (value: TaskPriority | "ALL") => void;
  onReset: () => void;
}

const statuses: {
  value: TaskStatus | "ALL";
  label: string;
}[] = [
  {
    value: "ALL",
    label: "All statuses",
  },
  {
    value: "UNASSIGNED",
    label: "Unassigned",
  },
  {
    value: "ASSIGNED",
    label: "Assigned",
  },
  {
    value: "IN_PROGRESS",
    label: "In progress",
  },
  {
    value: "SUBMITTED",
    label: "Submitted",
  },
  {
    value: "REVISION_REQUIRED",
    label: "Revision required",
  },
  {
    value: "APPROVED",
    label: "Approved",
  },
];

const priorities: {
  value: TaskPriority | "ALL";
  label: string;
}[] = [
  {
    value: "ALL",
    label: "All priorities",
  },
  {
    value: "LOW",
    label: "Low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "HIGH",
    label: "High",
  },
  {
    value: "URGENT",
    label: "Urgent",
  },
];

export default function TaskFilters({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onReset,
}: TaskFiltersProps) {
  const hasFilters =
    search.trim().length > 0 || status !== "ALL" || priority !== "ALL";

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <select
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as TaskStatus | "ALL")
              }
              className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-[190px]"
            >
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={priority}
            onChange={(event) =>
              onPriorityChange(event.target.value as TaskPriority | "ALL")
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-[160px]"
          >
            {priorities.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
