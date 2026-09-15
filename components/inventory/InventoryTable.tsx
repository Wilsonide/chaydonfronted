"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Edit,
  History,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";

import { InventoryItem } from "@/app/services/inventory.service";

interface InventoryTableProps {
  items: InventoryItem[];
  loading: boolean;
  onStockIn: (item: InventoryItem) => void;
  onStockOut: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onHistory: (item: InventoryItem) => void;
}

function ActionButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    >
      {children}
    </button>
  );
}

export default function InventoryTable({
  items,
  loading,
  onStockIn,
  onStockOut,
  onAdjust,
  onEdit,
  onHistory,
}: InventoryTableProps) {
  const isLowStock = (item: InventoryItem) => {
    return item.quantity <= item.minimum_quantity;
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Item
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Category
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Stock
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Minimum
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Status
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No inventory items found.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const lowStock = isLowStock(item);

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>

                        {item.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.category}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {item.quantity}
                      </span>{" "}
                      <span className="text-sm text-gray-500">{item.unit}</span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.minimum_quantity} {item.unit}
                    </td>

                    <td className="px-6 py-4">
                      {lowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <ActionButton
                          title="Stock In"
                          onClick={() => onStockIn(item)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </ActionButton>

                        <ActionButton
                          title="Stock Out"
                          onClick={() => onStockOut(item)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </ActionButton>

                        <ActionButton
                          title="Adjust Stock"
                          onClick={() => onAdjust(item)}
                        >
                          <SlidersHorizontal className="h-4 w-4" />
                        </ActionButton>

                        <ActionButton title="Edit" onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </ActionButton>

                        <ActionButton
                          title="History"
                          onClick={() => onHistory(item)}
                        >
                          <History className="h-4 w-4" />
                        </ActionButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
