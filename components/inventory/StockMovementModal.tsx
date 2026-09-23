"use client";

import InventoryModal from "./InventoryModal";

export interface MovementForm {
  quantity: string;
  unit_selling_price: string;
  reason: string;
}

interface StockMovementModalProps {
  open: boolean;
  movementType: "STOCK_IN" | "STOCK_OUT";
  form: MovementForm;
  saving: boolean;
  currentUnitSellingPrice?: number | null;
  unit?: string | null;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof MovementForm, value: string) => void;
}

export default function StockMovementModal({
  open,
  movementType,
  form,
  saving,
  currentUnitSellingPrice,
  unit,
  onClose,
  onSubmit,
  onChange,
}: StockMovementModalProps) {
  if (!open) return null;

  const isStockIn = movementType === "STOCK_IN";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!saving) {
      onSubmit();
    }
  };

  return (
    <InventoryModal
      title={isStockIn ? "Add Stock" : "Remove Stock"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="movement-quantity"
              className="text-sm font-medium text-gray-700"
            >
              Quantity
              {unit ? ` (${unit})` : ""}
            </label>

            <input
              id="movement-quantity"
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={(e) => onChange("quantity", e.target.value)}
              placeholder="Enter quantity"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {isStockIn && (
            <div className="space-y-2">
              <label
                htmlFor="movement-unit-selling-price"
                className="text-sm font-medium text-gray-700"
              >
                Unit Selling Price
              </label>

              <input
                id="movement-unit-selling-price"
                type="number"
                min="0"
                step="0.01"
                value={form.unit_selling_price}
                onChange={(e) => onChange("unit_selling_price", e.target.value)}
                placeholder={
                  currentUnitSellingPrice !== undefined &&
                  currentUnitSellingPrice !== null
                    ? currentUnitSellingPrice.toFixed(2)
                    : "Enter selling price"
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />

              {currentUnitSellingPrice !== undefined &&
                currentUnitSellingPrice !== null && (
                  <p className="text-xs text-gray-500">
                    Current price:{" "}
                    <span className="font-medium text-gray-700">
                      ₦
                      {currentUnitSellingPrice.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                )}

              <p className="text-xs text-gray-500">
                Leave blank to keep the current unit selling price.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="movement-reason"
              className="text-sm font-medium text-gray-700"
            >
              Reason
            </label>

            <textarea
              id="movement-reason"
              value={form.reason}
              onChange={(e) => onChange("reason", e.target.value)}
              placeholder={
                isStockIn
                  ? "e.g. New stock received"
                  : "e.g. Used for customer order"
              }
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
            {saving
              ? isStockIn
                ? "Adding..."
                : "Removing..."
              : isStockIn
                ? "Add Stock"
                : "Remove Stock"}
          </button>
        </div>
      </form>
    </InventoryModal>
  );
}
