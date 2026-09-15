"use client";

import { CreditCard, Loader2 } from "lucide-react";

import { CustomerBalance } from "./types";

interface CustomerBalanceCardProps {
  balance: CustomerBalance | null;
  loading?: boolean;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function CustomerBalanceCard({
  balance,
  loading = false,
}: CustomerBalanceCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading balance...
        </div>
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  const statusClass =
    balance.status === "PAID"
      ? "bg-green-100 text-green-700"
      : balance.status === "PARTIALLY_PAID"
        ? "bg-yellow-100 text-yellow-700"
        : balance.status === "VOID"
          ? "bg-gray-100 text-gray-600"
          : "bg-red-100 text-red-700";

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
            <CreditCard className="h-5 w-5 text-gray-700" />
          </div>

          <div>
            <p className="font-semibold text-gray-900">Account Balance</p>

            <p className="text-xs text-gray-500">
              {balance.total_orders}{" "}
              {balance.total_orders === 1 ? "order" : "orders"}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
        >
          {balance.status.replace("_", " ")}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500">Total</p>

          <p className="mt-1 font-semibold text-gray-900">
            {formatCurrency(balance.total_amount)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Paid</p>

          <p className="mt-1 font-semibold text-green-600">
            {formatCurrency(balance.amount_paid)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Outstanding</p>

          <p className="mt-1 font-semibold text-red-600">
            {formatCurrency(balance.balance)}
          </p>
        </div>
      </div>
    </div>
  );
}
