"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import inventoryService, {
  InventoryItem,
} from "@/app/services/inventory.service";

import InventoryModal from "../inventory/InventoryModal";

interface PrintMaterialFormProps {
  open: boolean;
  existingItemIds: string[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (inventoryItemId: string, requiredQuantity: number) => void;
}

export default function PrintMaterialForm({
  open,
  existingItemIds,
  saving,
  onClose,
  onSubmit,
}: PrintMaterialFormProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (!open) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedItemId("");
    setQuantity("");
    setSearch("");

    const loadItems = async () => {
      try {
        setLoading(true);

        const response = await inventoryService.getItems(1, 100, "");

        setItems(response.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load inventory items");
      } finally {
        setLoading(false);
      }
    };

    void loadItems();
  }, [open]);

  if (!open) return null;

  const availableItems = items.filter(
    (item) => !existingItemIds.includes(item.id),
  );

  const filteredItems = availableItems.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  const handleSubmit = () => {
    if (!selectedItemId) {
      toast.error("Select an inventory item");
      return;
    }

    const requiredQuantity = Number(quantity);

    if (!Number.isInteger(requiredQuantity) || requiredQuantity <= 0) {
      toast.error(
        "Required quantity must be a valid integer greater than zero",
      );
      return;
    }

    onSubmit(selectedItemId, requiredQuantity);
  };

  return (
    <InventoryModal title="Add Print Material" onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Search inventory
          </label>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by item name or category..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Inventory item
          </label>

          {loading ? (
            <div className="flex items-center justify-center rounded-lg border px-4 py-8 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading inventory...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-gray-500">
              No available inventory items found.
            </div>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {filteredItems.map((item) => {
                const selected = selectedItemId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItemId(item.id)}
                    className={[
                      "w-full rounded-lg border p-3 text-left transition",
                      selected
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.category} · {item.unit}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {item.quantity}
                        </p>

                        <p className="text-xs text-gray-500">in stock</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Required quantity
          </label>

          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Enter required quantity"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
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
            onClick={handleSubmit}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Material
          </button>
        </div>
      </div>
    </InventoryModal>
  );
}
