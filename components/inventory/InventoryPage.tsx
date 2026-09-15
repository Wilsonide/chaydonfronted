"use client";

import { useCallback, useEffect, useState } from "react";

import { Plus, Loader2 } from "lucide-react";

import { toast } from "sonner";

import inventoryService, {
  InventoryItem,
  StockMovement,
} from "@/app/services/inventory.service";

import InventorySummary from "./InventorySummary";
import InventorySearch from "./InventorySearch";
import InventoryTable from "./InventoryTable";
import InventoryPagination from "./InventoryPagination";
import InventoryFormModal, { InventoryForm } from "./InventoryFormModal";
import StockMovementModal, { MovementForm } from "./StockMovementModal";
import StockAdjustmentModal, { AdjustmentForm } from "./StockAdjustmentModal";
import StockHistoryModal from "./StockHistoryModal";

const emptyInventoryForm: InventoryForm = {
  name: "",
  category: "",
  unit: "",
  quantity: "0",
  minimum_quantity: "0",
  description: "",
};

const emptyMovementForm: MovementForm = {
  quantity: "",
  reason: "",
};

const emptyAdjustmentForm: AdjustmentForm = {
  new_quantity: "",
  reason: "",
};

interface InventoryPageProps {
  title?: string;
  description?: string;
}

export default function InventoryPage({
  title = "Inventory",
  description = "Manage stock, materials and inventory movements.",
}: InventoryPageProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [limit] = useState(10);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [dashboard, setDashboard] = useState({
    total_items: 0,
    total_stock_units: 0,
    low_stock_items: 0,
    categories: 0,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showMovementModal, setShowMovementModal] = useState(false);

  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [inventoryForm, setInventoryForm] =
    useState<InventoryForm>(emptyInventoryForm);

  const [movementForm, setMovementForm] =
    useState<MovementForm>(emptyMovementForm);

  const [adjustmentForm, setAdjustmentForm] =
    useState<AdjustmentForm>(emptyAdjustmentForm);

  const [movementType, setMovementType] = useState<"STOCK_IN" | "STOCK_OUT">(
    "STOCK_IN",
  );

  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [historyLoading, setHistoryLoading] = useState(false);

  /*
   * --------------------------------------------------------------------------
   * Dashboard
   * --------------------------------------------------------------------------
   */

  const loadDashboard = useCallback(async () => {
    try {
      const response = await inventoryService.getDashboard();

      setDashboard(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  /*
   * --------------------------------------------------------------------------
   * Inventory Items
   * --------------------------------------------------------------------------
   */

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);

      const response = await inventoryService.getItems(page, limit, search);

      /*
       * Your current backend response is expected
       * to use:
       *
       * response.data.data
       * response.data.meta.total
       *
       * because that is what your current page
       * was using.
       */

      setItems(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    Promise.resolve().then(() => loadItems());
  }, [loadItems]);

  useEffect(() => {
    Promise.resolve().then(() => loadDashboard());
  }, [loadDashboard]);

  /*
   * --------------------------------------------------------------------------
   * Modal Openers
   * --------------------------------------------------------------------------
   */

  const openCreateModal = () => {
    setInventoryForm({
      ...emptyInventoryForm,
    });

    setShowCreateModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setSelectedItem(item);

    setInventoryForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: String(item.quantity),
      minimum_quantity: String(item.minimum_quantity),
      description: item.description ?? "",
    });

    setShowEditModal(true);
  };

  const openMovementModal = (
    item: InventoryItem,
    type: "STOCK_IN" | "STOCK_OUT",
  ) => {
    setSelectedItem(item);

    setMovementType(type);

    setMovementForm({
      ...emptyMovementForm,
    });

    setShowMovementModal(true);
  };

  const openAdjustmentModal = (item: InventoryItem) => {
    setSelectedItem(item);

    setAdjustmentForm({
      new_quantity: String(item.quantity),
      reason: "",
    });

    setShowAdjustmentModal(true);
  };

  const openHistoryModal = async (item: InventoryItem) => {
    setSelectedItem(item);

    setShowHistoryModal(true);

    setHistoryLoading(true);

    setMovements([]);

    try {
      const response = await inventoryService.getMovements(item.id, 1, 50);

      setMovements(response.data.data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load stock history");
    } finally {
      setHistoryLoading(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Create
   * --------------------------------------------------------------------------
   */

  const handleCreate = async () => {
    if (
      !inventoryForm.name.trim() ||
      !inventoryForm.category.trim() ||
      !inventoryForm.unit.trim()
    ) {
      toast.error("Name, category and unit are required");

      return;
    }

    try {
      setSaving(true);

      await inventoryService.createItem({
        name: inventoryForm.name.trim(),
        category: inventoryForm.category.trim(),
        unit: inventoryForm.unit.trim(),
        quantity: Number(inventoryForm.quantity || 0),
        minimum_quantity: Number(inventoryForm.minimum_quantity || 0),
        description: inventoryForm.description.trim() || undefined,
      });

      toast.success("Inventory item created");

      setShowCreateModal(false);

      await Promise.all([loadItems(), loadDashboard()]);
    } catch (error) {
      console.error(error);

      toast.error("Failed to create inventory item");
    } finally {
      setSaving(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Update
   * --------------------------------------------------------------------------
   */

  const handleUpdate = async () => {
    if (!selectedItem) {
      return;
    }

    if (
      !inventoryForm.name.trim() ||
      !inventoryForm.category.trim() ||
      !inventoryForm.unit.trim()
    ) {
      toast.error("Name, category and unit are required");

      return;
    }

    try {
      setSaving(true);

      await inventoryService.updateItem(selectedItem.id, {
        name: inventoryForm.name.trim(),
        category: inventoryForm.category.trim(),
        unit: inventoryForm.unit.trim(),
        minimum_quantity: Number(inventoryForm.minimum_quantity || 0),
        description: inventoryForm.description.trim() || undefined,
      });

      toast.success("Inventory item updated");

      setShowEditModal(false);

      setSelectedItem(null);

      await Promise.all([loadItems(), loadDashboard()]);
    } catch (error) {
      console.error(error);

      toast.error("Failed to update inventory item");
    } finally {
      setSaving(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Stock Movement
   * --------------------------------------------------------------------------
   */

  const handleMovement = async () => {
    if (!selectedItem) {
      return;
    }

    const quantity = Number(movementForm.quantity);

    if (!quantity || quantity <= 0) {
      toast.error("Quantity must be greater than zero");

      return;
    }

    if (movementType === "STOCK_OUT" && quantity > selectedItem.quantity) {
      toast.error("Insufficient stock");

      return;
    }

    try {
      setSaving(true);

      await inventoryService.addStock(selectedItem.id, {
        quantity,
        movement_type: movementType,
        reason: movementForm.reason.trim() || undefined,
      });

      toast.success(
        movementType === "STOCK_IN"
          ? "Stock added successfully"
          : "Stock removed successfully",
      );

      setShowMovementModal(false);

      setSelectedItem(null);

      await Promise.all([loadItems(), loadDashboard()]);
    } catch (error) {
      console.error(error);

      toast.error("Failed to record stock movement");
    } finally {
      setSaving(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Manual Adjustment
   * --------------------------------------------------------------------------
   */

  const handleAdjustment = async () => {
    if (!selectedItem) {
      return;
    }

    const newQuantity = Number(adjustmentForm.new_quantity);

    if (Number.isNaN(newQuantity) || newQuantity < 0) {
      toast.error("Quantity cannot be negative");

      return;
    }

    if (!adjustmentForm.reason.trim()) {
      toast.error("Adjustment reason is required");

      return;
    }

    try {
      setSaving(true);

      await inventoryService.manualAdjustment(selectedItem.id, {
        new_quantity: newQuantity,
        reason: adjustmentForm.reason.trim(),
      });

      toast.success("Stock adjusted successfully");

      setShowAdjustmentModal(false);

      setSelectedItem(null);

      await Promise.all([loadItems(), loadDashboard()]);
    } catch (error) {
      console.error(error);

      toast.error("Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * Form Updates
   * --------------------------------------------------------------------------
   */

  const updateInventoryField = (field: keyof InventoryForm, value: string) => {
    setInventoryForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateMovementField = (field: keyof MovementForm, value: string) => {
    setMovementForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateAdjustmentField = (
    field: keyof AdjustmentForm,
    value: string,
  ) => {
    setAdjustmentForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
   * --------------------------------------------------------------------------
   * Close Helpers
   * --------------------------------------------------------------------------
   */

  const closeCreateModal = () => {
    if (saving) {
      return;
    }

    setShowCreateModal(false);
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);
    setSelectedItem(null);
  };

  const closeMovementModal = () => {
    if (saving) {
      return;
    }

    setShowMovementModal(false);
    setSelectedItem(null);
  };

  const closeAdjustmentModal = () => {
    if (saving) {
      return;
    }

    setShowAdjustmentModal(false);
    setSelectedItem(null);
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedItem(null);
    setMovements([]);
  };

  /*
   * --------------------------------------------------------------------------
   * Pagination
   * --------------------------------------------------------------------------
   */

  const handlePrevious = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNext = () => {
    const totalPages = Math.max(1, Math.ceil(total / limit));

    setPage((current) => Math.min(totalPages, current + 1));
  };

  /*
   * --------------------------------------------------------------------------
   * Search
   * --------------------------------------------------------------------------
   */

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  /*
   * --------------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------------
   */

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Inventory Item
        </button>
      </div>

      {/* Summary */}

      <InventorySummary dashboard={dashboard} />

      {/* Search */}

      <InventorySearch search={search} onSearchChange={handleSearchChange} />

      {/* Table */}

      <InventoryTable
        items={items}
        loading={loading}
        onStockIn={(item) => openMovementModal(item, "STOCK_IN")}
        onStockOut={(item) => openMovementModal(item, "STOCK_OUT")}
        onAdjust={openAdjustmentModal}
        onEdit={openEditModal}
        onHistory={openHistoryModal}
      />

      {/* Pagination */}

      {!loading && (
        <div className="-mt-6 overflow-hidden rounded-b-xl border border-t-0 bg-white">
          <InventoryPagination
            page={page}
            limit={limit}
            total={total}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      )}

      {/* Create */}

      <InventoryFormModal
        mode="create"
        open={showCreateModal}
        form={inventoryForm}
        saving={saving}
        onClose={closeCreateModal}
        onSubmit={handleCreate}
        onChange={updateInventoryField}
      />

      {/* Edit */}

      <InventoryFormModal
        mode="edit"
        open={showEditModal}
        form={inventoryForm}
        saving={saving}
        onClose={closeEditModal}
        onSubmit={handleUpdate}
        onChange={updateInventoryField}
      />

      {/* Stock Movement */}

      <StockMovementModal
        open={showMovementModal}
        item={selectedItem}
        type={movementType}
        form={movementForm}
        saving={saving}
        onClose={closeMovementModal}
        onSubmit={handleMovement}
        onChange={updateMovementField}
      />

      {/* Adjustment */}

      <StockAdjustmentModal
        open={showAdjustmentModal}
        item={selectedItem}
        form={adjustmentForm}
        saving={saving}
        onClose={closeAdjustmentModal}
        onSubmit={handleAdjustment}
        onChange={updateAdjustmentField}
      />

      {/* History */}

      <StockHistoryModal
        open={showHistoryModal}
        item={selectedItem}
        movements={movements}
        loading={historyLoading}
        onClose={closeHistoryModal}
      />
    </div>
  );
}
