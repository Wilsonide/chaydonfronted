"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { TaskStatus } from "@/components/tasks/types";

interface DesignerTaskFiltersProps {
  search: string;
  status: TaskStatus | "ALL";

  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | "ALL") => void;
  onReset: () => void;
}

const statuses: Array<{
  value: TaskStatus | "ALL";
  label: string;
}> = [
  {
    value: "ALL",
    label: "All statuses",
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

export default function DesignerTaskFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReset,
}: DesignerTaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search your tasks..."
          className="pl-9"
        />
      </div>

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as TaskStatus | "ALL")
        }
        className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {statuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <Button type="button" variant="outline" onClick={onReset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
