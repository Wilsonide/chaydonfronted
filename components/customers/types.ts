export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface CustomerOrder {
  id: string;
  customer_id: string;
  title: string;
  description: string | null;
  status:
    | "RECEIVED"
    | "REVIEWING"
    | "READY_FOR_PRODUCTION"
    | "IN_PRODUCTION"
    | "COMPLETED"
    | "CANCELLED";
  total_amount: number;
  amount_paid: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export type CustomerBalanceStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "VOID";

export interface CustomerBalance {
  customer_id: string;
  total_orders: number;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: CustomerBalanceStatus;
}

export const emptyCustomerForm: CustomerForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};
