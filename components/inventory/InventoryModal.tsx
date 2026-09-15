"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

interface InventoryModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export default function InventoryModal({
  title,
  onClose,
  children,
  wide = false,
}: InventoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full ${
          wide ? "max-w-3xl" : "max-w-lg"
        } max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl`}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
