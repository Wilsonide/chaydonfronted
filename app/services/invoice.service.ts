import api from "./api";

import {
  Invoice,
  InvoiceCreatePayload,
  InvoiceListResponse,
} from "@/components/invoices/types";

class InvoiceService {
  async getInvoices(page = 1, limit = 10, search?: string) {
    return api.get<InvoiceListResponse>("/invoices", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
      },
    });
  }

  async createInvoice(data: InvoiceCreatePayload) {
    return api.post<Invoice>("/invoices", data);
  }

  async getInvoice(invoiceId: string) {
    return api.get<Invoice>(`/invoices/${invoiceId}`);
  }

  async getInvoiceByOrder(orderId: string) {
    return api.get<Invoice>(`/invoices/order/${orderId}`);
  }
}

const invoiceService = new InvoiceService();

export default invoiceService;
