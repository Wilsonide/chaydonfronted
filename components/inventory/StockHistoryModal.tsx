"use client";

import InventoryModal from "./InventoryModal";

interface StockMovement {
  id: string;
  item_id: string;
  quantity: number;
  movement_type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";
  unit_selling_price: number;
  total_selling_price: number;
  reason: string | null;
  recorded_by: string;
  production_folder_id: string | null;
  created_at: string;
}

interface StockHistoryModalProps {
  open: boolean;
  itemName: string;
  movements: StockMovement[];
  loading: boolean;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getMovementLabel(type: StockMovement["movement_type"]) {
  switch (type) {
    case "STOCK_IN":
      return "Stock In";

    case "STOCK_OUT":
      return "Stock Out";

    case "ADJUSTMENT":
      return "Adjustment";

    default:
      return type;
  }
}

function getMovementClasses(type: StockMovement["movement_type"]) {
  switch (type) {
    case "STOCK_IN":
      return "bg-green-100 text-green-700";

    case "STOCK_OUT":
      return "bg-red-100 text-red-700";

    case "ADJUSTMENT":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function StockHistoryModal({
  open,
  itemName,
  movements,
  loading,
  onClose,
}: StockHistoryModalProps) {
  if (!open) return null;

  return (
    <InventoryModal
      title={`Stock History — ${itemName}`}
      onClose={onClose}
      wide
    >
      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <p className="text-sm text-gray-500">Loading stock history...</p>
        </div>
      ) : movements.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center text-center">
          <div>
            <p className="font-medium text-gray-900">No stock movements</p>

            <p className="mt-1 text-sm text-gray-500">
              There is no movement history for this item yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                      getMovementClasses(movement.movement_type),
                    ].join(" ")}
                  >
                    {getMovementLabel(movement.movement_type)}
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {movement.quantity}
                  </span>
                </div>

                {movement.reason && (
                  <p className="mt-2 break-words text-sm text-gray-600">
                    {movement.reason}
                  </p>
                )}

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-500 sm:grid-cols-2">
                  <div>
                    <span>Unit selling price: </span>

                    <span className="font-semibold text-gray-700">
                      {formatCurrency(movement.unit_selling_price)}
                    </span>
                  </div>

                  <div>
                    <span>Total selling price: </span>

                    <span className="font-semibold text-gray-700">
                      {formatCurrency(movement.total_selling_price)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-xs text-gray-500 sm:text-right">
                {formatDate(movement.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </InventoryModal>
  );
}
