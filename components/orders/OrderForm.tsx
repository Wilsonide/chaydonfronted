/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  ChevronRight,
  FilePenLine,
  Loader2,
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
  discount_amount: string;
}

const DIMENSION_UNITS = ["feet", "foot", "ft"];

function isDimensionUnit(unit: string): boolean {
  return DIMENSION_UNITS.includes(unit.trim().toLowerCase());
}

/**
 * Supports:
 * 12
 * 3x2
 * 3x2x2
 * 3x2, 4x5
 * 3x2x2, 4x5x3
 *
 * Two dimensions calculate length × width.
 * Three dimensions calculate length × width × copies.
 *
 * Dimension expressions are only allowed for feet-based inventory.
 */
function calculatePreview(unit: string, inputQuantity: string): number | null {
  const value = inputQuantity.trim();

  if (!value) return null;

  // Direct numeric quantities remain valid for every inventory unit.
  if (/^\d+$/.test(value)) {
    const quantity = Number(value);
    return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
  }

  if (!isDimensionUnit(unit)) return null;

  const expressions = value.split(",");

  if (expressions.some((expression) => !expression.trim())) {
    return null;
  }

  let total = 0;

  for (const expression of expressions) {
    const parts = expression.trim().split(/\s*(?:\*|x|X|×)\s*/);

    if (parts.length !== 2 && parts.length !== 3) {
      return null;
    }

    if (parts.some((part) => !/^\d+(?:\.\d+)?$/.test(part))) {
      return null;
    }

    const numbers = parts.map(Number);

    if (numbers.some((number) => !Number.isFinite(number) || number <= 0)) {
      return null;
    }

    const length = numbers[0];
    const width = numbers[1];
    const copies = numbers.length === 3 ? numbers[2] : 1;

    // Copy count must be a whole number.
    if (!Number.isInteger(copies)) return null;

    const expressionTotal = length * width * copies;

    if (
      !Number.isFinite(expressionTotal) ||
      !Number.isInteger(expressionTotal) ||
      expressionTotal <= 0
    ) {
      return null;
    }

    total += expressionTotal;

    if (!Number.isSafeInteger(total)) return null;
  }

  return total > 0 ? total : null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

    void loadInventory();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInventory = useMemo(() => {
    const search = inventorySearch.trim().toLowerCase();

    if (!search) return inventoryItems;

    return inventoryItems.filter((item) =>
      [item.name, item.category, item.unit].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }, [inventoryItems, inventorySearch]);

  const selectedItemIds = useMemo(
    () => new Set(selectedInventory.map((item) => item.inventory_item_id)),
    [selectedInventory],
  );

  const getInventoryItem = (itemId: string) =>
    inventoryItems.find((item) => item.id === itemId);

  const addInventoryItem = (item: InventoryItem) => {
    if (selectedItemIds.has(item.id)) return;

    setSelectedInventory((current) => [
      ...current,
      {
        inventory_item_id: item.id,
        input_quantity: "",
        discount_amount: "0",
      },
    ]);
  };

  const removeInventoryItem = (itemId: string) => {
    setSelectedInventory((current) =>
      current.filter((item) => item.inventory_item_id !== itemId),
    );
  };

  const updateInventoryField = (
    itemId: string,
    field: "input_quantity" | "discount_amount",
    value: string,
  ) => {
    setSelectedInventory((current) =>
      current.map((item) =>
        item.inventory_item_id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const validateInventory = (): boolean => {
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

      const quantity = calculatePreview(item.unit, input);

      if (quantity === null) {
        toast.error(
          isDimensionUnit(item.unit)
            ? `Invalid quantity for "${item.name}". Use 12, 3x2, 3x2x2, or comma-separated expressions such as 3x2, 4x5.`
            : `Invalid quantity for "${item.name}". Enter a positive whole number.`,
        );
        return false;
      }

      const discountText = selected.discount_amount.trim();
      const discount = Number(discountText);

      if (!discountText || !Number.isFinite(discount) || discount < 0) {
        toast.error(
          `Enter a valid non-negative per-unit discount for "${item.name}".`,
        );
        return false;
      }

      // Currency discounts must have no more than two decimal places.
      if (!/^\d+(?:\.\d{1,2})?$/.test(discountText)) {
        toast.error(
          `The discount for "${item.name}" must have no more than two decimal places.`,
        );
        return false;
      }

      if (discount > item.unit_selling_price) {
        toast.error(
          `The discount for "${item.name}" cannot exceed its unit selling price of ${formatCurrency(item.unit_selling_price)}.`,
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

    if (!validateInventory()) return;

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
                discount_amount: Number(item.discount_amount),
              }))
            : undefined,
      });

      setCreatedOrderId(response.data.id);
      toast.success("Order created successfully.");
      setStep("files");
    } catch (error: any) {
      console.error("Failed to create order:", error);

      const detail = error?.response?.data?.detail;
      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail
                .map((entry: any) => entry.msg ?? JSON.stringify(entry))
                .join(", ")
            : error?.response?.data?.message ||
              "Failed to create order. Please try again.";

      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleFinish = () => onSuccess();

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

          {/* Order type */}
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
              placeholder="e.g. Customer brochure printing"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
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

          {/* Materials */}
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
                    Enter dimensions or quantities and any fixed discount per
                    unit. Stock is deducted when the order is created.
                  </p>
                </div>
              </div>

              {selectedInventory.length > 0 && (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {selectedInventory.length} selected
                </span>
              )}
            </div>

            {/* Search */}
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
                            available ·{" "}
                            {formatCurrency(item.unit_selling_price)}
                            /unit
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

            {/* Selected materials */}
            {selectedInventory.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-800">
                  Selected materials
                </p>

                {selectedInventory.map((selected) => {
                  const item = getInventoryItem(selected.inventory_item_id);

                  if (!item) return null;

                  const quantity = calculatePreview(
                    item.unit,
                    selected.input_quantity,
                  );

                  const dimensionUnit = isDimensionUnit(item.unit);
                  const discountText = selected.discount_amount.trim();
                  const discount = Number(discountText);
                  const validDiscount =
                    discountText !== "" &&
                    Number.isFinite(discount) &&
                    discount >= 0 &&
                    discount <= item.unit_selling_price &&
                    /^\d+(?:\.\d{1,2})?$/.test(discountText);

                  const discountedUnitPrice = validDiscount
                    ? item.unit_selling_price - discount
                    : null;

                  const materialTotal =
                    quantity !== null && discountedUnitPrice !== null
                      ? quantity * discountedUnitPrice
                      : null;

                  return (
                    <div
                      key={selected.inventory_item_id}
                      className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Available: {item.quantity} {item.unit}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Original unit price:{" "}
                            {formatCurrency(item.unit_selling_price)}
                          </p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeInventoryItem(selected.inventory_item_id)
                          }
                          aria-label={`Remove ${item.name}`}
                          className="self-end text-gray-400 hover:bg-red-50 hover:text-red-600 sm:self-start"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`quantity-${item.id}`}
                            className="text-xs"
                          >
                            Quantity / Dimensions
                          </Label>
                          <Input
                            id={`quantity-${item.id}`}
                            value={selected.input_quantity}
                            onChange={(event) =>
                              updateInventoryField(
                                selected.inventory_item_id,
                                "input_quantity",
                                event.target.value,
                              )
                            }
                            placeholder={
                              dimensionUnit ? "e.g. 3x2x2, 4x5" : "e.g. 12"
                            }
                          />
                          {dimensionUnit && (
                            <p className="text-xs text-gray-500">
                              Use length × width × copies. Separate multiple
                              expressions with commas.
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor={`discount-${item.id}`}
                            className="text-xs"
                          >
                            Fixed discount per unit (₦)
                          </Label>
                          <Input
                            id={`discount-${item.id}`}
                            type="number"
                            min="0"
                            max={item.unit_selling_price}
                            step="0.01"
                            value={selected.discount_amount}
                            onChange={(event) =>
                              updateInventoryField(
                                selected.inventory_item_id,
                                "discount_amount",
                                event.target.value,
                              )
                            }
                            placeholder="0.00"
                          />
                          <p className="text-xs text-gray-500">
                            Maximum: {formatCurrency(item.unit_selling_price)}
                          </p>
                        </div>
                      </div>

                      {/* Live calculation */}
                      <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">
                            Calculated quantity
                          </span>
                          <span className="font-semibold text-gray-900">
                            {quantity !== null
                              ? `${quantity} ${item.unit}`
                              : "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">
                            Discounted unit price
                          </span>
                          <span className="font-medium text-gray-900">
                            {discountedUnitPrice !== null
                              ? formatCurrency(discountedUnitPrice)
                              : "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-2">
                          <span className="font-medium text-gray-700">
                            Material total
                          </span>
                          <span className="font-semibold text-blue-700">
                            {materialTotal !== null
                              ? formatCurrency(materialTotal)
                              : "—"}
                          </span>
                        </div>

                        {selected.input_quantity.trim() &&
                          quantity === null && (
                            <p className="text-xs text-amber-700">
                              Invalid quantity. Check the expression format and
                              ensure the calculated result is a positive whole
                              number.
                            </p>
                          )}

                        {discountText && !validDiscount && (
                          <p className="text-xs text-red-600">
                            Enter a valid discount between ₦0 and the original
                            unit price, with no more than two decimal places.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Aggregate material cost preview */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-blue-900">
                      Total selected material cost
                    </span>
                    <span className="text-lg font-bold text-blue-800">
                      {selectedInventory.every((selected) => {
                        const item = getInventoryItem(
                          selected.inventory_item_id,
                        );
                        if (!item) return false;

                        return (
                          calculatePreview(
                            item.unit,
                            selected.input_quantity,
                          ) !== null &&
                          selected.discount_amount.trim() !== "" &&
                          Number.isFinite(Number(selected.discount_amount)) &&
                          Number(selected.discount_amount) >= 0 &&
                          Number(selected.discount_amount) <=
                            item.unit_selling_price &&
                          /^\d+(?:\.\d{1,2})?$/.test(
                            selected.discount_amount.trim(),
                          )
                        );
                      })
                        ? formatCurrency(
                            selectedInventory.reduce((total, selected) => {
                              const item = getInventoryItem(
                                selected.inventory_item_id,
                              );
                              if (!item) return total;

                              const quantity = calculatePreview(
                                item.unit,
                                selected.input_quantity,
                              );
                              if (quantity === null) return total;

                              const discount = Number(selected.discount_amount);

                              return (
                                total +
                                quantity * (item.unit_selling_price - discount)
                              );
                            }, 0),
                          )
                        : "Complete valid quantities and discounts"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-blue-700">
                    This is a material-cost preview. The order&apos;s Total
                    Amount below remains the amount you enter for the customer.
                  </p>
                </div>
              </div>
            )}

            {selectedInventory.length === 0 && !inventoryLoading && (
              <div className="mt-3 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-center text-xs text-gray-500">
                No materials selected. You can create the order without
                inventory consumption.
              </div>
            )}
          </div>

          {/* Amount and due date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order-amount">
                Total Order Amount <span className="text-red-500">*</span>
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
                  required
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

          {/* Inventory notice */}
          {selectedInventory.length > 0 && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Inventory will be deducted when this order is created
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    The backend validates stock availability and processes the
                    order and its material requirements together. If there is
                    insufficient stock or an invalid discount, the request
                    should fail without creating the order.
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
              The order has been created and selected inventory materials have
              been processed.
            </p>
          </div>

          {/* Files */}
          {createdOrderId && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Attach Files</h3>
                  <p className="text-sm text-gray-500">
                    Upload designs, references or customer files.
                  </p>
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
