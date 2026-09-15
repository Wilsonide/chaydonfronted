"use client";

import { FormEvent, useState } from "react";

import { CalendarDays, Loader2 } from "lucide-react";

import { toast } from "sonner";

import orderService from "@/app/services/order.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Order, OrderStatus } from "./types";

interface OrderEditFormProps {
  order: Order;
  onSuccess: () => void;
  onCancel: () => void;
}

const statuses: {
  value: OrderStatus;
  label: string;
}[] = [
  {
    value: "RECEIVED",
    label: "Received",
  },
  {
    value: "REVIEWING",
    label: "Reviewing",
  },
  {
    value: "READY_FOR_PRODUCTION",
    label: "Ready for Production",
  },
  {
    value: "IN_PRODUCTION",
    label: "In Production",
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

export function OrderEditForm({
  order,
  onSuccess,
  onCancel,
}: OrderEditFormProps) {
  const [title, setTitle] = useState(order.title);

  const [description, setDescription] = useState(order.description ?? "");

  const [amount, setAmount] = useState(String(order.total_amount));
  const [dueDate, setDueDate] = useState(order.due_date ?? "");

  const [status, setStatus] = useState<OrderStatus>(order.status);

  const [updating, setUpdating] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Order title is required");

      return;
    }

    const numericAmount = Number(amount || 0);

    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      toast.error("Please enter a valid amount");

      return;
    }

    try {
      setUpdating(true);

      await orderService.updateOrder(order.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        total_amount: numericAmount,
        status,
        due_date: dueDate || undefined,
      });

      toast.success("Order updated successfully");

      onSuccess();
    } catch {
      toast.error("Unable to update order");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Customer</p>

        <p className="mt-1 font-medium">{order.customer.name}</p>

        <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="edit-order-title">Order Title</Label>

          <Input
            id="edit-order-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Wedding Invitation Cards"
            disabled={updating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-order-description">Requirements</Label>

          <Textarea
            id="edit-order-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what the customer needs..."
            rows={5}
            disabled={updating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-order-amount">Total Amount</Label>

          <Input
            id="edit-order-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            disabled={updating}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-order-due-date">Due Date</Label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="edit-order-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="pl-10"
              disabled={updating}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            The date the customer expects the order to be ready.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Order Status</Label>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as OrderStatus)}
            disabled={updating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              {statuses.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updating}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={updating}>
          {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {updating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
