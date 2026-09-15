"use client";

import { ArrowDown, ArrowUp, Loader2, SlidersHorizontal } from "lucide-react";

import { InventoryItem, StockMovement } from "@/app/services/inventory.service";

import InventoryModal from "./InventoryModal";

interface StockHistoryModalProps {
  open: boolean;
  item: InventoryItem | null;
  movements: StockMovement[];
  loading: boolean;
  onClose: () => void;
}

function MovementBadge({ type }: { type: StockMovement["movement_type"] }) {
  if (type === "STOCK_IN") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
        <ArrowUp className="h-3 w-3" />
        Stock In
      </span>
    );
  }

  if (type === "STOCK_OUT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        <ArrowDown className="h-3 w-3" />
        Stock Out
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-600">
      <SlidersHorizontal className="h-3 w-3" />
      Adjustment
    </span>
  );
}

export default function StockHistoryModal({
  open,
  item,
  movements,
  loading,
  onClose,
}: StockHistoryModalProps) {
  if (!open || !item) {
    return null;
  }

  return (
    <InventoryModal
      title={`Stock History — ${item.name}`}
      onClose={onClose}
      wide
    >
      {loading ? (
        <div className="py-12 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : movements.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          No stock movements recorded.
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="divide-y">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <MovementBadge type={movement.movement_type} />

                    <span className="font-medium text-gray-900">
                      {movement.quantity} {item.unit}
                    </span>
                  </div>

                  {movement.reason && (
                    <p className="mt-1 text-sm text-gray-500">
                      {movement.reason}
                    </p>
                  )}
                </div>

                <span className="whitespace-nowrap text-xs text-gray-400">
                  {new Date(movement.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </InventoryModal>
  );
}
