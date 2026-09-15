"use client";

import { Eye, Pencil, Trash2, CalendarClock } from "lucide-react";

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

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
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

            return (
              <TableRow
                key={order.id}
                className={due.overdue ? "bg-red-50/40" : ""}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{order.title}</p>
                    <p className="text-xs text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer.phone}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  ₦
                  {Number(order.total_amount).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>

                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>

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
