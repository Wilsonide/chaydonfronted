"use client";

import { ArrowDownToLine, Clock3, Loader2 } from "lucide-react";

import type { StockMovement } from "@/app/services/inventory.service";

interface PrintInventoryHistoryProps {
  movements: StockMovement[];
  loading: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PrintInventoryHistory({
  movements,
  loading,
}: PrintInventoryHistoryProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
          <Clock3 className="h-4 w-4 text-gray-600" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Inventory History
          </h3>
          <p className="text-xs text-gray-500">
            Materials deducted from this order
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading history...
        </div>
      ) : movements.length === 0 ? (
        /* Empty */
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <ArrowDownToLine className="h-5 w-5 text-gray-400" />
          </div>

          <p className="mt-3 text-sm font-medium text-gray-700">
            No movements yet
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Material deductions will appear here.
          </p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">
                  Date
                </th>

                <th className="px-5 py-3 text-xs font-medium text-gray-500">
                  Movement
                </th>

                <th className="px-5 py-3 text-xs font-medium text-gray-500">
                  Quantity
                </th>

                <th className="px-5 py-3 text-xs font-medium text-gray-500">
                  Unit Price
                </th>

                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">
                  Value
                </th>

                <th className="px-5 py-3 text-xs font-medium text-gray-500">
                  Reason
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-5 py-3.5 text-sm text-gray-600">
                    {formatDate(movement.created_at)}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                      <ArrowDownToLine className="h-3 w-3" />
                      {movement.movement_type.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                    {movement.quantity}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {formatCurrency(movement.unit_selling_price)}
                  </td>

                  <td className="px-5 py-3.5 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(movement.total_selling_price)}
                  </td>

                  <td
                    className="max-w-[240px] truncate px-5 py-3.5 text-sm text-gray-600"
                    title={movement.reason || "Material deduction"}
                  >
                    {movement.reason || "Material deduction"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
