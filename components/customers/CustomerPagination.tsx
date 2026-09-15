"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomerPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function CustomerPagination({
  page,
  limit,
  total,
  onPageChange,
}: CustomerPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (total === 0) {
    return null;
  }

  const start = (page - 1) * limit + 1;

  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{start}</span> to{" "}
        <span className="font-medium text-gray-700">{end}</span> of{" "}
        <span className="font-medium text-gray-700">{total}</span> customers
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700">
          {page} / {totalPages}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
