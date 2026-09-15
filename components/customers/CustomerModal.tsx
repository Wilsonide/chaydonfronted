"use client";

import { ReactNode } from "react";

import { X } from "lucide-react";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function CustomerModal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
}: CustomerModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl`}
      >
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
