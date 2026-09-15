import api from "./api";

import {
  OrderPaymentSummary,
  Payment,
  PaymentCreatePayload,
  PaymentListResponse,
} from "@/components/payments/types";

class PaymentService {
  async getPayments(page = 1, limit = 10, search?: string) {
    return api.get<PaymentListResponse>("/payments", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
      },
    });
  }

  async createPayment(data: PaymentCreatePayload) {
    return api.post<Payment>("/payments", data);
  }

  async getOrderPayments(orderId: string) {
    return api.get<Payment[]>(`/payments/order/${orderId}`);
  }

  async getOrderSummary(orderId: string) {
    return api.get<OrderPaymentSummary>(`/payments/order/${orderId}/summary`);
  }

  async downloadInvoice(invoiceId: string) {
    return api.get(`/payments/invoice/${invoiceId}/download`, {
      responseType: "blob",
    });
  }
}

const paymentService = new PaymentService();

export default paymentService;
