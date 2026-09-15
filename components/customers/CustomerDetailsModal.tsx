"use client";

import { Loader2 } from "lucide-react";

import { CustomerModal } from "./CustomerModal";

import { Customer, CustomerBalance, CustomerOrder } from "./types";

import { CustomerBalanceCard } from "./CustomerBalanceCard";

import { CustomerOrdersTable } from "./CustomerOrdersTable";

interface CustomerDetailsModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  orders: CustomerOrder[];
  balance: CustomerBalance | null;
  loadingOrders?: boolean;
  loadingBalance?: boolean;
}

export function CustomerDetailsModal({
  open,
  onClose,
  customer,
  orders,
  balance,
  loadingOrders = false,
  loadingBalance = false,
}: CustomerDetailsModalProps) {
  if (!customer) {
    return null;
  }

  return (
    <CustomerModal
      open={open}
      onClose={onClose}
      title={customer.name}
      description="Customer details and order history"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Phone
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {customer.phone}
            </p>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Email
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {customer.email || "Not provided"}
            </p>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Address
            </p>

            <p className="mt-1 text-sm text-gray-900">
              {customer.address || "Not provided"}
            </p>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Notes
            </p>

            <p className="mt-1 text-sm text-gray-900">
              {customer.notes || "No notes"}
            </p>
          </div>
        </div>

        <CustomerBalanceCard balance={balance} loading={loadingBalance} />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Order History</h3>

              <p className="text-sm text-gray-500">
                Previous orders for this customer
              </p>
            </div>

            {loadingOrders && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>

          <CustomerOrdersTable orders={orders} loading={loadingOrders} />
        </div>
      </div>
    </CustomerModal>
  );
}
