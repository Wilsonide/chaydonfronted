/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import productionService from "@/app/services/productionService";

import type { Order } from "@/components/orders/types";

import type { ProductionFolder, ProductionStatus } from "./types";

import ProductionSummary from "./ProductionSummary";
import ProductionToolbar from "./ProductionToolbar";
import ProductionTable from "./ProductionTable";
import ProductionPagination from "./ProductionPagination";
import CreateProductionDialog from "./CreateProductionDialog";
import EditProductionDialog from "./EditProductionDialog";
import ProductionDetailsDialog from "./ProductionDetailsDialog";
import orderService from "@/app/services/order.service";

interface ProductionManagementProps {
  role?: "SUPER_ADMIN";
}

export default function ProductionManagement({
  role = "SUPER_ADMIN",
}: ProductionManagementProps) {
  const [folders, setFolders] = useState<ProductionFolder[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);

  const [selectedFolder, setSelectedFolder] = useState<ProductionFolder | null>(
    null,
  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<ProductionStatus | "ALL">(
    "ALL",
  );

  const [page, setPage] = useState(1);

  const limit = 10;

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [ordersLoading, setOrdersLoading] = useState(true);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadFolders = useCallback(async () => {
    try {
      setLoading(true);

      const response = await productionService.getProductionFolders(
        page,
        limit,
        search.trim() || undefined,
        statusFilter === "ALL" ? undefined : statusFilter,
      );

      setFolders(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ?? "Failed to load production folders",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);

      const response = await orderService.getOrders(1, 100);

      setOrders(response.data.data);
      console.log(response.data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadFolders());
  }, [loadFolders]);

  useEffect(() => {
    Promise.resolve().then(() => loadOrders());
  }, [loadOrders]);

  const orderMap = useMemo(() => {
    return new Map(orders.map((order) => [order.id, order]));
  }, [orders]);

  const totalPages = Math.ceil(total / limit);

  const handleView = async (folder: ProductionFolder) => {
    try {
      setDetailsLoading(true);
      setDetailsOpen(true);

      const response = await productionService.getProductionFolder(folder.id);

      setSelectedFolder(response.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ?? "Failed to load production folder",
      );

      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEdit = (folder: ProductionFolder) => {
    setSelectedFolder(folder);
    setEditOpen(true);
  };

  const handleCreated = async () => {
    setCreateOpen(false);

    if (page !== 1) {
      setPage(1);
      return;
    }

    await loadFolders();
  };

  const handleUpdated = async () => {
    setEditOpen(false);

    await loadFolders();

    if (!selectedFolder) {
      return;
    }

    try {
      const response = await productionService.getProductionFolder(
        selectedFolder.id,
      );

      setSelectedFolder(response.data);
    } catch {
      // The main list has already been refreshed.
    }
  };

  const handleDetailsRefresh = async () => {
    if (!selectedFolder) {
      return;
    }

    try {
      const response = await productionService.getProductionFolder(
        selectedFolder.id,
      );

      setSelectedFolder(response.data);

      await loadFolders();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ?? "Failed to refresh production folder",
      );
    }
  };

  if (role !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Production</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage production folders, requirements, files, and workflow status.
        </p>
      </div>

      <ProductionSummary folders={folders} total={total} />

      <ProductionToolbar
        search={search}
        statusFilter={statusFilter}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        onCreate={() => setCreateOpen(true)}
      />

      <ProductionTable
        folders={folders}
        orders={orders}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
      />

      <ProductionPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <CreateProductionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        orders={orders}
        ordersLoading={ordersLoading}
        onCreated={handleCreated}
      />

      <EditProductionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        folder={selectedFolder}
        onUpdated={handleUpdated}
      />

      <ProductionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        folder={selectedFolder}
        loading={detailsLoading}
        onRefresh={handleDetailsRefresh}
      />
    </div>
  );
}
