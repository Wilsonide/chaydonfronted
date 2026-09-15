import {
  CheckCircle2,
  Circle,
  Clock3,
  FileCheck2,
  Loader2,
  OctagonAlert,
  Palette,
  Printer,
  Search,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { ProductionStatus } from "./types";

interface ProductionStatusBadgeProps {
  status: ProductionStatus;
}

const statusConfig: Record<
  ProductionStatus,
  {
    label: string;
    icon: typeof Circle;
    className: string;
  }
> = {
  CREATED: {
    label: "Created",
    icon: Circle,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },

  WAITING_FOR_REQUIREMENTS: {
    label: "Waiting for Requirements",
    icon: Clock3,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },

  READY_FOR_DESIGN: {
    label: "Ready for Design",
    icon: Search,
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },

  IN_DESIGN: {
    label: "In Design",
    icon: Palette,
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },

  DESIGN_REVIEW: {
    label: "Design Review",
    icon: FileCheck2,
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },

  APPROVED_FOR_PRINT: {
    label: "Approved for Print",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  PRINTING: {
    label: "Printing",
    icon: Printer,
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },

  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "border-green-200 bg-green-50 text-green-700",
  },

  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

export default function ProductionStatusBadge({
  status,
}: ProductionStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    icon: OctagonAlert,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

export function getProductionStatusLabel(status: ProductionStatus) {
  return statusConfig[status]?.label ?? status;
}
