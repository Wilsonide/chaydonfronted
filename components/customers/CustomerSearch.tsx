"use client";

import { Search, X } from "lucide-react";

interface CustomerSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomerSearch({
  value,
  onChange,
  placeholder = "Search customers...",
}: CustomerSearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
