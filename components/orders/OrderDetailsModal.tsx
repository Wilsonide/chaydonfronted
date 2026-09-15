"use client";

import { Download, ExternalLink, FileImage, FileText } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Order</p>

              <p className="font-medium">{order.title}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>

              <OrderStatusBadge status={order.status} />
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
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Requirements</p>

            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm">
              {order.description || "No requirements provided."}
            </p>
          </div>

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
