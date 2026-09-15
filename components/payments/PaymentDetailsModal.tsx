"use client";

import {
  Banknote,
  CalendarDays,
  CreditCard,
  FileText,
  Hash,
  MessageSquare,
  Smartphone,
  User,
  Phone,
  Mail,
} from "lucide-react";

import { Payment } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface Props {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const labels = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  POS: "POS",
  OTHER: "Other",
};

function Icon({ method }: { method: Payment["method"] }) {
  switch (method) {
    case "CASH":
      return <Banknote className="h-4 w-4" />;
    case "BANK_TRANSFER":
      return <CreditCard className="h-4 w-4" />;
    case "POS":
      return <Smartphone className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
}

function money(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(value);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PaymentDetailsModal({ payment, open, onOpenChange }: Props) {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-5">
            <p className="text-sm text-muted-foreground">Payment Amount</p>
            <p className="mt-1 text-3xl font-bold">{money(payment.amount)}</p>

            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Icon method={payment.method} />
              {labels[payment.method]}
            </div>
          </div>

          <div className="space-y-4">
            <Info icon={<Hash className="h-4 w-4" />} label="Payment ID">
              {payment.id}
            </Info>

            <Info icon={<FileText className="h-4 w-4" />} label="Order Title">
              {payment.order.title}
            </Info>

            <Info icon={<Hash className="h-4 w-4" />} label="Order ID">
              {payment.order_id}
            </Info>

            <Separator />

            <Info icon={<User className="h-4 w-4" />} label="Customer">
              {payment.order.customer.name}
            </Info>

            <Info icon={<Phone className="h-4 w-4" />} label="Phone">
              {payment.order.customer.phone}
            </Info>

            {payment.order.customer.email && (
              <Info icon={<Mail className="h-4 w-4" />} label="Email">
                {payment.order.customer.email}
              </Info>
            )}

            <Separator />

            <Info icon={<CreditCard className="h-4 w-4" />} label="Method">
              {labels[payment.method]}
            </Info>

            <Info icon={<Hash className="h-4 w-4" />} label="Reference">
              {payment.reference || "—"}
            </Info>

            <Info icon={<User className="h-4 w-4" />} label="Recorded By">
              {payment.recorder.first_name} {payment.recorder.last_name}
            </Info>

            <Info icon={<CalendarDays className="h-4 w-4" />} label="Date">
              {date(payment.created_at)}
            </Info>
          </div>

          <Separator />

          <Info icon={<MessageSquare className="h-4 w-4" />} label="Notes">
            {payment.notes || "No notes"}
          </Info>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="break-all font-medium">{children}</p>
      </div>
    </div>
  );
}
