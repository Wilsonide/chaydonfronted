export type OrderStatus =
  | "RECEIVED"
  | "REVIEWING"
  | "READY_FOR_PRODUCTION"
  | "IN_PRODUCTION"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export interface OrderFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customer: OrderCustomer;
  title: string;
  description: string | null;
  status: OrderStatus;
  total_amount: number;
  due_date: string | null;
  files: OrderFile[];
  created_at: string;
  updated_at: string;
}

export interface OrderCreatePayload {
  customer_id: string;
  title: string;
  description?: string;
  total_amount: number;
  due_date?: string;
}

export interface OrderUpdatePayload {
  title?: string;
  description?: string;
  status?: OrderStatus;
  total_amount?: number;
  due_date?: string;
}

export interface OrderListResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages?: number;
  };
}
