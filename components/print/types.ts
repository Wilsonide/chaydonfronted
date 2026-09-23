export type PrintOrderStatus =
  | "RECEIVED"
  | "REVIEWING"
  | "READY_FOR_PRODUCTION"
  | "IN_PRODUCTION"
  | "COMPLETED"
  | "CANCELLED";

export interface PrintOrder {
  id: string;
  customer_id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  order_type: "PRINT";
  title: string;
  description: string | null;
  status: PrintOrderStatus;
  total_amount: number;
  due_date: string | null;
  files: {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string | null;
    uploaded_by: string;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
}
