import { Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ProductionStatus } from "./types";

interface ProductionToolbarProps {
  search: string;
  statusFilter: ProductionStatus | "ALL";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ProductionStatus | "ALL") => void;
  onCreate: () => void;
}

const statuses: {
  value: ProductionStatus;
  label: string;
}[] = [
  {
    value: "CREATED",
    label: "Created",
  },
  {
    value: "WAITING_FOR_REQUIREMENTS",
    label: "Waiting for Requirements",
  },
  {
    value: "READY_FOR_DESIGN",
    label: "Ready for Design",
  },
  {
    value: "IN_DESIGN",
    label: "In Design",
  },
  {
    value: "DESIGN_REVIEW",
    label: "Design Review",
  },
  {
    value: "APPROVED_FOR_PRINT",
    label: "Approved for Print",
  },
  {
    value: "PRINTING",
    label: "Printing",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

export default function ProductionToolbar({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onCreate,
}: ProductionToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-background p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search folder number or title..."
            className="pl-9 pr-9"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            onStatusChange(value as ProductionStatus | "ALL")
          }
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>

            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Production
      </Button>
    </div>
  );
}
