"use client";

import { useCallback, useEffect, useState } from "react";

import { Plus, RefreshCw } from "lucide-react";

import { toast } from "sonner";

import customerService from "@/app/services/customer.service";

import {
  Customer,
  CustomerBalance,
  CustomerDetailsModal,
  CustomerForm,
  CustomerFormModal,
  CustomerPagination,
  CustomerSearch,
  CustomerSummary,
  CustomerTable,
  CustomerOrder,
  emptyCustomerForm,
} from "@/components/customers";

export default function FrontDeskCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const limit = 10;

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CustomerForm>(emptyCustomerForm);

  const [showFormModal, setShowFormModal] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);

  const [customerBalance, setCustomerBalance] =
    useState<CustomerBalance | null>(null);

  const [loadingDetails, setLoadingDetails] = useState(false);

  const [loadingBalance, setLoadingBalance] = useState(false);

  const loadCustomers = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await customerService.getCustomers(
          page,
          limit,
          search,
        );

        setCustomers(response.data.data);

        setTotal(response.data.meta.total);
      } catch (error) {
        console.error("Failed to load customers:", error);

        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search],
  );

  useEffect(() => {
    Promise.resolve().then(() => loadCustomers());
  }, [loadCustomers]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleOpenCreate() {
    setEditingCustomer(null);
    setForm(emptyCustomerForm);
    setShowFormModal(true);
  }

  function handleOpenEdit(customer: Customer) {
    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });

    setShowFormModal(true);
  }

  function handleFormChange(field: keyof CustomerForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Customer name and phone are required");

      return;
    }

    try {
      setSaving(true);

      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          address: form.address.trim() || undefined,
          notes: form.notes.trim() || undefined,
        });

        toast.success("Customer updated successfully");
      } else {
        await customerService.createCustomer(form);

        toast.success("Customer created successfully");
      }

      setShowFormModal(false);
      setEditingCustomer(null);
      setForm(emptyCustomerForm);

      await loadCustomers(true);
    } catch (error) {
      console.error("Failed to save customer:", error);

      toast.error(
        editingCustomer
          ? "Failed to update customer"
          : "Failed to create customer",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleView(customer: Customer) {
    setSelectedCustomer(customer);
    setCustomerOrders([]);
    setCustomerBalance(null);
    setLoadingDetails(true);
    setLoadingBalance(true);

    try {
      const [ordersResponse, balanceResponse] = await Promise.all([
        customerService.getCustomerOrders(customer.id),
        customerService.getCustomerBalance(customer.id),
      ]);

      setCustomerOrders(ordersResponse.data);

      setCustomerBalance(balanceResponse.data);
    } catch (error) {
      console.error("Failed to load customer details:", error);

      toast.error("Failed to load customer details");
    } finally {
      setLoadingDetails(false);
      setLoadingBalance(false);
    }
  }

  function handleCloseDetails() {
    setSelectedCustomer(null);
    setCustomerOrders([]);
    setCustomerBalance(null);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customers and view their order history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadCustomers(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      <CustomerSummary totalCustomers={total} />

      <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <CustomerSearch value={search} onChange={handleSearch} />

        <p className="text-sm text-gray-500">
          {total} {total === 1 ? "customer" : "customers"}
        </p>
      </div>

      <CustomerTable
        customers={customers}
        loading={loading}
        onView={handleView}
        onEdit={handleOpenEdit}
      />

      {!loading && (
        <CustomerPagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
        />
      )}

      <CustomerFormModal
        open={showFormModal}
        onClose={() => {
          if (!saving) {
            setShowFormModal(false);
          }
        }}
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
        description={
          editingCustomer
            ? "Update the customer's information."
            : "Create a new customer record."
        }
        form={form}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editingCustomer ? "Update Customer" : "Create Customer"}
      />

      <CustomerDetailsModal
        open={Boolean(selectedCustomer)}
        onClose={handleCloseDetails}
        customer={selectedCustomer}
        orders={customerOrders}
        balance={customerBalance}
        loadingOrders={loadingDetails}
        loadingBalance={loadingBalance}
      />
    </div>
  );
}
