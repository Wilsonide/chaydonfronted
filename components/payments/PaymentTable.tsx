"use client";

import {
  Eye,
  CreditCard,
  Banknote,
  Smartphone,
  MoreHorizontal,
} from "lucide-react";

import { Payment } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentTableProps {
  payments: Payment[];
  onView: (payment: Payment) => void;
}

const methodLabels: Record<Payment["method"], string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  POS: "POS",
  OTHER: "Other",
};

function getMethodIcon(method: Payment["method"]) {
  switch (method) {
    case "CASH":
      return Banknote;
    case "BANK_TRANSFER":
      return CreditCard;
    case "POS":
      return Smartphone;
    default:
      return MoreHorizontal;
  }
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function PaymentTable({ payments, onView }: PaymentTableProps) {
  if (!payments.length) {
    return (
      <Card>
        <CardContent className="flex min-h-[240px] items-center justify-center">
          No payments found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => {
                const Icon = getMethodIcon(payment.method);

                return (
                  <tr key={payment.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-4">
                      <p className="font-medium">{payment.id.slice(0, 8)}</p>
                    </td>

                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">{payment.order.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.order_id.slice(0, 8)}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">{payment.order.customer.name}</td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {methodLabels[payment.method]}
                      </div>
                    </td>

                    <td className="px-4 py-4">{payment.reference || "—"}</td>

                    <td className="px-4 py-4">
                      {formatDate(payment.created_at)}
                    </td>

                    <td className="px-4 py-4 text-right font-semibold">
                      {formatAmount(payment.amount)}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(payment)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
