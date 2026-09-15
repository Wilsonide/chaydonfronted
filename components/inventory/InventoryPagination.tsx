"use client";

interface InventoryPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function InventoryPagination({
  page,
  limit,
  total,
  onPrevious,
  onNext,
}: InventoryPaginationProps) {
  if (total <= 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center justify-between border-t px-6 py-4">
      <p className="text-sm text-gray-500">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of{" "}
        {total}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrevious}
          className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="px-2 text-sm text-gray-600">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
