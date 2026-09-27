/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

import { Order, OrderStatus } from "./types";

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
}

const statuses: {
  value: OrderStatus;
  label: string;
}[] = [
  {
    value: "RECEIVED",
    label: "Received",
  },
  {
    value: "REVIEWING",
    label: "Reviewing",
  },
  {
    value: "READY_FOR_PRODUCTION",
    label: "Ready for Production",
  },
  {
    value: "IN_PRODUCTION",
    label: "In Production",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

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

  // ============================================================
  // LOAD INVENTORY + EXISTING ORDER MATERIALS
  // ============================================================

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

        if (cancelled) {
          return;
        }

        setInventoryItems(inventoryResponse.data.data);

        setSelectedInventory(
          materialsResponse.data.requirements.map((requirement) => ({
            inventory_item_id: requirement.inventory_item_id,
            input_quantity: String(requirement.required_quantity),
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

    loadData();

    return () => {
      cancelled = true;
    };
  }, [order.id]);

  // ============================================================
  // FILTER INVENTORY
  // ============================================================

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

  // ============================================================
  // ADD MATERIAL
  // ============================================================

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

  // ============================================================
  // REMOVE MATERIAL
  // ============================================================

  const removeInventoryItem = (itemId: string) => {
    setSelectedInventory((current) =>
      current.filter((item) => item.inventory_item_id !== itemId),
    );
  };

  // ============================================================
  // UPDATE INPUT
  // ============================================================

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

  // ============================================================
  // VALIDATE INVENTORY
  // ============================================================

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
        const isFeet = ["feet", "foot", "ft"].includes(
          item.unit.trim().toLowerCase(),
        );

        toast.error(
          isFeet
            ? `Invalid quantity for "${item.name}". Use a value such as 12 or 3*4.`
            : `Invalid quantity for "${item.name}". Enter a whole number.`,
        );

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

  // ============================================================
  // SUBMIT
  // ============================================================

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Order title is required");

      return;
    }

    const numericAmount = Number(amount || 0);

    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      toast.error("Please enter a valid amount");

      return;
    }

    if (!validateInventory()) {
      return;
    }

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
        })),
      });

      toast.success("Order updated successfully");

      onSuccess();
    } catch (error: any) {
      console.error("Unable to update order:", error);

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to update order";

      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* ======================================================
          CUSTOMER
      ======================================================= */}

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Customer</p>

        <p className="mt-1 font-medium">{order.customer.name}</p>

        <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
      </div>

      {/* ======================================================
          BASIC ORDER INFORMATION
      ======================================================= */}

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="edit-order-title">Order Title</Label>

          <Input
            id="edit-order-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Wedding Invitation Cards"
            disabled={updating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-order-description">Requirements</Label>

          <Textarea
            id="edit-order-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what the customer needs..."
            rows={5}
            disabled={updating}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-order-amount">Total Amount</Label>

          <Input
            id="edit-order-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            disabled={updating}
          />
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

          <p className="text-xs text-muted-foreground">
            The date the customer expects the order to be ready.
          </p>
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

      {/* ======================================================
          INVENTORY
      ======================================================= */}

      <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Package className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Materials / Inventory
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Edit the materials used by this order. Stock is adjusted by the
              difference between the old and new quantities.
            </p>
          </div>
        </div>

        {/* Loading existing materials */}

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

            {/* Available inventory */}

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
                          <p className="truncate text-sm font-medium text-gray-900">
                            {item.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {item.category} · {item.quantity} {item.unit}{" "}
                            available
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

                  const isFeet = ["feet", "foot", "ft"].includes(
                    item.unit.trim().toLowerCase(),
                  );

                  return (
                    <div
                      key={selected.inventory_item_id}
                      className="rounded-xl border bg-white p-3 sm:p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Current stock: {item.quantity} {item.unit}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            value={selected.input_quantity}
                            onChange={(event) =>
                              updateInventoryQuantity(
                                selected.inventory_item_id,
                                event.target.value,
                              )
                            }
                            placeholder={isFeet ? "e.g. 3*4" : "e.g. 12"}
                            disabled={updating}
                            className="w-32"
                          />

                          <span className="text-sm text-muted-foreground">
                            {item.unit}
                          </span>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={updating}
                            onClick={() =>
                              removeInventoryItem(selected.inventory_item_id)
                            }
                            className="text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {selected.input_quantity.trim() && (
                        <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                          {preview !== null ? (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                New required quantity
                              </span>

                              <span className="font-semibold">
                                {preview} {item.unit}
                              </span>
                            </div>
                          ) : (
                            <span className="text-amber-600">
                              Enter a valid quantity
                              {isFeet ? " such as 12 or 3*4" : ""}.
                            </span>
                          )}
                        </div>
                      )}

                      {isFeet && !selected.input_quantity.trim() && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Example: <span className="font-medium">3*4</span> = 12{" "}
                          {item.unit}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedInventory.length === 0 && (
              <div className="mt-4 rounded-xl border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
                No materials selected. Removing all materials will return
                previously consumed stock to inventory.
              </div>
            )}
          </>
        )}

        {/* Transaction explanation */}

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-900">
            Inventory is adjusted automatically
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            Increasing a material deducts only the additional quantity. Reducing
            or removing a material returns the difference to inventory. All
            changes are processed together with the order update.
          </p>
        </div>
      </div>

      {/* ======================================================
          FOOTER
      ======================================================= */}

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
