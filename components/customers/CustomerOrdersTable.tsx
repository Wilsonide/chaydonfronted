"use client";

import { Loader2 } from "lucide-react";

import { CustomerOrder } from "./types";

interface CustomerOrdersTableProps {
  orders: CustomerOrder[];
  loading?: boolean;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusClass(status: CustomerOrder["status"]) {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";

    case "IN_PRODUCTION":
      return "bg-blue-100 text-blue-700";

    case "READY_FOR_PRODUCTION":
      return "bg-purple-100 text-purple-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "REVIEWING":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function CustomerOrdersTable({
  orders,
  loading = false,
}: CustomerOrdersTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading orders...
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <p className="font-medium text-gray-900">No orders yet</p>

        <p className="mt-1 text-sm text-gray-500">
          This customer does not have any orders.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Order
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Paid
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Balance
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{order.title}</p>

                  {order.description && (
                    <p className="mt-1 max-w-[250px] truncate text-xs text-gray-500">
                      {order.description}
                    </p>
                  )}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(order.status)}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </td>

                <td className="px-5 py-4 text-right text-sm text-gray-700">
                  {formatCurrency(order.total_amount)}
                </td>

                <td className="px-5 py-4 text-right text-sm text-green-600">
                  {formatCurrency(order.amount_paid)}
                </td>

                <td className="px-5 py-4 text-right text-sm font-medium text-red-600">
                  {formatCurrency(order.balance)}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                  {formatDate(order.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
