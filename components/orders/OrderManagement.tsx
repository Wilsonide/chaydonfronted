"use client";

import { useEffect, useState } from "react";

import { Loader2, Plus, RefreshCw, Search } from "lucide-react";

import { toast } from "sonner";

import orderService from "@/app/services/order.service";

import { Order, OrderStatus } from "./types";

import { OrderForm } from "./OrderForm";
import { OrderEditForm } from "./OrderEditForm";
import { OrderTable } from "./OrderTable";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderPagination } from "./OrderPagination";
import { OrderDeleteDialog } from "./OrderDeleteDialog";

import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderManagementProps {
  role: "FRONT_DESK" | "SUPER_ADMIN";
}

const statuses: {
  value: OrderStatus;
  label: string;
}[] = [
  {
    value: "RECEIVED",
    label: "Received",
  },
  {
    value: "REVIEWING",
    label: "Reviewing",
  },
  {
    value: "READY_FOR_PRODUCTION",
    label: "Ready for Production",
  },
  {
    value: "IN_PRODUCTION",
    label: "In Production",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

export function OrderManagement({ role }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<string>("ALL");

  const [createOpen, setCreateOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [editOpen, setEditOpen] = useState(false);

  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueCount = orders.filter((o) => {
    if (!o.due_date || o.status === "COMPLETED") return false;
    return new Date(o.due_date) < today;
  }).length;

  const dueTodayCount = orders.filter((o) => {
    if (!o.due_date || o.status === "COMPLETED") return false;

    const due = new Date(o.due_date);
    due.setHours(0, 0, 0, 0);

    return due.getTime() === today.getTime();
  }).length;

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await orderService.getOrders(
        page,
        10,
        search || undefined,
        status !== "ALL" ? status : undefined,
      );

      setOrders(response.data.data);

      setPages(
        response.data.meta.pages ??
          Math.max(
            1,
            Math.ceil(response.data.meta.total / response.data.meta.limit),
          ),
      );
    } catch {
      toast.error("Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search, status]);

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setEditOpen(true);
  };

  const openDelete = (order: Order) => {
    setDeletingOrder(order);
    setDeleteOpen(true);
  };

  const handleOrderCreated = async () => {
    setCreateOpen(false);
    setPage(1);

    await loadOrders();
  };

  const handleOrderUpdated = async () => {
    setEditOpen(false);
    setEditingOrder(null);

    await loadOrders();
  };

  const handleOrderDeleted = async () => {
    if (!deletingOrder) {
      return;
    }

    try {
      setDeleting(true);

      await orderService.deleteOrder(deletingOrder.id);

      toast.success("Order deleted successfully");

      setDeleteOpen(false);
      setDeletingOrder(null);

      if (orders.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadOrders();
      }
    } catch {
      toast.error("Unable to delete order");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>

          <p className="text-muted-foreground">
            Manage customer orders and printing requirements.
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);

                  setPage(1);
                }}
                placeholder="Search orders..."
                className="pl-9"
              />
            </div>

            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value ?? "ALL");

                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>

                {statuses.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={loadOrders} disabled={loading}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Active Orders</p>
              <p className="mt-1 text-2xl font-bold">{orders.length}</p>
            </div>

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm text-orange-700">Due Today</p>
              <p className="mt-1 text-2xl font-bold text-orange-700">
                {dueTodayCount}
              </p>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">Overdue</p>
              <p className="mt-1 text-2xl font-bold text-red-700">
                {overdueCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <OrderTable
            orders={orders}
            onView={openDetails}
            onEdit={openEdit}
            onDelete={openDelete}
          />

          <OrderPagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}

      {/* Create Order */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>

          <OrderForm
            onSuccess={handleOrderCreated}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Order */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);

          if (!open) {
            setEditingOrder(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>

          {editingOrder && (
            <OrderEditForm
              order={editingOrder}
              onSuccess={handleOrderUpdated}
              onCancel={() => {
                setEditOpen(false);
                setEditingOrder(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details */}
      <OrderDetailsModal
        order={selectedOrder}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      {/* Delete Order */}
      <OrderDeleteDialog
        order={deletingOrder}
        open={deleteOpen}
        deleting={deleting}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setDeletingOrder(null);
          }
        }}
        onConfirm={handleOrderDeleted}
      />
    </div>
  );
}
