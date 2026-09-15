import api from "./api";

export type MovementType = "STOCK_IN" | "STOCK_OUT";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minimum_quantity: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  item_id: string;
  quantity: number;
  movement_type: MovementType | "ADJUSTMENT";
  reason: string | null;
  recorded_by: string;
  production_folder_id: string | null;
  created_at: string;
}

export interface LowStockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minimum_quantity: number;
}

export interface InventoryDashboard {
  total_items: number;
  total_stock_units: number;
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
  description?: string;
}

export interface InventoryUpdatePayload {
  name?: string;
  category?: string;
  unit?: string;
  minimum_quantity?: number;
  description?: string;
}

export interface StockMovementPayload {
  quantity: number;
  movement_type: MovementType;
  reason?: string;
  production_folder_id?: string;
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
}

const inventoryService = new InventoryService();

export default inventoryService;
