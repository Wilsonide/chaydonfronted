/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

import orderService from "@/app/services/order.service";
import inventoryService from "@/app/services/inventory.service";

import type { InventoryItem } from "@/app/services/inventory.service";
import type { Order, OrderStatus } from "./types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderEditFormProps {
  order: Order;
  onSuccess: () => void;
  onCancel: () => void;
}

interface SelectedInventoryItem {
  inventory_item_id: string;
  input_quantity: string;
  discount_amount: string;
}

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "RECEIVED", label: "Received" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "READY_FOR_PRODUCTION", label: "Ready for Production" },
  { value: "IN_PRODUCTION", label: "In Production" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function isFeetUnit(unit: string): boolean {
  return ["feet", "foot", "ft"].includes(unit.trim().toLowerCase());
}

/**
 * Supports:
 * 12
 * 3x2
 * 3x2x2
 * 3x2, 4x5
 * 3x2x2, 4x5x3
 *
 * Dimensions are accepted only for feet-based inventory.
 */
function calculatePreview(unit: string, inputQuantity: string): number | null {
  const value = inputQuantity.trim();

  if (!value) return null;

  if (/^\d+$/.test(value)) {
    const quantity = Number(value);

    return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
  }

  if (!isFeetUnit(unit)) return null;

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

    if (!Number.isInteger(copies)) return null;

    const expressionTotal = length * width * copies;

    if (!Number.isSafeInteger(expressionTotal) || expressionTotal <= 0) {
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

function validDiscount(value: string, grossTotal: number): boolean {
  const trimmed = value.trim();
  const discount = Number(trimmed);

  return (
    trimmed !== "" &&
    /^\d+(?:\.\d{1,2})?$/.test(trimmed) &&
    Number.isFinite(discount) &&
    discount >= 0 &&
    discount <= grossTotal
  );
}

export function OrderEditForm({
  order,
  onSuccess,
  onCancel,
}: OrderEditFormProps) {
  const isPrintOrder = order.order_type === "PRINT";

  const [title, setTitle] = useState(order.title);

  const [description, setDescription] = useState(order.description ?? "");

  // Used only for DESIGN orders.
  // PRINT order amount is derived from inventory materials.
  const [amount, setAmount] = useState(String(order.total_amount));

  const [dueDate, setDueDate] = useState(order.due_date ?? "");

  const [status, setStatus] = useState<OrderStatus>(order.status);

  const [updating, setUpdating] = useState(false);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const [selectedInventory, setSelectedInventory] = useState<
    SelectedInventoryItem[]
  >([]);

  const [inventoryLoading, setInventoryLoading] = useState(isPrintOrder);

  const [inventorySearch, setInventorySearch] = useState("");

  const [materialsLoading, setMaterialsLoading] = useState(isPrintOrder);

  // ============================================================
  // LOAD INVENTORY AND EXISTING MATERIALS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!isPrintOrder) {
        setInventoryItems([]);
        setSelectedInventory([]);
        setInventoryLoading(false);
        setMaterialsLoading(false);
        return;
      }

      try {
        setInventoryLoading(true);
        setMaterialsLoading(true);

        const [inventoryResponse, materialsResponse] = await Promise.all([
          inventoryService.getItems(1, 100),
          inventoryService.getOrderMaterialCalculation(order.id),
        ]);

        if (cancelled) return;

        const items: InventoryItem[] = inventoryResponse.data.data;

        setInventoryItems(items);

        setSelectedInventory(
          materialsResponse.data.requirements.map((requirement) => ({
            inventory_item_id: requirement.inventory_item_id,
            input_quantity:
              requirement.dimension_input ??
              String(requirement.required_quantity),
            discount_amount: String(requirement.discount_amount ?? 0),
          })),
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load order materials:", error);

          toast.error("Unable to load the order's inventory materials.");
        }
      } finally {
        if (!cancelled) {
          setInventoryLoading(false);
          setMaterialsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [order.id, isPrintOrder]);

  // ============================================================
  // INVENTORY HELPERS
  // ============================================================

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
    if (!isPrintOrder || selectedItemIds.has(item.id)) {
      return;
    }

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

  // ============================================================
  // MATERIAL PREVIEW
  // ============================================================

  const materialPreview = useMemo(() => {
    let totalGrossCost = 0;
    let totalDiscount = 0;
    let totalFinalCost = 0;

    let allMaterialsValid = true;

    for (const selected of selectedInventory) {
      const item = inventoryItems.find(
        (inventoryItem) => inventoryItem.id === selected.inventory_item_id,
      );

      if (!item) {
        allMaterialsValid = false;
        continue;
      }

      const quantity = calculatePreview(item.unit, selected.input_quantity);

      if (quantity === null) {
        allMaterialsValid = false;
        continue;
      }

      const grossTotal = quantity * item.unit_selling_price;

      if (!Number.isFinite(grossTotal)) {
        allMaterialsValid = false;
        continue;
      }

      if (!validDiscount(selected.discount_amount, grossTotal)) {
        allMaterialsValid = false;
        continue;
      }

      const discount = Number(selected.discount_amount);

      totalGrossCost += grossTotal;
      totalDiscount += discount;
      totalFinalCost += grossTotal - discount;
    }

    return {
      allMaterialsValid,
      totalGrossCost: Number(totalGrossCost.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      totalFinalCost: Number(totalFinalCost.toFixed(2)),
    };
  }, [selectedInventory, inventoryItems]);

  // The PRINT order amount always comes from the valid
  // calculated material total.
  const calculatedOrderAmount = isPrintOrder
    ? materialPreview.totalFinalCost
    : Number(amount);

  const displayedOrderAmount =
    isPrintOrder && !materialPreview.allMaterialsValid
      ? ""
      : String(calculatedOrderAmount.toFixed(2));

  // ============================================================
  // VALIDATE INVENTORY
  // ============================================================

  const validateInventory = (): boolean => {
    if (!isPrintOrder) return true;

    if (!materialPreview.allMaterialsValid) {
      toast.error(
        "Please complete all material quantities and discounts before saving.",
      );

      return false;
    }

    for (const selected of selectedInventory) {
      const item = getInventoryItem(selected.inventory_item_id);

      if (!item) {
        toast.error("One of the selected inventory items is unavailable.");

        return false;
      }

      const quantity = calculatePreview(item.unit, selected.input_quantity);

      if (quantity === null) {
        toast.error(`Enter a valid quantity for "${item.name}".`);

        return false;
      }

      const grossTotal = quantity * item.unit_selling_price;

      if (!validDiscount(selected.discount_amount, grossTotal)) {
        toast.error(
          `The fixed discount for "${item.name}" must be between ₦0 and ${formatCurrency(grossTotal)}.`,
        );

        return false;
      }
    }

    return true;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Order title is required.");
      return;
    }

    if (isPrintOrder) {
      if (!validateInventory()) return;
    } else {
      if (!amount.trim() || !Number.isFinite(Number(amount))) {
        toast.error("Please enter a valid amount.");
        return;
      }

      if (Number(amount) < 0) {
        toast.error("Order amount cannot be negative.");
        return;
      }
    }

    const finalOrderAmount = isPrintOrder
      ? materialPreview.totalFinalCost
      : Number(amount);

    try {
      setUpdating(true);

      await orderService.updateOrder(order.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        total_amount: Number(finalOrderAmount.toFixed(2)),
        status,
        due_date: dueDate || undefined,

        inventory_items: isPrintOrder
          ? selectedInventory.map((item) => ({
              inventory_item_id: item.inventory_item_id,
              input_quantity: item.input_quantity.trim(),
              discount_amount: Number(item.discount_amount),
            }))
          : [],
      });

      toast.success("Order updated successfully.");
      onSuccess();
    } catch (error: any) {
      console.error("Unable to update order:", error);

      const detail = error?.response?.data?.detail;

      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail
                .map((entry: any) => entry.msg ?? JSON.stringify(entry))
                .join(", ")
            : error?.response?.data?.message || "Unable to update order.";

      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Customer */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Customer</p>

        <p className="mt-1 font-medium">{order.customer.name}</p>

        <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
      </div>

      {/* Order type indicator */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Order Type</p>

        <p className="mt-1 font-semibold">
          {isPrintOrder ? "Print Order" : "Design Order"}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {isPrintOrder
            ? "The order amount is calculated automatically from its selected materials."
            : "Design orders do not deduct inventory materials."}
        </p>
      </div>

      {/* Basic order information */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="edit-order-title">Order Title</Label>

          <Input
            id="edit-order-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={updating}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-order-description">Requirements</Label>

          <Textarea
            id="edit-order-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            disabled={updating}
          />
        </div>

        {/* Order amount */}
        <div className="space-y-2">
          <Label htmlFor="edit-order-amount">Total Order Amount (₦)</Label>

          <Input
            id="edit-order-amount"
            type="number"
            min="0"
            step="0.01"
            value={displayedOrderAmount}
            onChange={(event) => !isPrintOrder && setAmount(event.target.value)}
            readOnly={isPrintOrder}
            disabled={updating || (isPrintOrder && materialsLoading)}
            required
          />

          <p className="text-xs text-muted-foreground">
            {isPrintOrder
              ? "Automatically calculated from the total material cost after discounts. Update the materials below to change this amount."
              : "Enter the customer-facing order amount for this design order."}
          </p>

          {isPrintOrder &&
            !materialsLoading &&
            !materialPreview.allMaterialsValid && (
              <p className="text-xs text-amber-700">
                Complete all material quantities and discounts to calculate the
                order amount.
              </p>
            )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-order-due-date">Due Date</Label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="edit-order-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="pl-10"
              disabled={updating}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Order Status</Label>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as OrderStatus)}
            disabled={updating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              {statuses.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PRINT ORDER MATERIALS ONLY */}
      {isPrintOrder && (
        <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Package className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-semibold">Materials / Inventory</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage materials required for this print order. Each discount is
                applied once to the total material requirement.
              </p>
            </div>
          </div>

          {materialsLoading ? (
            <div className="flex items-center justify-center rounded-xl border bg-white py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading order materials...
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <Input
                  value={inventorySearch}
                  onChange={(event) => setInventorySearch(event.target.value)}
                  placeholder="Search materials..."
                  disabled={updating}
                  className="pl-9"
                />
              </div>

              {/* Inventory list */}
              <div className="rounded-xl border bg-white">
                {inventoryLoading ? (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading inventory...
                  </div>
                ) : filteredInventory.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No inventory items found.
                  </div>
                ) : (
                  <div className="max-h-60 divide-y overflow-y-auto">
                    {filteredInventory.map((item) => {
                      const selected = selectedItemIds.has(item.id);

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {item.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {item.quantity} {item.unit} available ·{" "}
                              {formatCurrency(item.unit_selling_price)}
                              /unit
                            </p>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={selected ? "secondary" : "outline"}
                            disabled={selected || updating}
                            onClick={() => addInventoryItem(item)}
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
                  <p className="text-sm font-semibold">Selected materials</p>

                  {selectedInventory.map((selected) => {
                    const item = getInventoryItem(selected.inventory_item_id);

                    if (!item) return null;

                    const quantity = calculatePreview(
                      item.unit,
                      selected.input_quantity,
                    );

                    const discountText = selected.discount_amount.trim();

                    const discount = Number(discountText);

                    const grossTotal =
                      quantity !== null
                        ? quantity * item.unit_selling_price
                        : null;

                    const discountIsValid =
                      grossTotal !== null &&
                      validDiscount(discountText, grossTotal);

                    const finalCost =
                      grossTotal !== null && discountIsValid
                        ? grossTotal - discount
                        : null;

                    return (
                      <div
                        key={selected.inventory_item_id}
                        className="rounded-xl border bg-white p-3 sm:p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{item.name}</p>

                            <p className="text-xs text-muted-foreground">
                              {item.quantity} {item.unit} currently available
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={updating}
                            aria-label={`Remove ${item.name}`}
                            onClick={() =>
                              removeInventoryItem(selected.inventory_item_id)
                            }
                            className="text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {/* Quantity */}
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Quantity / Dimensions
                            </Label>

                            <Input
                              value={selected.input_quantity}
                              onChange={(event) =>
                                updateInventoryField(
                                  selected.inventory_item_id,
                                  "input_quantity",
                                  event.target.value,
                                )
                              }
                              placeholder={
                                isFeetUnit(item.unit)
                                  ? "e.g. 3x2x2, 4x5"
                                  : "e.g. 12"
                              }
                              disabled={updating}
                            />

                            {isFeetUnit(item.unit) && (
                              <p className="text-xs text-muted-foreground">
                                Two numbers = dimensions. Three numbers =
                                length, width and copies. Separate expressions
                                with commas.
                              </p>
                            )}
                          </div>

                          {/* Fixed discount */}
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              Fixed discount on total material cost (₦)
                            </Label>

                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={selected.discount_amount}
                              onChange={(event) =>
                                updateInventoryField(
                                  selected.inventory_item_id,
                                  "discount_amount",
                                  event.target.value,
                                )
                              }
                              disabled={updating}
                            />

                            <p className="text-xs text-muted-foreground">
                              Maximum:{" "}
                              {grossTotal !== null
                                ? formatCurrency(grossTotal)
                                : "Enter a valid quantity first"}
                            </p>
                          </div>
                        </div>

                        {/* Material calculation */}
                        <div className="mt-3 space-y-2 rounded-lg bg-muted/40 p-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Calculated quantity
                            </span>

                            <span className="font-semibold">
                              {quantity !== null
                                ? `${quantity} ${item.unit}`
                                : "—"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Gross material cost
                            </span>

                            <span className="font-medium">
                              {grossTotal !== null
                                ? formatCurrency(grossTotal)
                                : "—"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              Fixed discount
                            </span>

                            <span className="font-medium text-red-600">
                              {discountIsValid
                                ? `-${formatCurrency(discount)}`
                                : "—"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3 border-t pt-2">
                            <span className="font-medium">
                              Final material cost
                            </span>

                            <span className="font-bold text-blue-700">
                              {finalCost !== null
                                ? formatCurrency(finalCost)
                                : "—"}
                            </span>
                          </div>

                          {selected.input_quantity.trim() &&
                            quantity === null && (
                              <p className="text-xs text-amber-700">
                                Invalid quantity. Check the expression format
                                and ensure the result is a positive whole
                                number.
                              </p>
                            )}

                          {discountText && !discountIsValid && (
                            <p className="text-xs text-red-600">
                              The fixed discount must be between zero and the
                              total material cost, with no more than two decimal
                              places.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Total material cost */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-blue-900">
                        Total order amount
                      </span>

                      <span className="text-lg font-bold text-blue-800">
                        {materialPreview.allMaterialsValid
                          ? formatCurrency(materialPreview.totalFinalCost)
                          : "Complete valid quantities and discounts"}
                      </span>
                    </div>

                    {materialPreview.allMaterialsValid && (
                      <div className="mt-3 space-y-1 border-t border-blue-100 pt-3 text-xs text-blue-800">
                        <div className="flex justify-between">
                          <span>Gross material cost</span>
                          <span>
                            {formatCurrency(materialPreview.totalGrossCost)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Total fixed discounts</span>
                          <span>
                            -{formatCurrency(materialPreview.totalDiscount)}
                          </span>
                        </div>

                        <div className="flex justify-between border-t border-blue-100 pt-2 font-semibold">
                          <span>Final order amount</span>
                          <span>
                            {formatCurrency(materialPreview.totalFinalCost)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedInventory.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
                  No materials selected. The calculated order amount will be
                  ₦0.00. Saving this order will return any previously allocated
                  material quantities according to the backend stock movement
                  logic.
                </div>
              )}
            </>
          )}

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-sm font-medium text-blue-900">
              Inventory changes are handled by the backend
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              Stock availability, quantity changes, fixed discounts and stock
              movements must be processed transactionally when this order is
              saved.
            </p>
          </div>
        </div>
      )}

      {/* DESIGN order inventory explanation */}
      {!isPrintOrder && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
          <p className="text-sm font-medium text-gray-800">
            Inventory is not applicable to this design order
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-600">
            Design orders do not deduct inventory. If additional materials are
            needed during production, they should be recorded separately through
            the production inventory workflow.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updating}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={
            updating ||
            materialsLoading ||
            (isPrintOrder && !materialPreview.allMaterialsValid)
          }
        >
          {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {updating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
