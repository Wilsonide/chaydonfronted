import api from "./api";

import {
  Customer,
  CustomerBalance,
  CustomerForm,
  CustomerOrder,
} from "@/components/customers/types";

export interface CustomerListResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages?: number;
  };
}

export interface CustomerUpdatePayload {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

class CustomerService {
  async getCustomers(page = 1, limit = 10, search?: string) {
    return api.get<CustomerListResponse>("/customers", {
      params: {
        page,
        limit,
        ...(search
          ? {
              search,
            }
          : {}),
      },
    });
  }

  async getCustomer(customerId: string) {
    return api.get<Customer>(`/customers/${customerId}`);
  }

  async createCustomer(data: CustomerForm) {
    return api.post<Customer>("/customers", {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
    });
  }

  async updateCustomer(customerId: string, data: CustomerUpdatePayload) {
    return api.patch<Customer>(`/customers/${customerId}`, data);
  }

  async getCustomerOrders(customerId: string) {
    return api.get<CustomerOrder[]>(`/customers/${customerId}/orders`);
  }

  async getCustomerBalance(customerId: string) {
    return api.get<CustomerBalance>(`/customers/${customerId}/balance`);
  }
}

const customerService = new CustomerService();

export default customerService;
