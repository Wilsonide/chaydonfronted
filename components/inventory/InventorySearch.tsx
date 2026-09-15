"use client";

import { Search } from "lucide-react";

interface InventorySearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function InventorySearch({
  search,
  onSearchChange,
}: InventorySearchProps) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search inventory..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-400"
        />
      </div>
    </div>
  );
}
