import { Badge } from "@/components/ui/badge";

import { OrderStatus } from "./types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    className: string;
  }
> = {
  RECEIVED: {
    label: "Received",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },

  REVIEWING: {
    label: "Reviewing",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },

  READY_FOR_PRODUCTION: {
    label: "Ready for Production",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  },

  IN_PRODUCTION: {
    label: "In Production",
    className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  },

  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },

  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
