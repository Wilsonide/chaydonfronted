"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  Receipt,
  Search,
} from "lucide-react";

import { toast } from "sonner";

import orderService from "@/app/services/order.service";
import paymentService from "@/app/services/payment.service";

import {
  PaymentCreatePayload,
  PaymentMethod,
  OrderPaymentSummary,
} from "./types";

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

import { Textarea } from "@/components/ui/textarea";

import { Order } from "@/components/orders/types";

interface PaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const paymentMethods: {
  value: PaymentMethod;
  label: string;
}[] = [
  {
    value: "CASH",
    label: "Cash",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
  {
    value: "POS",
    label: "POS",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function getStatusLabel(status: OrderPaymentSummary["status"]) {
  switch (status) {
    case "PAID":
      return "Paid";

    case "PARTIALLY_PAID":
      return "Partially Paid";

    case "UNPAID":
      return "Unpaid";

    case "VOID":
      return "Void";

    default:
      return status;
  }
}

function getOrderStatusLabel(status: Order["status"]) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loadingOrders, setLoadingOrders] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState("");

  const [orderSearch, setOrderSearch] = useState("");

  const [summary, setSummary] = useState<OrderPaymentSummary | null>(null);

  const [loadingSummary, setLoadingSummary] = useState(false);

  const [amount, setAmount] = useState("");

  const [method, setMethod] = useState<PaymentMethod>("CASH");

  const [reference, setReference] = useState("");

  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoadingOrders(true);

        const response = await orderService.getOrders(1, 100);

        setOrders(response.data.data);

        setSelectedOrderId("");
        setSummary(null);
        setAmount("");
      } catch (error) {
        console.error("Failed to load orders:", error);

        toast.error("Unable to load orders");

        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrderId) {
      return;
    }

    const loadSummary = async () => {
      try {
        setLoadingSummary(true);

        const response = await paymentService.getOrderSummary(selectedOrderId);

        setSummary(response.data);

        if (response.data.balance > 0) {
          setAmount(String(response.data.balance));
        } else {
          setAmount("");
        }
      } catch (error) {
        console.error("Failed to load payment summary:", error);

        setSummary(null);
        setAmount("");

        toast.error(
          "Unable to load payment summary. Make sure the order has an invoice.",
        );
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [selectedOrderId]);

  const filteredOrders = useMemo(() => {
    const search = orderSearch.trim().toLowerCase();

    if (!search) {
      return orders;
    }

    return orders.filter((order) => {
      const title = order.title.toLowerCase();

      const customerName = order.customer?.name?.toLowerCase() ?? "";

      const customerPhone = order.customer?.phone?.toLowerCase() ?? "";

      const orderId = order.id.toLowerCase();

      return (
        title.includes(search) ||
        customerName.includes(search) ||
        customerPhone.includes(search) ||
        orderId.includes(search)
      );
    });
  }, [orders, orderSearch]);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;

  const handleOrderChange = (orderId: string | null) => {
    setSelectedOrderId(orderId ?? "");
    setOrderSearch("");
    setSummary(null);
    setAmount("");
  };

  const handleSubmit = async () => {
    if (!selectedOrderId) {
      toast.error("Please select an order");
      return;
    }

    if (!summary) {
      toast.error("Payment summary is not available");
      return;
    }

    if (summary.balance <= 0) {
      toast.error("This order has no outstanding balance");
      return;
    }

    const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount)) {
      toast.error("Enter a valid payment amount");
      return;
    }

    if (numericAmount <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }

    if (numericAmount > summary.balance) {
      toast.error(
        `Payment cannot exceed the outstanding balance of ${formatAmount(
          summary.balance,
        )}`,
      );
      return;
    }

    const payload: PaymentCreatePayload = {
      order_id: selectedOrderId,
      amount: numericAmount,
      method,
      ...(reference.trim()
        ? {
            reference: reference.trim(),
          }
        : {}),
      ...(notes.trim()
        ? {
            notes: notes.trim(),
          }
        : {}),
    };

    try {
      setSubmitting(true);

      await paymentService.createPayment(payload);

      toast.success("Payment recorded successfully");

      onSuccess();
    } catch (error) {
      console.error("Failed to record payment:", error);

      toast.error("Unable to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Selection */}
      <div className="space-y-2">
        <Label htmlFor="payment-order">Order</Label>

        {loadingOrders ? (
          <div className="flex h-10 items-center justify-center rounded-md border">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />

            <span className="ml-2 text-sm text-muted-foreground">
              Loading orders...
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <Receipt className="mx-auto h-8 w-8 text-muted-foreground" />

            <p className="mt-2 text-sm font-medium">No orders found</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Create an order before recording a payment.
            </p>
          </div>
        ) : (
          <Select
            value={selectedOrderId}
            onValueChange={handleOrderChange}
            disabled={submitting}
          >
            <SelectTrigger id="payment-order">
              <SelectValue placeholder="Select an order" />
            </SelectTrigger>

            <SelectContent>
              <div
                className="sticky top-0 z-10 border-b bg-popover p-2"
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={orderSearch}
                    onChange={(event) => setOrderSearch(event.target.value)}
                    onKeyDown={(event) => event.stopPropagation()}
                    placeholder="Search orders..."
                    className="h-9 pl-9"
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No matching orders found.
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    <div className="flex min-w-0 flex-col py-0.5">
                      <span className="truncate font-medium">
                        {order.title}
                      </span>

                      <span className="truncate text-xs text-muted-foreground">
                        {order.customer?.name || "Unknown customer"}
                        {" • "}
                        {formatAmount(order.total_amount)}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Selected Order */}
      {selectedOrder && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Selected Order</p>

              <p className="mt-1 font-medium">{selectedOrder.title}</p>

              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Customer:</span>{" "}
                  <span className="font-medium">
                    {selectedOrder.customer?.name || "Unknown customer"}
                  </span>
                </p>

                {selectedOrder.customer?.phone && (
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    {selectedOrder.customer.phone}
                  </p>
                )}

                <p>
                  <span className="text-muted-foreground">Order total:</span>{" "}
                  <span className="font-medium">
                    {formatAmount(selectedOrder.total_amount)}
                  </span>
                </p>

                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="font-medium">
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
                </p>
              </div>

              <p className="mt-2 break-all text-xs text-muted-foreground">
                {selectedOrder.id}
              </p>
            </div>

            <Receipt className="h-5 w-5 shrink-0 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Payment Summary */}
      {loadingSummary && (
        <div className="flex items-center justify-center rounded-lg border p-6">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />

          <span className="text-sm text-muted-foreground">
            Loading payment summary...
          </span>
        </div>
      )}

      {summary && !loadingSummary && (
        <div className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Payment Summary</p>

              <p className="text-xs text-muted-foreground">
                Current financial state for this order
              </p>
            </div>

            {summary.status === "PAID" && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Total</p>

              <p className="mt-1 font-semibold">
                {formatAmount(summary.total_amount)}
              </p>
            </div>

            <div className="rounded-md bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Paid</p>

              <p className="mt-1 font-semibold">
                {formatAmount(summary.amount_paid)}
              </p>
            </div>

            <div className="rounded-md bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Balance</p>

              <p className="mt-1 font-semibold">
                {formatAmount(summary.balance)}
              </p>
            </div>
          </div>

          <div className="mt-3 text-sm">
            Status:{" "}
            <span className="font-medium">
              {getStatusLabel(summary.status)}
            </span>
          </div>
        </div>
      )}

      {/* Payment Fields */}
      {summary && summary.status !== "PAID" && summary.status !== "VOID" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Amount</Label>

            <Input
              id="payment-amount"
              type="number"
              min="0.01"
              max={summary.balance}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              disabled={submitting || loadingSummary}
            />

            <p className="text-xs text-muted-foreground">
              Outstanding balance: {formatAmount(summary.balance)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>

            <Select
              value={method}
              onValueChange={(value) => setMethod(value as PaymentMethod)}
              disabled={submitting}
            >
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>

              <SelectContent>
                {paymentMethods.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-reference">
              Reference
              <span className="ml-1 text-muted-foreground">(optional)</span>
            </Label>

            <Input
              id="payment-reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Transaction reference"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">
              Notes
              <span className="ml-1 text-muted-foreground">(optional)</span>
            </Label>

            <Textarea
              id="payment-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any relevant payment notes..."
              rows={4}
              disabled={submitting}
            />
          </div>
        </>
      )}

      {/* Paid / Void Message */}
      {summary && (summary.status === "PAID" || summary.status === "VOID") && (
        <div className="rounded-lg border bg-muted/30 p-4 text-center">
          <p className="font-medium">
            {summary.status === "PAID"
              ? "This order is fully paid."
              : "This invoice is void."}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            No payment can be recorded for this order.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={
            submitting ||
            !selectedOrderId ||
            !summary ||
            summary.balance <= 0 ||
            summary.status === "VOID" ||
            summary.status === "PAID"
          }
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {submitting ? "Recording..." : "Record Payment"}
        </Button>
      </div>
    </div>
  );
}
