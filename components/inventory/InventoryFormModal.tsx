"use client";

import InventoryModal from "./InventoryModal";

export interface InventoryForm {
  name: string;
  category: string;
  unit: string;
  quantity: string;
  minimum_quantity: string;
  unit_selling_price: string;
  description: string;
}

interface InventoryFormModalProps {
  mode: "create" | "edit";
  open: boolean;
  form: InventoryForm;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (field: keyof InventoryForm, value: string) => void;
}

export default function InventoryFormModal({
  mode,
  open,
  form,
  saving,
  onClose,
  onSubmit,
  onChange,
}: InventoryFormModalProps) {
  if (!open) return null;

  const isCreate = mode === "create";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!saving) {
      onSubmit();
    }
  };

  return (
    <InventoryModal
      title={isCreate ? "Add Inventory Item" : "Edit Inventory Item"}
      onClose={onClose}
      wide
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="inventory-name"
              className="text-sm font-medium text-gray-700"
            >
              Item Name
            </label>

            <input
              id="inventory-name"
              type="text"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g. A4 Paper"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <label
                htmlFor="inventory-category"
                className="text-sm font-medium text-gray-700"
              >
                Category
              </label>

              <input
                id="inventory-category"
                type="text"
                value={form.category}
                onChange={(e) => onChange("category", e.target.value)}
                placeholder="e.g. Paper"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="min-w-0 space-y-2">
              <label
                htmlFor="inventory-unit"
                className="text-sm font-medium text-gray-700"
              >
                Unit
              </label>

              <input
                id="inventory-unit"
                type="text"
                value={form.unit}
                onChange={(e) => onChange("unit", e.target.value)}
                placeholder="e.g. piece, ream, sheet"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {isCreate && (
              <div className="min-w-0 space-y-2">
                <label
                  htmlFor="inventory-quantity"
                  className="text-sm font-medium text-gray-700"
                >
                  Opening Quantity
                </label>

                <input
                  id="inventory-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={(e) => onChange("quantity", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </div>
            )}

            <div className="min-w-0 space-y-2">
              <label
                htmlFor="inventory-minimum-quantity"
                className="text-sm font-medium text-gray-700"
              >
                Minimum Quantity
              </label>

              <input
                id="inventory-minimum-quantity"
                type="number"
                min="0"
                step="1"
                value={form.minimum_quantity}
                onChange={(e) => onChange("minimum_quantity", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <div className="min-w-0 space-y-2">
              <label
                htmlFor="inventory-unit-selling-price"
                className="text-sm font-medium text-gray-700"
              >
                Unit Selling Price
              </label>

              <input
                id="inventory-unit-selling-price"
                type="number"
                min="0"
                step="0.01"
                value={form.unit_selling_price}
                onChange={(e) => onChange("unit_selling_price", e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="inventory-description"
              className="text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="inventory-description"
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Optional description"
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
              ? isCreate
                ? "Creating..."
                : "Saving..."
              : isCreate
                ? "Create Item"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </InventoryModal>
  );
}
