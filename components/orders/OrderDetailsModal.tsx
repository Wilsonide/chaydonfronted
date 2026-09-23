"use client";

import {
  Download,
  ExternalLink,
  FileImage,
  FilePenLine,
  FileText,
  Printer,
} from "lucide-react";

import { toast } from "sonner";

import { Order } from "./types";
import { OrderStatusBadge } from "./OrderStatusBadge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsModal({
  order,
  open,
  onOpenChange,
}: OrderDetailsModalProps) {
  if (!order) {
    return null;
  }

  const handleDownload = async (file: Order["files"][number]) => {
    if (!file.file_url) {
      toast.error("File URL is not available");
      return;
    }

    try {
      const response = await fetch(file.file_url);

      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = file.file_name;

      document.body.appendChild(link);

      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);

      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Reference file download failed:", error);

      toast.error("Failed to download file");
    }
  };

  const isPrintOrder = order.order_type === "PRINT";

  const isDesignOrder = order.order_type === "DESIGN";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order overview */}
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Order
                </p>

                <h3 className="mt-1 text-lg font-semibold">{order.title}</h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  #{order.id.slice(0, 8)}
                </p>
              </div>

              {/* Order type */}
              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  isPrintOrder
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-purple-200 bg-purple-50 text-purple-700"
                }`}
              >
                {isPrintOrder ? (
                  <Printer className="h-3.5 w-3.5" />
                ) : (
                  <FilePenLine className="h-3.5 w-3.5" />
                )}

                {isPrintOrder ? "Print Order" : "Design Order"}
              </div>
            </div>
          </div>

          {/* Order information */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>

              <p className="font-medium">{order.customer.name}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                {order.customer.phone}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>

              <div className="mt-1">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>

              <p className="font-medium">
                ₦
                {Number(order.total_amount).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>

              <p className="font-medium">
                {order.due_date
                  ? new Date(order.due_date).toLocaleDateString("en-NG")
                  : "No deadline"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created</p>

              <p className="font-medium">
                {new Date(order.created_at).toLocaleString("en-NG")}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Workflow</p>

              <p className="font-medium">
                {isDesignOrder
                  ? "Design & Production"
                  : "Direct Print Production"}
              </p>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <p className="text-sm text-muted-foreground">Requirements</p>

            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm">
              {order.description || "No requirements provided."}
            </p>
          </div>

          {/* Workflow information */}
          <div className="rounded-xl border p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-muted p-2">
                {isPrintOrder ? (
                  <Printer className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <FilePenLine className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div>
                <p className="text-sm font-medium">
                  {isPrintOrder ? "Print workflow" : "Design workflow"}
                </p>

                {isPrintOrder ? (
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    This order bypasses the designer and production-folder
                    workflow. Its materials can be configured and consumed
                    directly from inventory.
                  </p>
                ) : (
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    This order follows the design workflow, including a
                    production folder, task assignment, design review, and
                    approval before printing.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reference files */}
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Reference Files
            </p>

            {order.files.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No files uploaded.
              </p>
            ) : (
              <div className="space-y-2">
                {order.files.map((file) => {
                  const isImage = file.file_type?.startsWith("image/") ?? false;

                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 rounded-xl border p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {isImage ? (
                          <FileImage className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-medium"
                          title={file.file_name}
                        >
                          {file.file_name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {file.file_type ?? "Reference file"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`View ${file.file_name}`}
                          onClick={() =>
                            window.open(
                              file.file_url,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Download ${file.file_name}`}
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
