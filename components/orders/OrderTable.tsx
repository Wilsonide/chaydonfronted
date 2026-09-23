"use client";

import {
  CalendarClock,
  Eye,
  FilePenLine,
  Pencil,
  Printer,
  Trash2,
} from "lucide-react";

import { Order } from "./types";
import { OrderStatusBadge } from "./OrderStatusBadge";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

export function OrderTable({
  orders,
  onView,
  onEdit,
  onDelete,
}: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border py-12 text-center">
        <p className="font-medium">No orders found</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Orders will appear here once they are created.
        </p>
      </div>
    );
  }

  const getDueState = (dueDate?: string | null) => {
    if (!dueDate) {
      return {
        label: "No deadline",
        className: "text-muted-foreground",
        overdue: false,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diff = Math.round(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diff < 0) {
      return {
        label: `${Math.abs(diff)} day${Math.abs(diff) > 1 ? "s" : ""} overdue`,
        className: "text-red-600 font-semibold",
        overdue: true,
      };
    }

    if (diff === 0) {
      return {
        label: "Due today",
        className: "text-orange-600 font-semibold",
        overdue: false,
      };
    }

    return {
      label: `Due in ${diff} day${diff > 1 ? "s" : ""}`,
      className: "text-green-600",
      overdue: false,
    };
  };

  const getOrderType = (order: Order) => {
    if (order.order_type === "PRINT") {
      return {
        label: "Print",
        description: "Print order",
        icon: Printer,
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }

    return {
      label: "Design",
      description: "Design order",
      icon: FilePenLine,
      className: "bg-purple-50 text-purple-700 border-purple-200",
    };
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>

            <TableHead>Type</TableHead>

            <TableHead>Customer</TableHead>

            <TableHead>Amount</TableHead>

            <TableHead>Status</TableHead>

            <TableHead>Due Date</TableHead>

            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.map((order) => {
            const due = getDueState(order.due_date);
            const orderType = getOrderType(order);
            const TypeIcon = orderType.icon;

            return (
              <TableRow
                key={order.id}
                className={due.overdue ? "bg-red-50/40" : ""}
              >
                {/* Order */}
                <TableCell>
                  <div>
                    <p className="font-medium">{order.title}</p>

                    <p className="text-xs text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                </TableCell>

                {/* Order type */}
                <TableCell>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${orderType.className}`}
                    title={orderType.description}
                  >
                    <TypeIcon className="h-3.5 w-3.5" />

                    <span>{orderType.label}</span>
                  </div>
                </TableCell>

                {/* Customer */}
                <TableCell>
                  <div>
                    <p className="font-medium">{order.customer.name}</p>

                    <p className="text-xs text-muted-foreground">
                      {order.customer.phone}
                    </p>
                  </div>
                </TableCell>

                {/* Amount */}
                <TableCell>
                  ₦
                  {Number(order.total_amount).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>

                {/* Due date */}
                <TableCell>
                  <div className="flex items-start gap-2">
                    <CalendarClock
                      className={`mt-0.5 h-4 w-4 ${due.className}`}
                    />

                    <div>
                      <p className={due.className}>
                        {order.due_date
                          ? new Date(order.due_date).toLocaleDateString("en-NG")
                          : "—"}
                      </p>

                      <p className={`text-xs ${due.className}`}>{due.label}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(order)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(order)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
