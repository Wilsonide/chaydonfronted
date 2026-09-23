"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Package,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import type {
  OrderMaterialCalculation,
  OrderMaterialRequirement,
} from "@/app/services/inventory.service";

interface PrintMaterialRequirementsProps {
  calculation: OrderMaterialCalculation | null;

  inventoryItems: Record<
    string,
    {
      name: string;
      unit: string;
      quantity: number;
    }
  >;

  loading: boolean;
  saving: boolean;

  onAdd: () => void;
  onConsume: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PrintMaterialRequirements({
  calculation,
  inventoryItems,
  loading,
  saving,
  onAdd,
  onConsume,
}: PrintMaterialRequirementsProps) {
  const requirements = calculation?.requirements ?? [];

  const remainingQuantity = requirements.reduce(
    (total, requirement) => total + requirement.remaining_quantity,
    0,
  );

  const hasRemaining = requirements.some(
    (requirement) => requirement.remaining_quantity > 0,
  );

  const hasInsufficientStock = requirements.some((requirement) => {
    const item = inventoryItems[requirement.inventory_item_id];

    if (!item) return false;

    return item.quantity < requirement.remaining_quantity;
  });

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
            <Package className="h-4 w-4 text-gray-600" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Material Requirements
            </h3>

            <p className="text-xs text-gray-500">
              Materials required for this order
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Material</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading materials...
        </div>
      ) : requirements.length === 0 ? (
        /* Empty */
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Package className="h-5 w-5 text-gray-400" />
          </div>

          <p className="mt-3 text-sm font-medium text-gray-700">
            No materials added
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Add the materials needed to complete this order.
          </p>

          <button
            type="button"
            onClick={onAdd}
            disabled={saving}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Material
          </button>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">
                    Material
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-gray-500">
                    Required
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-gray-500">
                    Used
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-gray-500">
                    Remaining
                  </th>

                  <th className="px-5 py-3 text-xs font-medium text-gray-500">
                    Unit Price
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">
                    Cost
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {requirements.map((requirement: OrderMaterialRequirement) => {
                  const item = inventoryItems[requirement.inventory_item_id];

                  const insufficient =
                    item && item.quantity < requirement.remaining_quantity;

                  const completed = requirement.remaining_quantity === 0;

                  return (
                    <tr
                      key={requirement.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      {/* Material */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <Package className="h-4 w-4 text-gray-500" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item?.name ?? "Inventory item"}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500">
                              {item?.unit ?? "unit"}
                              {item ? ` · ${item.quantity} in stock` : ""}
                            </p>

                            {insufficient && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                                <AlertTriangle className="h-3 w-3" />
                                Insufficient stock
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Required */}
                      <td className="px-5 py-3.5 text-sm text-gray-700">
                        {requirement.required_quantity}
                      </td>

                      {/* Consumed */}
                      <td className="px-5 py-3.5 text-sm text-gray-700">
                        {requirement.consumed_quantity}
                      </td>

                      {/* Remaining */}
                      <td className="px-5 py-3.5">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                            completed
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          {requirement.remaining_quantity}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="px-5 py-3.5 text-sm text-gray-700">
                        {formatCurrency(requirement.unit_selling_price)}
                      </td>

                      {/* Cost */}
                      <td className="px-5 py-3.5 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(requirement.required_cost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="border-t bg-gray-50 px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Required Cost</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {formatCurrency(calculation?.total_required_cost ?? 0)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Consumed Cost</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {formatCurrency(calculation?.total_consumed_cost ?? 0)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Remaining Cost</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {formatCurrency(calculation?.total_remaining_cost ?? 0)}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              {remainingQuantity > 0 ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>
                    {remainingQuantity} unit
                    {remainingQuantity === 1 ? "" : "s"} remaining
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>All materials consumed</span>
                </div>
              )}

              <button
                type="button"
                onClick={onConsume}
                disabled={saving || !hasRemaining || hasInsufficientStock}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                Deduct Materials
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
