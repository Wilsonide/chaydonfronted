/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  ChevronRight,
  FilePenLine,
  Loader2,
  Minus,
  Package,
  Plus,
  Printer,
  Search,
  Trash2,
  Upload,
} from "lucide-react";

import { toast } from "sonner";

import type { Customer } from "@/components/customers/types";
import type { InventoryItem } from "@/app/services/inventory.service";

import orderService from "@/app/services/order.service";
import inventoryService from "@/app/services/inventory.service";

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

interface SelectedInventoryItem {
  inventory_item_id: string;
  input_quantity: string;
}

function calculatePreview(unit: string, inputQuantity: string): number | null {
  const value = inputQuantity.trim();

  if (!value) {
    return null;
  }

  if (/^\d+$/.test(value)) {
    const quantity = Number(value);

    return quantity > 0 ? quantity : null;
  }

  const match = value.match(
    /^\s*(\d+(?:\.\d+)?)\s*(?:\*|x|X|×)\s*(\d+(?:\.\d+)?)\s*$/,
  );

  if (!match) {
    return null;
  }

  const normalizedUnit = unit.trim().toLowerCase();

  if (!["feet", "foot", "ft"].includes(normalizedUnit)) {
    return null;
  }

  const calculated = Number(match[1]) * Number(match[2]);

  if (!Number.isFinite(calculated) || calculated <= 0) {
    return null;
  }

  return calculated;
}

export default function OrderForm({ onSuccess, onCancel }: OrderFormProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [orderType, setOrderType] = useState<"DESIGN" | "PRINT">("DESIGN");

  const [dueDate, setDueDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [creating, setCreating] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [step, setStep] = useState<"details" | "files">("details");

  // Inventory
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventorySearch, setInventorySearch] = useState("");
  const [selectedInventory, setSelectedInventory] = useState<
    SelectedInventoryItem[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    const loadInventory = async () => {
      try {
        setInventoryLoading(true);

        const response = await inventoryService.getItems(1, 100);

        if (!cancelled) {
          setInventoryItems(response.data.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load inventory:", error);

          toast.error(
            "Unable to load inventory. You can still create the order without materials.",
          );
        }
      } finally {
        if (!cancelled) {
          setInventoryLoading(false);
        }
      }
    };

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInventory = useMemo(() => {
    const search = inventorySearch.trim().toLowerCase();

    if (!search) {
      return inventoryItems;
    }

    return inventoryItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.unit.toLowerCase().includes(search)
      );
    });
  }, [inventoryItems, inventorySearch]);

  const selectedItemIds = useMemo(() => {
    return new Set(selectedInventory.map((item) => item.inventory_item_id));
  }, [selectedInventory]);

  const getInventoryItem = (itemId: string) => {
    return inventoryItems.find((item) => item.id === itemId);
  };

  const addInventoryItem = (item: InventoryItem) => {
    if (selectedItemIds.has(item.id)) {
      return;
    }

    setSelectedInventory((current) => [
      ...current,
      {
        inventory_item_id: item.id,
        input_quantity: "",
      },
    ]);
  };

  const removeInventoryItem = (itemId: string) => {
    setSelectedInventory((current) =>
      current.filter((item) => item.inventory_item_id !== itemId),
    );
  };

  const updateInventoryQuantity = (itemId: string, inputQuantity: string) => {
    setSelectedInventory((current) =>
      current.map((item) =>
        item.inventory_item_id === itemId
          ? {
              ...item,
              input_quantity: inputQuantity,
            }
          : item,
      ),
    );
  };

  const validateInventory = () => {
    for (const selected of selectedInventory) {
      const item = getInventoryItem(selected.inventory_item_id);

      if (!item) {
        toast.error(
          "One of the selected inventory items is no longer available.",
        );
        return false;
      }

      const input = selected.input_quantity.trim();

      if (!input) {
        toast.error(`Enter a quantity for "${item.name}".`);
        return false;
      }

      const preview = calculatePreview(item.unit, input);

      const isPlainNumber = /^\d+$/.test(input);

      if (preview === null && !isPlainNumber) {
        if (["feet", "foot", "ft"].includes(item.unit.trim().toLowerCase())) {
          toast.error(
            `Invalid quantity for "${item.name}". Use a value such as 12 or 3*4.`,
          );
        } else {
          toast.error(
            `Invalid quantity for "${item.name}". Enter a whole number.`,
          );
        }

        return false;
      }

      if (preview !== null && !Number.isInteger(preview)) {
        toast.error(
          `"${input}" results in ${preview} ${item.unit}. Inventory quantities must currently be whole numbers.`,
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customer) {
      toast.error("Please select a customer.");
      return;
    }

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      toast.error("Please enter an order title.");
      return;
    }

    const numericAmount = Number(amount);

    if (!amount.trim() || !Number.isFinite(numericAmount)) {
      toast.error("Please enter a valid order amount.");
      return;
    }

    if (numericAmount < 0) {
      toast.error("Order amount cannot be negative.");
      return;
    }

    if (!validateInventory()) {
      return;
    }

    try {
      setCreating(true);

      const response = await orderService.createOrder({
        customer_id: customer.id,
        order_type: orderType,
        title: trimmedTitle,
        description: description.trim() || undefined,
        total_amount: numericAmount,
        due_date: dueDate || undefined,

        inventory_items:
          selectedInventory.length > 0
            ? selectedInventory.map((item) => ({
                inventory_item_id: item.inventory_item_id,
                input_quantity: item.input_quantity.trim(),
              }))
            : undefined,
      });

      setCreatedOrderId(response.data.id);

      toast.success("Order created successfully.");

      setStep("files");
    } catch (error: any) {
      console.error("Failed to create order:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to create order. Please try again.";

      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleFinish = () => {
    onSuccess();
  };

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="mb-6 flex items-center justify-center">
        <div className="flex items-center">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
              step === "details"
                ? "bg-blue-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {step === "details" ? "1" : <Check className="h-4 w-4" />}
          </div>

          <div
            className={`h-px w-20 sm:w-28 ${
              step === "files" ? "bg-green-600" : "bg-gray-200"
            }`}
          />

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
              step === "files"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {step === "details" ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer */}
          <div className="space-y-2">
            <Label>
              Customer <span className="text-red-500">*</span>
            </Label>

            <CustomerSelector value={customer} onChange={setCustomer} />
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <Label>
              Order Type <span className="text-red-500">*</span>
            </Label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType("DESIGN")}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  orderType === "DESIGN"
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    orderType === "DESIGN"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <FilePenLine className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-medium text-gray-900">Design</p>
                  <p className="text-xs text-gray-500">Custom design work</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType("PRINT")}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  orderType === "PRINT"
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    orderType === "PRINT"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Printer className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-medium text-gray-900">Print</p>
                  <p className="text-xs text-gray-500">Printing production</p>
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="order-title">
              Order Title <span className="text-red-500">*</span>
            </Label>

            <Input
              id="order-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. 6-seater sofa reupholstery"
              maxLength={200}
            />
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="order-description">
              Requirements / Description
            </Label>

            <Textarea
              id="order-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the customer's requirements..."
              rows={4}
            />
          </div>

          {/* Inventory / Materials */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Package className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Materials / Inventory
                  </h3>

                  <p className="mt-0.5 text-sm text-gray-500">
                    Select materials that will be used for this order. Stock is
                    deducted immediately when the order is created.
                  </p>
                </div>
              </div>

              {selectedInventory.length > 0 && (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {selectedInventory.length} selected
                </span>
              )}
            </div>

            {/* Inventory search */}
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <Input
                value={inventorySearch}
                onChange={(event) => setInventorySearch(event.target.value)}
                placeholder="Search materials by name, category or unit..."
                className="pl-9"
              />
            </div>

            {/* Inventory list */}
            <div className="rounded-xl border border-gray-200 bg-white">
              {inventoryLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading inventory...
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />

                  <p className="text-sm font-medium text-gray-700">
                    No inventory items found
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Try another search.
                  </p>
                </div>
              ) : (
                <div className="max-h-64 divide-y divide-gray-100 overflow-y-auto">
                  {filteredInventory.map((item) => {
                    const selected = selectedItemIds.has(item.id);
                    const outOfStock = item.quantity <= 0;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {item.name}
                            </p>

                            {outOfStock && (
                              <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                                Out of stock
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {item.category} · {item.quantity} {item.unit}{" "}
                            available
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant={selected ? "secondary" : "outline"}
                          size="sm"
                          disabled={selected || outOfStock}
                          onClick={() => addInventoryItem(item)}
                          className="shrink-0"
                        >
                          {selected ? (
                            <>
                              <Check className="mr-1.5 h-4 w-4" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="mr-1.5 h-4 w-4" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected inventory */}
            {selectedInventory.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-800">
                  Selected materials
                </p>

                {selectedInventory.map((selected) => {
                  const item = getInventoryItem(selected.inventory_item_id);

                  if (!item) {
                    return null;
                  }

                  const preview = calculatePreview(
                    item.unit,
                    selected.input_quantity,
                  );

                  const isDimensionUnit = ["feet", "foot", "ft"].includes(
                    item.unit.trim().toLowerCase(),
                  );

                  return (
                    <div
                      key={selected.inventory_item_id}
                      className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            Available: {item.quantity} {item.unit}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Input
                              value={selected.input_quantity}
                              onChange={(event) =>
                                updateInventoryQuantity(
                                  selected.inventory_item_id,
                                  event.target.value,
                                )
                              }
                              placeholder={
                                isDimensionUnit ? "e.g. 3*4" : "e.g. 12"
                              }
                              className="w-32 pr-12"
                            />

                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                              input
                            </span>
                          </div>

                          <span className="text-sm text-gray-500">
                            {item.unit}
                          </span>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeInventoryItem(selected.inventory_item_id)
                            }
                            className="text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Calculation preview */}
                      {selected.input_quantity.trim() && (
                        <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs">
                          {preview !== null ? (
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-gray-500">
                                Calculated quantity
                              </span>

                              <span className="font-semibold text-gray-900">
                                {preview} {item.unit}
                              </span>
                            </div>
                          ) : isDimensionUnit &&
                            selected.input_quantity.includes("*") ? (
                            <span className="text-amber-600">
                              Enter dimensions such as 3*4 to calculate the
                              required quantity.
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              Enter a valid quantity.
                            </span>
                          )}
                        </div>
                      )}

                      {/* Helpful feet example */}
                      {isDimensionUnit && !selected.input_quantity.trim() && (
                        <p className="mt-2 text-xs text-gray-500">
                          Example: enter{" "}
                          <span className="font-medium text-gray-700">3*4</span>{" "}
                          to use 12 {item.unit}.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedInventory.length === 0 && !inventoryLoading && (
              <div className="mt-3 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-center text-xs text-gray-500">
                No materials selected. You can create the order without
                inventory consumption.
              </div>
            )}
          </div>

          {/* Amount + Due Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order-amount">
                Total Amount <span className="text-red-500">*</span>
              </Label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  ₦
                </span>

                <Input
                  id="order-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-due-date">Due Date</Label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <Input
                  id="order-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Inventory transaction notice */}
          {selectedInventory.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <Check className="h-4 w-4 text-blue-600" />
                </div>

                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Inventory will be deducted when this order is created
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    The selected materials and their calculated quantities will
                    be processed together with the order. If there is
                    insufficient stock, the order will not be created.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  Create Order
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Success */}
          <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Check className="h-7 w-7 text-green-600" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Order created successfully
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              The order has been created and any selected inventory materials
              have been deducted from stock.
            </p>
          </div>

          {/* File upload */}
          {createdOrderId && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <Upload className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Attach Files
                    </h3>

                    <p className="text-sm text-gray-500">
                      Upload any designs, references or customer files.
                    </p>
                  </div>
                </div>
              </div>

              <OrderFileUpload orderId={createdOrderId} />
            </div>
          )}

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <Button type="button" onClick={handleFinish}>
              Done
              <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
