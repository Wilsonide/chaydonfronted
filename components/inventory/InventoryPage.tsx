"use client";

import { useCallback, useEffect, useState } from "react";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import inventoryService, {
  InventoryDashboard,
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
  unit_selling_price: "0",
  description: "",
};

const emptyMovementForm: MovementForm = {
  quantity: "",
  unit_selling_price: "",
  reason: "",
};

const emptyAdjustmentForm: AdjustmentForm = {
  new_quantity: "",
  reason: "",
};

const emptyDashboard: InventoryDashboard = {
  total_items: 0,
  total_stock_units: 0,
  total_inventory_value: 0,
  low_stock_items: 0,
  categories: 0,
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

  const [dashboard, setDashboard] =
    useState<InventoryDashboard>(emptyDashboard);

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
    void Promise.resolve().then(() => loadItems());
  }, [loadItems]);

  useEffect(() => {
    void Promise.resolve().then(() => loadDashboard());
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

      // Load the current selling price from the backend.
      unit_selling_price: String(item.unit_selling_price),

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
      quantity: "",
      unit_selling_price:
        type === "STOCK_IN" ? String(item.unit_selling_price) : "",
      reason: "",
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

    const quantity = Number(inventoryForm.quantity || 0);
    const minimumQuantity = Number(inventoryForm.minimum_quantity || 0);
    const unitSellingPrice = Number(inventoryForm.unit_selling_price || 0);

    if (!Number.isInteger(quantity) || quantity < 0) {
      toast.error("Quantity must be a valid non-negative integer");
      return;
    }

    if (!Number.isInteger(minimumQuantity) || minimumQuantity < 0) {
      toast.error("Minimum quantity must be a valid non-negative integer");
      return;
    }

    if (Number.isNaN(unitSellingPrice) || unitSellingPrice < 0) {
      toast.error("Unit selling price cannot be negative");
      return;
    }

    try {
      setSaving(true);

      await inventoryService.createItem({
        name: inventoryForm.name.trim(),
        category: inventoryForm.category.trim(),
        unit: inventoryForm.unit.trim(),
        quantity,
        minimum_quantity: minimumQuantity,

        // Backend requires this field.
        unit_selling_price: unitSellingPrice,

        description: inventoryForm.description.trim() || undefined,
      });

      toast.success("Inventory item created");

      setShowCreateModal(false);
      setInventoryForm({
        ...emptyInventoryForm,
      });

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

    const minimumQuantity = Number(inventoryForm.minimum_quantity || 0);

    const unitSellingPrice = Number(inventoryForm.unit_selling_price || 0);

    if (!Number.isInteger(minimumQuantity) || minimumQuantity < 0) {
      toast.error("Minimum quantity must be a valid non-negative integer");
      return;
    }

    if (Number.isNaN(unitSellingPrice) || unitSellingPrice < 0) {
      toast.error("Unit selling price cannot be negative");
      return;
    }

    try {
      setSaving(true);

      await inventoryService.updateItem(selectedItem.id, {
        name: inventoryForm.name.trim(),
        category: inventoryForm.category.trim(),
        unit: inventoryForm.unit.trim(),
        minimum_quantity: minimumQuantity,

        // Backend InventoryUpdate supports this now.
        unit_selling_price: unitSellingPrice,

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

    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Quantity must be a valid integer greater than zero");
      return;
    }

    if (movementType === "STOCK_OUT" && quantity > selectedItem.quantity) {
      toast.error("Insufficient stock");
      return;
    }

    /*
     * STOCK_IN:
     * The backend allows a new unit selling price to be supplied.
     *
     * STOCK_OUT:
     * The backend uses the item's existing unit selling price,
     * so we deliberately do not send unit_selling_price.
     */

    if (movementType === "STOCK_IN") {
      const unitSellingPrice = Number(movementForm.unit_selling_price || 0);

      if (Number.isNaN(unitSellingPrice) || unitSellingPrice < 0) {
        toast.error("Unit selling price cannot be negative");
        return;
      }

      try {
        setSaving(true);

        await inventoryService.addStock(selectedItem.id, {
          quantity,
          movement_type: "STOCK_IN",
          reason: movementForm.reason.trim() || undefined,
          unit_selling_price: unitSellingPrice,
        });

        toast.success("Stock added successfully");

        setShowMovementModal(false);
        setSelectedItem(null);
        setMovementForm({
          ...emptyMovementForm,
        });

        await Promise.all([loadItems(), loadDashboard()]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to record stock movement");
      } finally {
        setSaving(false);
      }

      return;
    }

    /*
     * STOCK_OUT
     */

    try {
      setSaving(true);

      await inventoryService.addStock(selectedItem.id, {
        quantity,
        movement_type: "STOCK_OUT",
        reason: movementForm.reason.trim() || undefined,
      });

      toast.success("Stock removed successfully");

      setShowMovementModal(false);
      setSelectedItem(null);
      setMovementForm({
        ...emptyMovementForm,
      });

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

    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      toast.error("Quantity must be a valid non-negative integer");
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
      <InventorySummary
        totalItems={dashboard.total_items}
        lowStockItems={dashboard.low_stock_items}
        totalQuantity={dashboard.total_stock_units}
        totalValue={dashboard.total_inventory_value}
      />

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
        movementType={movementType}
        form={movementForm}
        saving={saving}
        currentUnitSellingPrice={selectedItem?.unit_selling_price ?? null}
        unit={selectedItem?.unit ?? null}
        onClose={closeMovementModal}
        onSubmit={handleMovement}
        onChange={updateMovementField}
      />

      {/* Adjustment */}
      <StockAdjustmentModal
        open={showAdjustmentModal}
        form={adjustmentForm}
        saving={saving}
        currentQuantity={selectedItem?.quantity ?? 0}
        unit={selectedItem?.unit ?? null}
        onClose={closeAdjustmentModal}
        onSubmit={handleAdjustment}
        onChange={updateAdjustmentField}
      />

      {/* History */}
      <StockHistoryModal
        open={showHistoryModal}
        itemName={selectedItem?.name ?? ""}
        movements={movements}
        loading={historyLoading}
        onClose={closeHistoryModal}
      />
    </div>
  );
}
