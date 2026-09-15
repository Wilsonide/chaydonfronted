"use client";

import { InventoryItem } from "@/app/services/inventory.service";

import InventoryModal from "./InventoryModal";

export interface AdjustmentForm {
  new_quantity: string;
  reason: string;
}

interface StockAdjustmentModalProps {
  open: boolean;
  item: InventoryItem | null;
  form: AdjustmentForm;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof AdjustmentForm, value: string) => void;
}

export default function StockAdjustmentModal({
  open,
  item,
  form,
  saving,
  onClose,
  onSubmit,
  onChange,
}: StockAdjustmentModalProps) {
  if (!open || !item) {
    return null;
  }

  return (
    <InventoryModal title="Manual Stock Adjustment" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Item</p>

          <p className="font-semibold text-gray-900">{item.name}</p>

          <p className="mt-1 text-sm text-gray-500">
            Current quantity: {item.quantity} {item.unit}
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            New Quantity
          </label>

          <input
            type="number"
            min="0"
            value={form.new_quantity}
            onChange={(event) => onChange("new_quantity", event.target.value)}
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
            placeholder="Explain why the stock is being adjusted"
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
          {saving && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          Adjust Stock
        </button>
      </div>
    </InventoryModal>
  );
}
