"use client";

import { CalendarDays, FileText, Hash, Phone, User } from "lucide-react";

import { Invoice } from "./types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatStatus(status: Invoice["status"]) {
  switch (status) {
    case "PAID":
      return "Paid";

    case "PARTIALLY_PAID":
      return "Partially Paid";

    case "UNPAID":
      return "Unpaid";

    case "VOID":
      return "Void";

    default:
      return status;
  }
}

export function InvoiceDetailsModal({
  invoice,
  open,
  onOpenChange,
}: InvoiceDetailsModalProps) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-5">
            <p className="text-sm text-muted-foreground">Invoice Total</p>

            <p className="mt-1 text-3xl font-bold">
              {formatAmount(invoice.total_amount)}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              {formatStatus(invoice.status)}
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Hash className="mt-0.5 h-4 w-4 text-muted-foreground" />

              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Invoice ID</p>

                <p className="break-all font-medium">{invoice.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />

              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">Order</p>

                <p className="font-medium">{invoice.order.title}</p>

                <p className="text-xs text-muted-foreground">
                  Order ID: {invoice.order.id}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-muted-foreground" />

              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">Customer</p>

                <p className="font-medium">{invoice.order.customer.name}</p>

                {invoice.order.customer.email && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.order.customer.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />

              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Phone</p>

                <p className="font-medium">{invoice.order.customer.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />

              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">Status</p>

                <p className="font-medium">{formatStatus(invoice.status)}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>

              <span className="font-medium">
                {formatAmount(invoice.subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>

              <span className="font-medium">
                {formatAmount(invoice.discount)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>

              <span className="font-medium">{formatAmount(invoice.tax)}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total</span>

              <span className="font-bold">
                {formatAmount(invoice.total_amount)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>

              <span className="font-medium">
                {formatAmount(invoice.amount_paid)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance Due</span>

              <span className="font-semibold">
                {formatAmount(invoice.balance_due)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
