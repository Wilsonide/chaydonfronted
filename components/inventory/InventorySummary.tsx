"use client";

interface InventorySummaryProps {
  totalItems: number;
  lowStockItems: number;
  totalQuantity: number;
  totalValue: number;
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("en-NG");
}

function formatCurrency(value: number) {
  return `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function InventorySummary({
  totalItems,
  lowStockItems,
  totalQuantity,
  totalValue,
}: InventorySummaryProps) {
  const cards = [
    {
      label: "Total Items",
      value: formatNumber(totalItems),
    },
    {
      label: "Low Stock",
      value: formatNumber(lowStockItems),
    },
    {
      label: "Total Quantity",
      value: formatNumber(totalQuantity),
    },
    {
      label: "Inventory Value",
      value: formatCurrency(totalValue),
    },
  ];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="min-w-0 rounded-xl border bg-white p-5 shadow-sm"
        >
          <p className="truncate text-sm font-medium text-gray-500">
            {card.label}
          </p>

          <p className="mt-2 truncate text-2xl font-bold text-gray-900">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
