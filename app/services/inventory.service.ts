import api from "./api";

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
  total_selling_price: number;
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

/**
 * Material requirement for a PRINT order.
 */
export interface OrderMaterialRequirement {
  id: string;
  order_id: string;
  inventory_item_id: string;
  required_quantity: number;
  consumed_quantity: number;
  remaining_quantity: number;
  unit_selling_price: number;
  required_cost: number;
  consumed_cost: number;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for adding a material requirement to a PRINT order.
 */
export interface OrderMaterialRequirementPayload {
  inventory_item_id: string;
  required_quantity: number;
}

/**
 * Calculated material summary for a PRINT order.
 */
export interface OrderMaterialCalculation {
  order_id: string;
  total_required_cost: number;
  total_consumed_cost: number;
  total_remaining_cost: number;
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
        params: {
          page,
          limit,
        },
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

  /**
   * Add a material requirement to a PRINT order.
   */
  async addOrderMaterialRequirement(
    orderId: string,
    data: OrderMaterialRequirementPayload,
  ) {
    return api.post<OrderMaterialRequirement>(
      `/inventory/orders/${orderId}/materials`,
      data,
    );
  }

  /**
   * Get calculated material requirements and costs
   * for a PRINT order.
   */
  async getOrderMaterialCalculation(orderId: string) {
    return api.get<OrderMaterialCalculation>(
      `/inventory/orders/${orderId}/materials`,
    );
  }

  /**
   * Consume all remaining material requirements
   * for a PRINT order.
   */
  async consumeOrderMaterials(orderId: string) {
    return api.post<StockMovement[]>(
      `/inventory/orders/${orderId}/materials/consume`,
    );
  }

  /**
   * Get all inventory movements associated with
   * a particular order.
   */
  async getOrderMovements(orderId: string, page = 1, limit = 10) {
    return api.get<PaginatedResponse<StockMovement>>(
      `/inventory/orders/${orderId}/movements`,
      {
        params: {
          page,
          limit,
        },
      },
    );
  }
}

const inventoryService = new InventoryService();

export default inventoryService;
