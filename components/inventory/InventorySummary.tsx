"use client";

import { AlertTriangle, Package, SlidersHorizontal } from "lucide-react";

interface InventoryDashboard {
  total_items: number;
  total_stock_units: number;
  low_stock_items: number;
  categories: number;
}

interface InventorySummaryProps {
  dashboard: InventoryDashboard;
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  warning?: boolean;
}

function SummaryCard({
  title,
  value,
  icon,
  warning = false,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{title}</div>

        <div
          className={
            warning
              ? "rounded-lg bg-red-50 p-2 text-red-600"
              : "rounded-lg bg-gray-100 p-2 text-gray-600"
          }
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-gray-900">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export default function InventorySummary({ dashboard }: InventorySummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Total Items"
        value={dashboard.total_items}
        icon={<Package className="h-5 w-5" />}
      />

      <SummaryCard
        title="Stock Units"
        value={dashboard.total_stock_units}
        icon={<Package className="h-5 w-5" />}
      />

      <SummaryCard
        title="Low Stock"
        value={dashboard.low_stock_items}
        icon={<AlertTriangle className="h-5 w-5" />}
        warning={dashboard.low_stock_items > 0}
      />

      <SummaryCard
        title="Categories"
        value={dashboard.categories}
        icon={<SlidersHorizontal className="h-5 w-5" />}
      />
    </div>
  );
}
