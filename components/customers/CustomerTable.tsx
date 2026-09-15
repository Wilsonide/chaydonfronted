"use client";

import { Eye, Loader2, Pencil } from "lucide-react";

import { Customer } from "./types";

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function CustomerTable({
  customers,
  loading = false,
  onView,
  onEdit,
}: CustomerTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading customers...
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-white">
        <div className="text-center">
          <p className="font-medium text-gray-900">No customers found</p>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or add a new customer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Customer
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Phone
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Address
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Added
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {customers.map((customer) => (
              <tr key={customer.id} className="transition hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">
                    {customer.name}
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {customer.phone}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {customer.email || "—"}
                </td>

                <td className="max-w-[220px] truncate px-5 py-4 text-sm text-gray-600">
                  {customer.address || "—"}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                  {formatDate(customer.created_at)}
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(customer)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(customer)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-gray-800"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
