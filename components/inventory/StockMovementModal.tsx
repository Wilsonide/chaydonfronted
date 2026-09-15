"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { InventoryItem } from "@/app/services/inventory.service";

import InventoryModal from "./InventoryModal";

export interface MovementForm {
  quantity: string;
  reason: string;
}

interface StockMovementModalProps {
  open: boolean;
  item: InventoryItem | null;
  type: "STOCK_IN" | "STOCK_OUT";
  form: MovementForm;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof MovementForm, value: string) => void;
}

export default function StockMovementModal({
  open,
  item,
  type,
  form,
  saving,
  onClose,
  onSubmit,
  onChange,
}: StockMovementModalProps) {
  if (!open || !item) {
    return null;
  }

  const isStockIn = type === "STOCK_IN";

  return (
    <InventoryModal
      title={isStockIn ? "Stock In" : "Stock Out"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Item</p>

          <p className="font-semibold text-gray-900">{item.name}</p>

          <p className="mt-1 text-sm text-gray-500">
            Current stock: {item.quantity} {item.unit}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Quantity
          </label>

          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(event) => onChange("quantity", event.target.value)}
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Reason
          </label>

          <textarea
            value={form.reason}
            onChange={(event) => onChange("reason", event.target.value)}
            rows={3}
            placeholder="Why is the stock moving?"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : isStockIn ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}

          {isStockIn ? "Add Stock" : "Remove Stock"}
        </button>
      </div>
    </InventoryModal>
  );
}
