import api from "./api";

// ============================================================
// INVENTORY
// ============================================================

export type MovementType = "STOCK_IN" | "STOCK_OUT";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minimum_quantity: number;
  unit_selling_price: number;
  total_selling_price: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  item_id: string;
  quantity: number;
  movement_type: MovementType | "ADJUSTMENT";
  unit_selling_price: number;

  /**
   * Discount allocated to this specific stock movement.
   * This is not necessarily the full order requirement discount.
   */
  discount_amount: number;

  gross_total_selling_price: number;
  total_selling_price: number;

  dimension_input: string | null;
  reason: string | null;
  recorded_by: string;
  production_folder_id: string | null;
  order_id: string | null;
  created_at: string;
}

export interface LowStockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minimum_quantity: number;
  unit_selling_price: number;
  total_selling_price: number;
}

export interface InventoryDashboard {
  total_items: number;
  total_stock_units: number;
  total_inventory_value: number;
  low_stock_items: number;
  categories: number;
}

// ============================================================
// PAGINATION
// ============================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================================
// INVENTORY PAYLOADS
// ============================================================

export interface InventoryCreatePayload {
  name: string;
  category: string;
  unit: string;
  quantity?: number;
  minimum_quantity?: number;
  unit_selling_price: number;
  description?: string;
}

export interface InventoryUpdatePayload {
  name?: string;
  category?: string;
  unit?: string;
  minimum_quantity?: number;
  unit_selling_price?: number;
  description?: string;
}

export interface StockMovementPayload {
  quantity: number;
  movement_type: MovementType;
  reason?: string;
  production_folder_id?: string;
  unit_selling_price?: number;
}

export interface ManualAdjustmentPayload {
  new_quantity: number;
  reason: string;
}

export interface ProductionConsumptionPayload {
  item_id: string;
  quantity: number;
  reason?: string;
}

// ============================================================
// ORDER MATERIAL REQUIREMENTS
// ============================================================

/**
 * Material requirement for an order.
 *
 * discount_amount is one fixed monetary discount
 * applied to the entire required material quantity.
 */
export interface OrderMaterialRequirement {
  id: string;
  order_id: string;
  inventory_item_id: string;

  required_quantity: number;
  consumed_quantity: number;
  remaining_quantity: number;

  unit_selling_price: number;

  /**
   * Overall fixed discount for this requirement.
   */
  discount_amount: number;

  /**
   * Cost before applying the overall discount.
   */
  gross_required_cost: number;

  /**
   * Discount allocated to already-consumed quantities.
   */
  consumed_discount: number;

  /**
   * Discount allocated to remaining quantities.
   */
  remaining_discount: number;

  /**
   * Total material cost after discount.
   */
  required_cost: number;

  /**
   * Cost attributable to consumed quantities.
   */
  consumed_cost: number;

  /**
   * Cost attributable to remaining quantities.
   */
  remaining_cost: number;

  dimension_input: string | null;

  created_at: string;
  updated_at: string;
}

/**
 * Payload for adding an additional material requirement
 * to an existing order.
 */
export interface OrderMaterialRequirementPayload {
  inventory_item_id: string;
  required_quantity: number;
  discount_amount?: number;
  dimension_input?: string;
}

/**
 * Calculated material summary for an order.
 */
export interface OrderMaterialCalculation {
  order_id: string;

  total_required_cost: number;
  total_consumed_cost: number;
  total_remaining_cost: number;

  /**
   * Sum of the overall discounts on all requirements.
   */
  total_discount: number;

  requirements: OrderMaterialRequirement[];
}

class InventoryService {
  async getItems(page = 1, limit = 10, search?: string) {
    return api.get<PaginatedResponse<InventoryItem>>("/inventory", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
      },
    });
  }

  async getDashboard() {
    return api.get<InventoryDashboard>("/inventory/dashboard/summary");
  }

  async getLowStock() {
    return api.get<LowStockItem[]>("/inventory/alerts/low-stock");
  }

  async createItem(data: InventoryCreatePayload) {
    return api.post<InventoryItem>("/inventory", data);
  }

  async updateItem(itemId: string, data: InventoryUpdatePayload) {
    return api.patch<InventoryItem>(`/inventory/${itemId}`, data);
  }

  async addStock(itemId: string, data: StockMovementPayload) {
    return api.post<StockMovement>(`/inventory/${itemId}/movement`, data);
  }

  async manualAdjustment(itemId: string, data: ManualAdjustmentPayload) {
    return api.post<StockMovement>(`/inventory/${itemId}/adjust`, data);
  }

  async getMovements(itemId: string, page = 1, limit = 10) {
    return api.get<PaginatedResponse<StockMovement>>(
      `/inventory/${itemId}/movements`,
      {
        params: { page, limit },
      },
    );
  }

  async consumeForProduction(
    folderId: string,
    data: ProductionConsumptionPayload,
  ) {
    return api.post<StockMovement>(
      `/inventory/production/${folderId}/consume`,
      data,
    );
  }

  async addOrderMaterialRequirement(
    orderId: string,
    data: OrderMaterialRequirementPayload,
  ) {
    return api.post<OrderMaterialRequirement>(
      `/inventory/orders/${orderId}/materials`,
      data,
    );
  }

  async getOrderMaterialCalculation(orderId: string) {
    return api.get<OrderMaterialCalculation>(
      `/inventory/orders/${orderId}/materials`,
    );
  }

  async consumeOrderMaterials(orderId: string) {
    return api.post<StockMovement[]>(
      `/inventory/orders/${orderId}/materials/consume`,
    );
  }

  async getOrderMovements(orderId: string, page = 1, limit = 10) {
    return api.get<PaginatedResponse<StockMovement>>(
      `/inventory/orders/${orderId}/movements`,
      {
        params: { page, limit },
      },
    );
  }
}

const inventoryService = new InventoryService();

export default inventoryService;
