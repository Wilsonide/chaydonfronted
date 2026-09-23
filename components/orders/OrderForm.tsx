"use client";

import { FormEvent, useState } from "react";

import {
  CalendarDays,
  Check,
  ChevronRight,
  FilePenLine,
  Loader2,
  Printer,
  Upload,
} from "lucide-react";

import { toast } from "sonner";

import { Customer } from "@/components/customers/types";
import orderService from "@/app/services/order.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { CustomerSelector } from "./CustomerSelector";
import { OrderFileUpload } from "./OrderFileUpload";

interface OrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type OrderStep = "details" | "files";
type OrderType = "DESIGN" | "PRINT";

export function OrderForm({ onSuccess, onCancel }: OrderFormProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orderType, setOrderType] = useState<OrderType>("DESIGN");

  const [dueDate, setDueDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [creating, setCreating] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const [step, setStep] = useState<OrderStep>("details");

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!customer) {
      toast.error("Please select a customer");
      return;
    }

    if (!title.trim()) {
      toast.error("Order title is required");
      return;
    }

    const numericAmount = Number(amount || 0);

    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setCreating(true);

      const response = await orderService.createOrder({
        customer_id: customer.id,
        order_type: orderType,
        title: title.trim(),
        description: description.trim() || undefined,
        total_amount: numericAmount,
        due_date: dueDate || undefined,
      });

      setCreatedOrderId(response.data.id);
      setStep("files");

      toast.success("Order created successfully");
    } catch {
      toast.error("Unable to create order");
    } finally {
      setCreating(false);
    }
  };

  if (createdOrderId && step === "files") {
    return (
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>

            <span className="text-sm font-medium">Order details</span>
          </div>

          <div className="mx-3 h-px flex-1 bg-border" />

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
              2
            </div>

            <span className="text-sm font-medium">Reference files</span>
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border bg-muted/30 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Order created
              </p>

              <h3 className="mt-1 text-lg font-semibold">{title}</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {customer?.name}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
                {orderType === "DESIGN" ? (
                  <FilePenLine className="h-3.5 w-3.5" />
                ) : (
                  <Printer className="h-3.5 w-3.5" />
                )}

                {orderType === "DESIGN" ? "Design Order" : "Print Order"}
              </div>
            </div>

            <div className="rounded-lg bg-background px-3 py-2 text-right shadow-sm">
              <p className="text-xs text-muted-foreground">Total</p>

              <p className="font-semibold">
                ₦
                {Number(amount || 0).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* File upload section */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Add reference files</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Upload designs, images, PDFs, or other files needed to process
              this order.
            </p>
          </div>

          <OrderFileUpload
            orderId={createdOrderId}
            onUploaded={() => {
              // Keep the user on this step so
              // they can review the upload state.
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-5">
          <p className="text-xs text-muted-foreground">
            Reference files can also be added later.
          </p>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Skip for now
            </Button>

            <Button type="button" onClick={onSuccess}>
              Finish Order
              <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">
            1
          </div>

          <span className="text-sm font-medium">Order details</span>
        </div>

        <div className="mx-3 h-px flex-1 bg-border" />

        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border text-sm">
            2
          </div>

          <span className="text-sm">Reference files</span>
        </div>
      </div>

      {/* Customer */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">Customer</h3>

          <p className="text-sm text-muted-foreground">
            Select the customer placing this order.
          </p>
        </div>

        <CustomerSelector value={customer} onChange={setCustomer} />
      </div>

      {/* Order type */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">Order type</h3>

          <p className="text-sm text-muted-foreground">
            Choose whether this order requires design work or goes directly to
            printing.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Design order */}
          <button
            type="button"
            disabled={creating}
            onClick={() => setOrderType("DESIGN")}
            className={`rounded-xl border p-4 text-left transition ${
              orderType === "DESIGN"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  orderType === "DESIGN"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <FilePenLine className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Design Order</p>

                  {orderType === "DESIGN" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Requires graphic design work before the order can proceed to
                  printing.
                </p>
              </div>
            </div>
          </button>

          {/* Print order */}
          <button
            type="button"
            disabled={creating}
            onClick={() => setOrderType("PRINT")}
            className={`rounded-xl border p-4 text-left transition ${
              orderType === "PRINT"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  orderType === "PRINT"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Printer className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Print Order</p>

                  {orderType === "PRINT" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Goes directly to print production without the designer/task
                  workflow.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Order details */}
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold">Order details</h3>

          <p className="text-sm text-muted-foreground">
            Enter the customer&apos;s printing requirements.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order-title">Order Title</Label>

          <Input
            id="order-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Wedding Invitation Cards"
            disabled={creating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order-description">Requirements</Label>

          <Textarea
            id="order-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={
              orderType === "DESIGN"
                ? "Describe what the customer needs and any design requirements..."
                : "Describe the print specifications, quantity, size, paper/material, finishing, etc..."
            }
            rows={5}
            disabled={creating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order-amount">Total Amount</Label>

          <Input
            id="order-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            disabled={creating}
          />
        </div>
      </div>

      {/* Due date */}
      <div className="space-y-2">
        <Label htmlFor="order-due-date">Due Date</Label>

        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            id="order-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="pl-10"
            disabled={creating}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          When the customer expects the order to be ready.
        </p>
      </div>

      {/* Next step information */}
      <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
        <div className="rounded-md bg-background p-2">
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>

        <div>
          <p className="text-sm font-medium">Reference files</p>

          <p className="mt-1 text-xs text-muted-foreground">
            After creating the order, you&apos;ll be able to upload the
            customer&apos;s reference files.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={creating}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={creating}>
          {creating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ChevronRight className="mr-2 h-4 w-4" />
          )}

          {creating ? "Creating..." : "Create & Continue"}
        </Button>
      </div>
    </form>
  );
}
