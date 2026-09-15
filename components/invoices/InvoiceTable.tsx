"use client";

import { Download, Eye, FileText } from "lucide-react";

import { Invoice } from "./types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InvoiceTableProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
}

const statusLabels: Record<Invoice["status"], string> = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  VOID: "Void",
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function getStatusClass(status: Invoice["status"]) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";

    case "PARTIALLY_PAID":
      return "bg-yellow-100 text-yellow-700";

    case "VOID":
      return "bg-red-100 text-red-700";

    default:
      return "bg-muted text-muted-foreground";
  }
}

export function InvoiceTable({
  invoices,
  onView,
  onDownload,
}: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[240px] items-center justify-center p-6">
          <div className="text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">No invoices found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Created invoices will appear here.
            </p>
          </div>
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
                <th className="px-4 py-3 text-left font-medium">Invoice</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Paid</th>
                <th className="px-4 py-3 text-right font-medium">Balance</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium">{invoice.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        Invoice ID
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium">
                        {invoice.order.customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.order.customer.phone}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p className="max-w-[220px] truncate font-medium">
                        {invoice.order.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.order.id.slice(0, 8)}
                      </p>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right font-medium">
                    {formatAmount(invoice.total_amount)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    {formatAmount(invoice.amount_paid)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                    {formatAmount(invoice.balance_due)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                        invoice.status,
                      )}`}
                    >
                      {statusLabels[invoice.status]}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(invoice)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload(invoice)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
