export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "POS" | "OTHER";

export interface PaymentCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

export interface PaymentOrder {
  id: string;
  title: string;
  customer: PaymentCustomer;
}

export interface PaymentRecorder {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Payment {
  id: string;
  order_id: string;
  invoice_id: string;

  order: PaymentOrder;
  recorder: PaymentRecorder;

  amount: number;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;

  recorded_by: string;
  created_at: string;
}

export interface PaymentCreatePayload {
  order_id: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface PaymentListResponse {
  data: Payment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages?: number;
  };
}

export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "VOID";

export interface OrderPaymentSummary {
  order_id: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: InvoiceStatus;
}
