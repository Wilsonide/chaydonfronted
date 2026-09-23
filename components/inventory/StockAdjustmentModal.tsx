"use client";

import InventoryModal from "./InventoryModal";

export interface AdjustmentForm {
  new_quantity: string;
  reason: string;
}

interface StockAdjustmentModalProps {
  open: boolean;
  form: AdjustmentForm;
  saving: boolean;
  currentQuantity?: number | null;
  unit?: string | null;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof AdjustmentForm, value: string) => void;
}

export default function StockAdjustmentModal({
  open,
  form,
  saving,
  currentQuantity,
  unit,
  onClose,
  onSubmit,
  onChange,
}: StockAdjustmentModalProps) {
  if (!open) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!saving) {
      onSubmit();
    }
  };

  return (
    <InventoryModal title="Adjust Stock" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Current Quantity
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {currentQuantity ?? 0} {unit ?? ""}
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="adjustment-new-quantity"
              className="text-sm font-medium text-gray-700"
            >
              New Quantity
              {unit ? ` (${unit})` : ""}
            </label>

            <input
              id="adjustment-new-quantity"
              type="number"
              min="0"
              step="1"
              value={form.new_quantity}
              onChange={(e) => onChange("new_quantity", e.target.value)}
              placeholder="Enter new quantity"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="adjustment-reason"
              className="text-sm font-medium text-gray-700"
            >
              Reason
            </label>

            <textarea
              id="adjustment-reason"
              value={form.reason}
              onChange={(e) => onChange("reason", e.target.value)}
              placeholder="Explain why the stock is being adjusted"
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? "Adjusting..." : "Adjust Stock"}
          </button>
        </div>
      </form>
    </InventoryModal>
  );
}
