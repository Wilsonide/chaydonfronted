"use client";

import { RefreshCw, Search } from "lucide-react";

import { TaskPriority, TaskStatus } from "./types";

interface TaskFiltersProps {
  search: string;
  status: string;
  priority: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onRefresh: () => void;
}

const STATUS_OPTIONS: TaskStatus[] = [
  "ASSIGNED",
  "IN_PROGRESS",
  "SUBMITTED",
  "REVISION_REQUIRED",
  "APPROVED",
];

const PRIORITY_OPTIONS: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function TaskFilters({
  search,
  status,
  priority,
  loading,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onRefresh,
}: TaskFiltersProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks..."
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        >
          <option value="">All statuses</option>

          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {formatLabel(item)}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(event) => onPriorityChange(event.target.value)}
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
        >
          <option value="">All priorities</option>

          {PRIORITY_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {formatLabel(item)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}
