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
 * Supports direct quantities and dimension expressions:
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

    if (parts.length !== 2 && parts.length !== 3) return null;

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

function validDiscount(value: string, unitPrice: number): boolean {
  const trimmed = value.trim();

  return (
    /^\d+(?:\.\d{1,2})?$/.test(trimmed) &&
    Number.isFinite(Number(trimmed)) &&
    Number(trimmed) >= 0 &&
    Number(trimmed) <= unitPrice
  );
}

export function OrderEditForm({
  order,
  onSuccess,
  onCancel,
}: OrderEditFormProps) {
  const [title, setTitle] = useState(order.title);
  const [description, setDescription] = useState(order.description ?? "");
  const [amount, setAmount] = useState(String(order.total_amount));
  const [dueDate, setDueDate] = useState(order.due_date ?? "");
  const [status, setStatus] = useState<OrderStatus>(order.status);

  const [updating, setUpdating] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<
    SelectedInventoryItem[]
  >([]);

  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventorySearch, setInventorySearch] = useState("");
  const [materialsLoading, setMaterialsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
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
  }, [order.id]);

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
        toast.error("One of the selected inventory items is unavailable.");
        return false;
      }

      const input = selected.input_quantity.trim();

      if (!input) {
        toast.error(`Enter a quantity for "${item.name}".`);
        return false;
      }

      if (calculatePreview(item.unit, input) === null) {
        toast.error(
          isFeetUnit(item.unit)
            ? `Invalid quantity for "${item.name}". Use 12, 3x2, 3x2x2, or comma-separated expressions such as 3x2, 4x5.`
            : `Invalid quantity for "${item.name}". Enter a positive whole number.`,
        );
        return false;
      }

      if (!validDiscount(selected.discount_amount, item.unit_selling_price)) {
        toast.error(
          `Enter a valid discount for "${item.name}" between ₦0 and ${formatCurrency(item.unit_selling_price)}.`,
        );
        return false;
      }
    }

    return true;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Order title is required.");
      return;
    }

    if (!amount.trim() || !Number.isFinite(Number(amount))) {
      toast.error("Please enter a valid amount.");
      return;
    }

    const numericAmount = Number(amount);

    if (numericAmount < 0) {
      toast.error("Order amount cannot be negative.");
      return;
    }

    if (!validateInventory()) return;

    try {
      setUpdating(true);

      await orderService.updateOrder(order.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        total_amount: numericAmount,
        status,
        due_date: dueDate || undefined,
        inventory_items: selectedInventory.map((item) => ({
          inventory_item_id: item.inventory_item_id,
          input_quantity: item.input_quantity.trim(),
          discount_amount: Number(item.discount_amount),
        })),
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

  const materialCost = selectedInventory.reduce((total, selected) => {
    const item = getInventoryItem(selected.inventory_item_id);

    if (
      !item ||
      calculatePreview(item.unit, selected.input_quantity) === null ||
      !validDiscount(selected.discount_amount, item.unit_selling_price)
    ) {
      return total;
    }

    const quantity = calculatePreview(item.unit, selected.input_quantity)!;
    const discount = Number(selected.discount_amount);

    return total + quantity * (item.unit_selling_price - discount);
  }, 0);

  const allMaterialsValid = selectedInventory.every((selected) => {
    const item = getInventoryItem(selected.inventory_item_id);

    return (
      !!item &&
      calculatePreview(item.unit, selected.input_quantity) !== null &&
      validDiscount(selected.discount_amount, item.unit_selling_price)
    );
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Customer</p>
        <p className="mt-1 font-medium">{order.customer.name}</p>
        <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
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

        <div className="space-y-2">
          <Label htmlFor="edit-order-amount">Total Order Amount (₦)</Label>
          <Input
            id="edit-order-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={updating}
            required
          />
          <p className="text-xs text-muted-foreground">
            This is the customer-facing order amount. The material-cost preview
            below is calculated separately.
          </p>
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

      {/* Inventory */}
      <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Materials / Inventory</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit dimensions, quantities, and fixed per-unit discounts.
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
                            {formatCurrency(item.unit_selling_price)}/unit
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
                  const discount = Number(selected.discount_amount);
                  const discountIsValid = validDiscount(
                    selected.discount_amount,
                    item.unit_selling_price,
                  );

                  const discountedPrice = discountIsValid
                    ? item.unit_selling_price - discount
                    : null;

                  const lineTotal =
                    quantity !== null && discountedPrice !== null
                      ? quantity * discountedPrice
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
                              Two numbers = dimensions. Three numbers = length,
                              width and copies. Separate expressions with
                              commas.
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">
                            Fixed discount per unit (₦)
                          </Label>
                          <Input
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
                            disabled={updating}
                          />
                          <p className="text-xs text-muted-foreground">
                            Original price:{" "}
                            {formatCurrency(item.unit_selling_price)}
                          </p>
                        </div>
                      </div>

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
                            Discounted unit price
                          </span>
                          <span className="font-medium">
                            {discountedPrice !== null
                              ? formatCurrency(discountedPrice)
                              : "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t pt-2">
                          <span className="font-medium">Material total</span>
                          <span className="font-bold text-blue-700">
                            {lineTotal !== null
                              ? formatCurrency(lineTotal)
                              : "—"}
                          </span>
                        </div>

                        {selected.input_quantity.trim() &&
                          quantity === null && (
                            <p className="text-xs text-amber-700">
                              Invalid quantity. Check the expression format and
                              ensure the result is a positive whole number.
                            </p>
                          )}

                        {selected.discount_amount.trim() &&
                          !discountIsValid && (
                            <p className="text-xs text-red-600">
                              The discount must be between zero and the original
                              unit price, with at most two decimal places.
                            </p>
                          )}
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-blue-900">
                      Total selected material cost
                    </span>
                    <span className="text-lg font-bold text-blue-800">
                      {allMaterialsValid
                        ? formatCurrency(materialCost)
                        : "Complete valid quantities and discounts"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedInventory.length === 0 && (
              <div className="mt-4 rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
                No materials selected. Saving will return any previously
                allocated quantities, subject to backend transaction rules.
              </div>
            )}
          </>
        )}

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-900">
            Inventory changes are handled by the backend
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-700">
            The backend must validate stock, preserve the original input
            expression and discount, and process stock movements
            transactionally.
          </p>
        </div>
      </div>

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

        <Button type="submit" disabled={updating || materialsLoading}>
          {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {updating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
