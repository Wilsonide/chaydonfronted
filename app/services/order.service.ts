import api from "./api";

import {
  Order,
  OrderCreatePayload,
  OrderFile,
  OrderListResponse,
  OrderUpdatePayload,
} from "@/components/orders/types";

export type OrderType = "DESIGN" | "PRINT";

class OrderService {
  async getOrders(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
    orderType?: OrderType,
  ) {
    return api.get<OrderListResponse>("/orders", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(orderType ? { order_type: orderType } : {}),
      },
    });
  }

  async getOrder(orderId: string) {
    return api.get<Order>(`/orders/${orderId}`);
  }

  async createOrder(data: OrderCreatePayload) {
    return api.post<Order>("/orders", data);
  }

  async updateOrder(orderId: string, data: OrderUpdatePayload) {
    return api.patch<Order>(`/orders/${orderId}`, data);
  }

  async deleteOrder(orderId: string) {
    return api.delete(`/orders/${orderId}`);
  }

  async uploadOrderFile(orderId: string, file: File) {
    const formData = new FormData();

    formData.append("file", file);

    return api.post<OrderFile>(`/orders/${orderId}/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async deleteOrderFile(fileId: string) {
    return api.delete(`/orders/files/${fileId}`);
  }
}

const orderService = new OrderService();

export default orderService;
