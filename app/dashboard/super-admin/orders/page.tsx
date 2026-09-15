"use client";

import { OrderManagement } from "@/components/orders/OrderManagement";

export default function SuperAdminOrdersPage() {
  return <OrderManagement role="SUPER_ADMIN" />;
}
