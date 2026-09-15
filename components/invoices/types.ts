export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "VOID";

export interface InvoiceCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

export interface InvoiceOrder {
  id: string;
  title: string;
  customer: InvoiceCustomer;
}

export interface Invoice {
  id: string;
  order_id: string;
  order: InvoiceOrder;

  subtotal: number;
  discount: number;
  tax: number;

  total_amount: number;
  amount_paid: number;
  balance_due: number;

  status: InvoiceStatus;
}

export interface InvoiceCreatePayload {
  order_id: string;
  subtotal: number;
  discount?: number;
  tax?: number;
}

export interface InvoiceListResponse {
  data: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages?: number;
  };
}
