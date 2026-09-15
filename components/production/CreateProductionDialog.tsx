/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useMemo, useState } from "react";
import { ExternalLink, FileImage, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Order } from "@/components/orders/types";
import productionService from "@/app/services/productionService";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface CreateProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  ordersLoading: boolean;
  onCreated: () => void;
}

export default function CreateProductionDialog({
  open,
  onOpenChange,
  orders,
  ordersLoading,
  onCreated,
}: CreateProductionDialogProps) {
  const [orderId, setOrderId] = useState("");
  const [title, setTitle] = useState("");
  const [requirements, setRequirements] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === orderId),
    [orders, orderId],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOrderId("");
      setTitle("");
      setRequirements("");
      setSubmitting(false);
    }

    onOpenChange(nextOpen);
  };

  const handleOrderChange = (nextOrderId: string | null) => {
    const order = orders.find((item) => item.id === nextOrderId);

    setOrderId(nextOrderId ?? "");
    setTitle(order?.title ?? "");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!orderId) {
      toast.error("Please select an order");
      return;
    }

    if (!title.trim()) {
      toast.error("Production title is required");
      return;
    }

    try {
      setSubmitting(true);

      await productionService.createProductionFolder({
        order_id: orderId,
        title: title.trim(),
        requirements: requirements.trim() || undefined,
      });

      toast.success("Production folder created successfully");

      onCreated();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ?? "Failed to create production folder",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="
          flex
          h-[100dvh]
          max-h-[100dvh]
          w-full
          max-w-none
          translate-x-[-50%]
          translate-y-[-50%]
          flex-col
          gap-0
          overflow-hidden
          rounded-none
          p-0

          sm:h-[90dvh]
          sm:max-h-[90dvh]
          sm:w-[calc(100%-2rem)]
          sm:max-w-[620px]
          sm:rounded-lg
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <DialogHeader
          className="
            shrink-0
            border-b
            bg-background
            px-4
            py-4
            sm:px-6
            sm:py-5
          "
        >
          <DialogTitle className="text-base sm:text-lg">
            Create Production Folder
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm">
            Select the customer order that should enter production.
          </DialogDescription>
        </DialogHeader>

        {/* =====================================================
            SCROLLABLE BODY
        ====================================================== */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            [-webkit-overflow-scrolling:touch]
          "
        >
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <form
              id="create-production-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* =================================================
                  ORDER
              ================================================== */}
              <section className="space-y-2">
                <Label htmlFor="production-order">Order</Label>

                <Select
                  value={orderId}
                  onValueChange={handleOrderChange}
                  disabled={ordersLoading || submitting}
                >
                  <SelectTrigger id="production-order" className="h-10 w-full">
                    <SelectValue
                      placeholder={
                        ordersLoading ? "Loading orders..." : "Select an order"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {orders.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No orders available
                      </div>
                    ) : (
                      orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          <span className="max-w-[260px] truncate sm:max-w-[480px]">
                            {order.title} — {order.customer.name}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* =================================================
                    SELECTED ORDER
                ================================================== */}
                {selectedOrder && (
                  <div
                    className="
                      mt-3
                      rounded-xl
                      border
                      bg-muted/30
                      p-3
                      sm:p-4
                    "
                  >
                    <div
                      className="
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-[1fr_auto]
                      "
                    >
                      <div className="min-w-0">
                        <p
                          className="
                            break-words
                            text-sm
                            font-semibold
                          "
                        >
                          {selectedOrder.title}
                        </p>

                        <div className="mt-3 space-y-1.5">
                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              Customer:
                            </span>{" "}
                            <span className="font-medium">
                              {selectedOrder.customer.name}
                            </span>
                          </div>

                          <div className="text-xs">
                            <span className="text-muted-foreground">
                              Phone:
                            </span>{" "}
                            <span className="font-medium">
                              {selectedOrder.customer.phone}
                            </span>
                          </div>

                          <div className="text-xs capitalize">
                            <span className="text-muted-foreground">
                              Status:
                            </span>{" "}
                            <span className="font-medium">
                              {selectedOrder.status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="
                          rounded-lg
                          border
                          bg-background
                          px-3
                          py-2.5
                          sm:min-w-[135px]
                          sm:self-start
                          sm:text-right
                        "
                      >
                        <p className="text-[11px] text-muted-foreground">
                          Order Total
                        </p>

                        <p className="mt-0.5 text-sm font-semibold">
                          ₦{Number(selectedOrder.total_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* =================================================
                  REFERENCE FILES
              ================================================== */}
              {selectedOrder && (
                <section className="space-y-3">
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >
                    <div className="min-w-0">
                      <Label>Reference Files</Label>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Files uploaded with this customer order.
                      </p>
                    </div>

                    <span
                      className="
                        shrink-0
                        rounded-full
                        bg-muted
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                      "
                    >
                      {selectedOrder.files.length}{" "}
                      {selectedOrder.files.length === 1 ? "file" : "files"}
                    </span>
                  </div>

                  {selectedOrder.files.length === 0 ? (
                    <div
                      className="
                        rounded-xl
                        border
                        border-dashed
                        p-5
                        text-center
                      "
                    >
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />

                      <p className="mt-2 text-sm font-medium">
                        No reference files
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        This order does not have any uploaded reference files.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedOrder.files.map((file) => {
                        const isImage =
                          file.file_type?.startsWith("image/") ?? false;

                        return (
                          <div
                            key={file.id}
                            className="
                                flex
                                min-w-0
                                items-center
                                gap-2
                                rounded-lg
                                border
                                bg-background
                                p-2.5
                                sm:gap-3
                                sm:p-3
                              "
                          >
                            {/* Icon */}
                            <div
                              className="
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-muted
                                  sm:h-10
                                  sm:w-10
                                "
                            >
                              {isImage ? (
                                <FileImage className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                              ) : (
                                <FileText className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                              )}
                            </div>

                            {/* File details */}
                            <div className="min-w-0 flex-1">
                              <p
                                className="
                                    truncate
                                    text-xs
                                    font-medium
                                    sm:text-sm
                                  "
                                title={file.file_name}
                              >
                                {file.file_name}
                              </p>

                              <p
                                className="
                                    mt-0.5
                                    truncate
                                    text-[10px]
                                    text-muted-foreground
                                    sm:text-xs
                                  "
                              >
                                {file.file_type ?? "Reference file"}
                              </p>
                            </div>

                            {/* View */}
                            <a
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                  inline-flex
                                  h-8
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-md
                                  border
                                  border-input
                                  bg-background
                                  px-2.5
                                  text-xs
                                  font-medium
                                  shadow-sm
                                  transition-colors
                                  hover:bg-accent
                                  hover:text-accent-foreground
                                  sm:h-9
                                  sm:px-3
                                  sm:text-sm
                                "
                            >
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />

                              <span>View</span>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* =================================================
                  PRODUCTION TITLE
              ================================================== */}
              <section className="space-y-2">
                <Label htmlFor="production-title">Production Title</Label>

                <Input
                  id="production-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Production title"
                  disabled={submitting}
                  className="h-10 w-full"
                />
              </section>

              {/* =================================================
                  REQUIREMENTS
              ================================================== */}
              <section className="space-y-2">
                <Label htmlFor="production-requirements">
                  Customer Requirements
                </Label>

                <Textarea
                  id="production-requirements"
                  value={requirements}
                  onChange={(event) => setRequirements(event.target.value)}
                  placeholder="Enter production requirements..."
                  rows={5}
                  disabled={submitting}
                  className="
                    min-h-[130px]
                    w-full
                    resize-y
                  "
                />
              </section>
            </form>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        <DialogFooter
          className="
            shrink-0
            flex-col
            gap-2
            border-t
            bg-background
            px-4
            py-3
            sm:flex-row
            sm:justify-end
            sm:px-6
            sm:py-4
          "
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="create-production-form"
            disabled={submitting || ordersLoading || !orderId}
            className="w-full sm:w-auto"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Production
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
