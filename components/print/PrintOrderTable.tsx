"use client";

import { CheckCircle2, ChevronDown, Loader2, Printer } from "lucide-react";
import type { PrintOrder } from "./types";

interface PrintOrderTableProps {
  orders: PrintOrder[];
  loading: boolean;
  selectedOrderId: string | null;
  onManage: (order: PrintOrder) => void;
}

export default function PrintOrderTable({
  orders,
  loading,
  selectedOrderId,
  onManage,
}: PrintOrderTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading print queue...
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Printer className="h-6 w-6 text-slate-400" />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No orders in the print queue
        </h3>

        <p className="mt-1 max-w-md text-sm text-slate-500">
          Completed print orders and completed designs will appear here when
          they are ready for printing.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Desktop */}
      <div className="hidden md:block">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-[22%] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order
              </th>

              <th className="w-[20%] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </th>

              <th className="w-[15%] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </th>

              <th className="w-[15%] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Due Date
              </th>

              <th className="w-[13%] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="w-[15%] px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const selected = selectedOrderId === order.id;

              return (
                <tr
                  key={order.id}
                  className={`transition ${
                    selected ? "bg-slate-50" : "bg-white hover:bg-slate-50/70"
                  }`}
                >
                  {/* Order */}
                  <td className="px-5 py-4 align-middle">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {order.title}
                      </p>

                      {order.description && (
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {order.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4 align-middle">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {order.customer.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {order.customer.phone}
                      </p>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-4 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        order.order_type === "PRINT"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {order.order_type === "PRINT"
                        ? "Print Order"
                        : "Completed Design"}
                    </span>
                  </td>

                  {/* Due date */}
                  <td className="px-5 py-4 align-middle">
                    <span className="text-sm text-slate-700">
                      {order.due_date
                        ? new Date(order.due_date).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 align-middle">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ready
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right align-middle">
                    <button
                      type="button"
                      onClick={() => onManage(order)}
                      aria-expanded={selected}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        selected
                          ? "border-slate-300 bg-white text-slate-900 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {selected ? "Managing" : "Manage"}

                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${
                          selected ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-slate-100 md:hidden">
        {orders.map((order) => {
          const selected = selectedOrderId === order.id;

          return (
            <div
              key={order.id}
              className={`p-4 transition ${
                selected ? "bg-slate-50" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {order.title}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {order.customer.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {order.customer.phone}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onManage(order)}
                  aria-expanded={selected}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    selected
                      ? "border-slate-300 bg-white text-slate-900 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{selected ? "Managing" : "Manage"}</span>

                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      selected ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    order.order_type === "PRINT"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {order.order_type === "PRINT"
                    ? "Print Order"
                    : "Completed Design"}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ready
                </span>

                {order.due_date && (
                  <span className="text-xs text-slate-500">
                    Due{" "}
                    {new Date(order.due_date).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
