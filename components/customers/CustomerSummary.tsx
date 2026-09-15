"use client";

import { Users } from "lucide-react";

interface CustomerSummaryProps {
  totalCustomers: number;
}

export function CustomerSummary({ totalCustomers }: CustomerSummaryProps) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
          <Users className="h-5 w-5 text-gray-700" />
        </div>

        <div>
          <p className="text-sm text-gray-500">Total Customers</p>

          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {totalCustomers}
          </p>
        </div>
      </div>
    </div>
  );
}
