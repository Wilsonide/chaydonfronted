"use client";

import { useEffect, useState } from "react";

import { FileText, Loader2, Receipt } from "lucide-react";

import { toast } from "sonner";

import customerService from "@/app/services/customer.service";
import invoiceService from "@/app/services/invoice.service";

import { Customer, CustomerOrder } from "@/components/customers/types";

import { InvoiceCreatePayload } from "./types";

import { CustomerSelector } from "@/components/orders/CustomerSelector";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const [loadingOrders, setLoadingOrders] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState("");

  const [subtotal, setSubtotal] = useState("");

  const [discount, setDiscount] = useState("");

  const [tax, setTax] = useState("");

  const [creating, setCreating] = useState(false);

  const handleCustomerChange = (nextCustomer: Customer | null) => {
    setCustomer(nextCustomer);
    setOrders([]);
    setSelectedOrderId("");
    setSubtotal("");
    setDiscount("");
    setTax("");
  };

  useEffect(() => {
    if (!customer) {
      return;
    }

    const loadOrders = async () => {
      try {
        setLoadingOrders(true);

        const response = await customerService.getCustomerOrders(customer.id);

        setOrders(response.data);
      } catch {
        toast.error("Unable to load customer orders");

        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [customer]);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;

  const handleOrderChange = (orderId: string | null) => {
    setSelectedOrderId(orderId ?? "");

    if (!orderId) {
      setSubtotal("");
      return;
    }

    const order = orders.find((item) => item.id === orderId);
    setSubtotal(order ? String(order.total_amount) : "");
  };

  const subtotalValue = Number(subtotal) || 0;
  const discountValue = Number(discount) || 0;
  const taxValue = Number(tax) || 0;

  const total = subtotalValue - discountValue + taxValue;

  const handleSubmit = async () => {
    if (!customer) {
      toast.error("Please select a customer");
      return;
    }

    if (!selectedOrderId) {
      toast.error("Please select an order");
      return;
    }

    if (!subtotal.trim()) {
      toast.error("Subtotal is required");
      return;
    }

    if (Number.isNaN(subtotalValue)) {
      toast.error("Enter a valid subtotal");
      return;
    }

    if (subtotalValue < 0) {
      toast.error("Subtotal cannot be negative");
      return;
    }

    if (Number.isNaN(discountValue)) {
      toast.error("Enter a valid discount");
      return;
    }

    if (discountValue < 0) {
      toast.error("Discount cannot be negative");
      return;
    }

    if (Number.isNaN(taxValue)) {
      toast.error("Enter a valid tax amount");
      return;
    }

    if (taxValue < 0) {
      toast.error("Tax cannot be negative");
      return;
    }

    if (total < 0) {
      toast.error("Invoice total cannot be negative");
      return;
    }

    const payload: InvoiceCreatePayload = {
      order_id: selectedOrderId,
      subtotal: subtotalValue,
      discount: discountValue,
      tax: taxValue,
    };

    try {
      setCreating(true);

      await invoiceService.createInvoice(payload);

      toast.success("Invoice created successfully");

      onSuccess();
    } catch {
      toast.error("Unable to create invoice");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <CustomerSelector value={customer} onChange={handleCustomerChange} />

      {customer && (
        <div className="space-y-2">
          <Label htmlFor="invoice-order">Order</Label>

          {loadingOrders ? (
            <div className="flex h-10 items-center justify-center rounded-md border">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <Receipt className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-2 text-sm font-medium">No orders found</p>

              <p className="mt-1 text-xs text-muted-foreground">
                This customer does not have any orders yet.
              </p>
            </div>
          ) : (
            <Select
              value={selectedOrderId}
              onValueChange={handleOrderChange}
              disabled={creating}
            >
              <SelectTrigger id="invoice-order">
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>

              <SelectContent>
                {orders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {selectedOrder && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Selected Order</p>

              <p className="mt-1 font-medium">{selectedOrder.title}</p>

              <p className="mt-1 break-all text-xs text-muted-foreground">
                {selectedOrder.id}
              </p>
            </div>

            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          </div>
        </div>
      )}

      {selectedOrderId && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="invoice-subtotal">Subtotal</Label>

              <Input
                id="invoice-subtotal"
                type="number"
                min="0"
                step="0.01"
                value={subtotal}
                onChange={(event) => setSubtotal(event.target.value)}
                placeholder="0.00"
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-discount">Discount</Label>

              <Input
                id="invoice-discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                placeholder="0.00"
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-tax">Tax</Label>

              <Input
                id="invoice-tax"
                type="number"
                min="0"
                step="0.01"
                value={tax}
                onChange={(event) => setTax(event.target.value)}
                placeholder="0.00"
                disabled={creating}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Invoice Total
              </span>

              <span className="text-xl font-bold">{formatAmount(total)}</span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Total = subtotal − discount + tax
            </p>
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={creating}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={creating || !customer || !selectedOrderId}
        >
          {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {creating ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </div>
  );
}
