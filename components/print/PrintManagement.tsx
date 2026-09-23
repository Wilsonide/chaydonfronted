"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";

import { toast } from "sonner";

import orderService from "@/app/services/order.service";

import inventoryService, {
  InventoryItem,
  OrderMaterialCalculation,
  StockMovement,
} from "@/app/services/inventory.service";

import PrintOrderTable from "./PrintOrderTable";
import PrintMaterialForm from "./PrintMaterialForm";
import PrintMaterialRequirements from "./PrintMaterialRequirements";
import PrintInventoryHistory from "./PrintInventoryHistory";

import type { PrintOrder } from "./types";

const LIMIT = 10;

function isPrintQueueOrder(value: unknown): value is PrintOrder {
  if (!value || typeof value !== "object") return false;

  const order = value as Record<string, unknown>;

  return (
    typeof order.id === "string" &&
    typeof order.title === "string" &&
    (order.order_type === "PRINT" || order.order_type === "DESIGN")
  );
}

export default function PrintManagement() {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<PrintOrder | null>(null);

  const [calculation, setCalculation] =
    useState<OrderMaterialCalculation | null>(null);

  const [materialLoading, setMaterialLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [showMaterialForm, setShowMaterialForm] = useState(false);

  /*
   * --------------------------------------------------------------------------
   * LOAD PRINT QUEUE
   * --------------------------------------------------------------------------
   *
   * PRINT:
   *   IN_PRODUCTION
   *
   * DESIGN:
   *   COMPLETED
   *
   * Both are displayed together.
   */

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const query = search.trim() || undefined;

      const [printResponse, designResponse] = await Promise.all([
        orderService.getOrders(1, 100, query, "COMPLETED", "PRINT"),

        orderService.getOrders(1, 100, query, "COMPLETED", "DESIGN"),
      ]);

      const queue = [...printResponse.data.data, ...designResponse.data.data]
        .filter(isPrintQueueOrder)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

      setOrders(queue);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load print queue.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void Promise.resolve().then(() => loadOrders());
  }, [loadOrders]);

  /*
   * --------------------------------------------------------------------------
   * INVENTORY
   * --------------------------------------------------------------------------
   */

  const loadInventory = useCallback(async () => {
    try {
      const response = await inventoryService.getItems(1, 100, "");

      setInventoryItems(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadInventory());
  }, [loadInventory]);

  /*
   * --------------------------------------------------------------------------
   * WORKFLOW
   * --------------------------------------------------------------------------
   */

  const loadWorkspace = useCallback(async (orderId: string) => {
    try {
      setMaterialLoading(true);
      setHistoryLoading(true);

      setCalculation(null);
      setMovements([]);

      const [calculationResponse, movementResponse] = await Promise.all([
        inventoryService.getOrderMaterialCalculation(orderId),
        inventoryService.getOrderMovements(orderId, 1, 50),
      ]);

      setCalculation(calculationResponse.data);
      setMovements(movementResponse.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load print workflow.");
    } finally {
      setMaterialLoading(false);
      setHistoryLoading(false);
    }
  }, []);

  /*
   * --------------------------------------------------------------------------
   * OPEN / CLOSE WORKFLOW
   * --------------------------------------------------------------------------
   */

  const handleToggleWorkflow = async (order: PrintOrder) => {
    /*
     * Clicking the currently opened order closes it.
     */
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
      setCalculation(null);
      setMovements([]);
      setShowMaterialForm(false);

      return;
    }

    /*
     * Open the new workflow.
     */
    setSelectedOrder(order);
    setShowMaterialForm(false);

    await loadWorkspace(order.id);
    await loadInventory();
  };

  /*
   * --------------------------------------------------------------------------
   * CONSUME MATERIALS
   * --------------------------------------------------------------------------
   */

  const handleConsume = async () => {
    if (!selectedOrder) return;

    const hasRemaining = calculation?.requirements.some(
      (requirement) => requirement.remaining_quantity > 0,
    );

    if (!hasRemaining) {
      toast.info("There are no remaining materials to deduct.");
      return;
    }

    try {
      setSaving(true);

      await inventoryService.consumeOrderMaterials(selectedOrder.id);

      toast.success("Inventory deducted successfully.");

      await Promise.all([
        loadWorkspace(selectedOrder.id),
        loadInventory(),
        loadOrders(),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to deduct inventory.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * ADD MATERIAL
   * --------------------------------------------------------------------------
   */

  const handleAddMaterial = async (
    inventoryItemId: string,
    requiredQuantity: number,
  ) => {
    if (!selectedOrder) return;

    try {
      setSaving(true);

      await inventoryService.addOrderMaterialRequirement(selectedOrder.id, {
        inventory_item_id: inventoryItemId,
        required_quantity: requiredQuantity,
      });

      toast.success("Material requirement added.");

      setShowMaterialForm(false);

      await loadWorkspace(selectedOrder.id);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add material requirement.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * INVENTORY MAP
   * --------------------------------------------------------------------------
   */

  const inventoryMap = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        quantity: number;
        unit: string;
      }
    > = {};

    for (const item of inventoryItems) {
      map[item.id] = {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      };
    }

    return map;
  }, [inventoryItems]);

  /*
   * --------------------------------------------------------------------------
   * PAGINATION
   * --------------------------------------------------------------------------
   */

  const total = orders.length;

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const visibleOrders = orders.slice((page - 1) * LIMIT, page * LIMIT);

  /*
   * --------------------------------------------------------------------------
   * SUMMARY
   * --------------------------------------------------------------------------
   */

  const printOrders = orders.filter(
    (order) => order.order_type === "PRINT",
  ).length;

  const completedDesigns = orders.filter(
    (order) => String(order.order_type) === "DESIGN",
  ).length;

  /*
   * --------------------------------------------------------------------------
   * RENDER
   * --------------------------------------------------------------------------
   */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Printer className="h-6 w-6 text-slate-700" />

            <h1 className="text-2xl font-semibold text-slate-900">
              Print Queue
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage print orders and completed designs ready for printing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void Promise.all([loadOrders(), loadInventory()]);
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Ready for Printing</p>

            <Printer className="h-5 w-5 text-slate-500" />
          </div>

          <p className="mt-2 text-3xl font-bold text-slate-900">{total}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Print Orders</p>

            <Printer className="h-5 w-5 text-blue-600" />
          </div>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {printOrders}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Completed Designs</p>

            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {completedDesigns}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search customer or order..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Queue */}
      <PrintOrderTable
        orders={visibleOrders}
        loading={loading}
        selectedOrderId={selectedOrder?.id ?? null}
        onManage={(order) => {
          void handleToggleWorkflow(order);
        }}
      />

      {/* Pagination */}
      {!loading && total > LIMIT && (
        <div className="flex items-center justify-between rounded-xl border bg-white px-5 py-4">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Expanded Workflow */}
      {selectedOrder && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Workflow Header */}
          <div className="flex flex-col gap-4 border-b bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                <Printer className="h-4 w-4 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  {selectedOrder.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder.customer.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  selectedOrder.order_type === "PRINT"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {selectedOrder.order_type === "PRINT"
                  ? "Print Order"
                  : "Completed Design"}
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setCalculation(null);
                  setMovements([]);
                  setShowMaterialForm(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Close
              </button>
            </div>
          </div>

          {/* Workflow Content */}
          <div className="space-y-6 p-5">
            {/* Order information */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Customer
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedOrder.customer.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {selectedOrder.customer.phone}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Due Date
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {selectedOrder.due_date
                    ? new Date(selectedOrder.due_date).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "—"}
                </p>
              </div>
            </div>

            {/* Materials */}
            <PrintMaterialRequirements
              calculation={calculation}
              inventoryItems={inventoryMap}
              loading={materialLoading}
              saving={saving}
              onAdd={() => setShowMaterialForm(true)}
              onConsume={() => {
                void handleConsume();
              }}
            />

            {/* Inventory History */}
            <PrintInventoryHistory
              movements={movements}
              loading={historyLoading}
            />
          </div>
        </div>
      )}

      {/* Add Material */}
      <PrintMaterialForm
        open={showMaterialForm}
        existingItemIds={
          calculation?.requirements.map(
            (requirement) => requirement.inventory_item_id,
          ) ?? []
        }
        saving={saving}
        onClose={() => {
          if (!saving) {
            setShowMaterialForm(false);
          }
        }}
        onSubmit={(inventoryItemId, requiredQuantity) => {
          void handleAddMaterial(inventoryItemId, requiredQuantity);
        }}
      />
    </div>
  );
}
