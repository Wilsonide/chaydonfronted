"use client";

import type { ReactNode } from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Eye,
  Pencil,
  SlidersHorizontal,
} from "lucide-react";

import type { InventoryItem } from "@/app/services/inventory.service";

interface InventoryTableProps {
  items: InventoryItem[];
  loading: boolean;
  onEdit: (item: InventoryItem) => void;
  onStockIn: (item: InventoryItem) => void;
  onStockOut: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onHistory: (item: InventoryItem) => void;
}

function formatNumber(value: number | null | undefined) {
  return Number(value || 0).toLocaleString("en-NG");
}

function formatCurrency(value: number | null | undefined) {
  return `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function InventoryTable({
  items,
  loading,
  onEdit,
  onStockIn,
  onStockOut,
  onAdjust,
  onHistory,
}: InventoryTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-white">
        <p className="text-sm text-gray-500">Loading inventory...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-white px-6 text-center">
        <div>
          <p className="font-medium text-gray-900">No inventory items found</p>

          <p className="mt-1 text-sm text-gray-500">
            Inventory items will appear here once they are created.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* =========================================================
          DESKTOP / TABLET
          ========================================================= */}
      <div className="hidden min-w-0 overflow-hidden rounded-xl border bg-white md:block">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Item
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Quantity
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Minimum
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Unit Price
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Value
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <DesktopInventoryRow
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onStockIn={onStockIn}
                  onStockOut={onStockOut}
                  onAdjust={onAdjust}
                  onHistory={onHistory}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================
          MOBILE
          ========================================================= */}
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <MobileInventoryCard
            key={item.id}
            item={item}
            onEdit={onEdit}
            onStockIn={onStockIn}
            onStockOut={onStockOut}
            onAdjust={onAdjust}
            onHistory={onHistory}
          />
        ))}
      </div>
    </>
  );
}

/* =============================================================
   DESKTOP ROW
   ============================================================= */

interface InventoryRowProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onStockIn: (item: InventoryItem) => void;
  onStockOut: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onHistory: (item: InventoryItem) => void;
}

function DesktopInventoryRow({
  item,
  onEdit,
  onStockIn,
  onStockOut,
  onAdjust,
  onHistory,
}: InventoryRowProps) {
  const quantity = Number(item.quantity || 0);
  const minimumQuantity = Number(item.minimum_quantity || 0);
  const isLowStock = quantity <= minimumQuantity;

  return (
    <tr className="border-b last:border-b-0 hover:bg-gray-50">
      {/* Item */}
      <td className="max-w-[260px] px-4 py-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">{item.name}</p>

          {item.description && (
            <p className="mt-1 truncate text-xs text-gray-500">
              {item.description}
            </p>
          )}

          <p className="mt-1 text-xs text-gray-400">Per {item.unit}</p>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-4 text-sm text-gray-600">
        {item.category || "—"}
      </td>

      {/* Quantity */}
      <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
        {formatNumber(item.quantity)}
      </td>

      {/* Minimum */}
      <td className="px-4 py-4 text-right text-sm text-gray-600">
        {formatNumber(item.minimum_quantity)}
      </td>

      {/* Unit Price */}
      <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
        {formatCurrency(item.unit_selling_price)}
      </td>

      {/* Total Value */}
      <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900">
        {formatCurrency(item.total_selling_price)}
      </td>

      {/* Status */}
      <td className="px-4 py-4 text-center">
        <StockStatus isLowStock={isLowStock} />
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1">
          <ActionButton label="Edit" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </ActionButton>

          <ActionButton label="Stock in" onClick={() => onStockIn(item)}>
            <ArrowDownToLine className="h-4 w-4" />
          </ActionButton>

          <ActionButton label="Stock out" onClick={() => onStockOut(item)}>
            <ArrowUpFromLine className="h-4 w-4" />
          </ActionButton>

          <ActionButton label="Adjust" onClick={() => onAdjust(item)}>
            <SlidersHorizontal className="h-4 w-4" />
          </ActionButton>

          <ActionButton label="History" onClick={() => onHistory(item)}>
            <Eye className="h-4 w-4" />
          </ActionButton>
        </div>
      </td>
    </tr>
  );
}

/* =============================================================
   MOBILE CARD
   ============================================================= */

function MobileInventoryCard({
  item,
  onEdit,
  onStockIn,
  onStockOut,
  onAdjust,
  onHistory,
}: InventoryRowProps) {
  const quantity = Number(item.quantity || 0);
  const minimumQuantity = Number(item.minimum_quantity || 0);
  const isLowStock = quantity <= minimumQuantity;

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b px-4 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900">{item.name}</h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
            <span>{item.category || "Uncategorized"}</span>

            <span aria-hidden="true">•</span>

            <span>Per {item.unit}</span>
          </div>
        </div>

        <StockStatus isLowStock={isLowStock} />
      </div>

      {/* Description */}
      {item.description && (
        <div className="border-b px-4 py-3">
          <p className="line-clamp-2 text-sm text-gray-500">
            {item.description}
          </p>
        </div>
      )}

      {/* Inventory details */}
      <div className="grid grid-cols-2 gap-px bg-gray-100">
        <MobileStat label="Quantity" value={formatNumber(item.quantity)} />

        <MobileStat
          label="Minimum"
          value={formatNumber(item.minimum_quantity)}
        />

        <MobileStat
          label="Unit Price"
          value={formatCurrency(item.unit_selling_price)}
        />

        <MobileStat
          label="Total Value"
          value={formatCurrency(item.total_selling_price)}
        />
      </div>

      {/* Actions */}
      <div className="border-t p-3">
        <div className="grid grid-cols-5 gap-2">
          <MobileActionButton label="Edit" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </MobileActionButton>

          <MobileActionButton label="Stock in" onClick={() => onStockIn(item)}>
            <ArrowDownToLine className="h-4 w-4" />
          </MobileActionButton>

          <MobileActionButton
            label="Stock out"
            onClick={() => onStockOut(item)}
          >
            <ArrowUpFromLine className="h-4 w-4" />
          </MobileActionButton>

          <MobileActionButton label="Adjust" onClick={() => onAdjust(item)}>
            <SlidersHorizontal className="h-4 w-4" />
          </MobileActionButton>

          <MobileActionButton label="History" onClick={() => onHistory(item)}>
            <Eye className="h-4 w-4" />
          </MobileActionButton>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   MOBILE STAT
   ============================================================= */

interface MobileStatProps {
  label: string;
  value: string;
}

function MobileStat({ label, value }: MobileStatProps) {
  return (
    <div className="min-w-0 bg-white px-4 py-3">
      <p className="truncate text-xs font-medium text-gray-500">{label}</p>

      <p className="mt-1 truncate text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

/* =============================================================
   STOCK STATUS
   ============================================================= */

interface StockStatusProps {
  isLowStock: boolean;
}

function StockStatus({ isLowStock }: StockStatusProps) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1",
        "text-xs font-medium",
        isLowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700",
      ].join(" ")}
    >
      {isLowStock ? "Low Stock" : "In Stock"}
    </span>
  );
}

/* =============================================================
   DESKTOP ACTION BUTTON
   ============================================================= */

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
}

function ActionButton({ label, onClick, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
    >
      {children}
    </button>
  );
}

/* =============================================================
   MOBILE ACTION BUTTON
   ============================================================= */

function MobileActionButton({ label, onClick, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex min-h-10 w-full items-center justify-center rounded-lg border bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 active:bg-gray-100"
    >
      {children}
    </button>
  );
}
