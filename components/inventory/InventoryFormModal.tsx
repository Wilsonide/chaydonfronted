"use client";

import InventoryModal from "./InventoryModal";

export interface InventoryForm {
  name: string;
  category: string;
  unit: string;
  quantity: string;
  minimum_quantity: string;
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
  if (!open) {
    return null;
  }

  const isCreate = mode === "create";

  return (
    <InventoryModal
      title={isCreate ? "Add Inventory Item" : "Edit Inventory Item"}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Item Name
          </label>

          <input
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="e.g. A4 Paper"
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category
            </label>

            <input
              value={form.category}
              onChange={(event) => onChange("category", event.target.value)}
              placeholder="e.g. Paper"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Unit
            </label>

            <input
              value={form.unit}
              onChange={(event) => onChange("unit", event.target.value)}
              placeholder="e.g. reams"
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {isCreate && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Opening Quantity
            </label>

            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(event) => onChange("quantity", event.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-400"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Minimum Quantity
          </label>

          <input
            type="number"
            min="0"
            value={form.minimum_quantity}
            onChange={(event) =>
              onChange("minimum_quantity", event.target.value)
            }
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
            rows={3}
            placeholder="Optional description"
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

          {isCreate ? "Create Item" : "Save Changes"}
        </button>
      </div>
    </InventoryModal>
  );
}
