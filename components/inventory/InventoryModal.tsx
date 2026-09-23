"use client";

import type { ReactNode } from "react";
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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
      <div className="flex min-h-full items-center justify-center">
        <div
          className={[
            "relative flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl",
            "max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]",
            wide ? "max-w-3xl" : "max-w-lg",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-4 sm:px-6">
            <h2 className="min-w-0 pr-4 text-lg font-semibold text-gray-900">
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
