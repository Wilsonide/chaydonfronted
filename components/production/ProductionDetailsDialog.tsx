"use client";

import { useEffect, useState } from "react";

import {
  CalendarDays,
  ClipboardList,
  Download,
  ExternalLink,
  FileImage,
  FileText,
  FolderKanban,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Skeleton } from "@/components/ui/skeleton";

import type { Order } from "@/components/orders/types";
import type { ProductionFolder } from "./types";

import orderService from "@/app/services/order.service";

import ProductionStatusBadge from "./ProductionStatusBadge";
import ProductionFiles from "./ProductionFiles";
import ProductionActivityTimeline from "./ProductionActivityTimeline";

import { Button } from "@/components/ui/button";

interface ProductionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: ProductionFolder | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ProductionDetailsDialog({
  open,
  onOpenChange,
  folder,
  loading,
  onRefresh,
}: ProductionDetailsDialogProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    if (!open || !folder) {
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      try {
        setOrderLoading(true);

        const response = await orderService.getOrder(folder.order_id);

        if (!cancelled) {
          setOrder(response.data);
        }
      } catch {
        if (!cancelled) {
          setOrder(null);
        }
      } finally {
        if (!cancelled) {
          setOrderLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [open, folder]);

  const handleDownloadReferenceFile = async (file: Order["files"][number]) => {
    if (!file.file_url) {
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
    } catch (error) {
      console.error("Reference file download failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[850px]">
        <DialogHeader>
          <DialogTitle>Production Folder Details</DialogTitle>

          <DialogDescription>
            Review production information, reference files, production files,
            and activity history.
          </DialogDescription>
        </DialogHeader>

        {loading || !folder ? (
          <div className="space-y-6 py-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-7 py-2">
            {/* Production summary */}
            <div className="rounded-xl border bg-muted/30 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-muted-foreground" />

                    <p className="font-semibold">{folder.folder_number}</p>
                  </div>

                  <h2 className="mt-2 text-xl font-semibold">{folder.title}</h2>
                </div>

                <ProductionStatusBadge status={folder.status} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Order
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {orderLoading
                      ? "Loading order..."
                      : (order?.title ?? "Order unavailable")}
                  </p>

                  {order?.customer && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.customer.name} · {order.customer.phone}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Order ID
                  </p>

                  <p className="mt-1 break-all text-sm">{folder.order_id}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Created
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />

                    {formatDate(folder.created_at)}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Last Updated
                  </p>

                  <p className="mt-1 text-sm">
                    {formatDate(folder.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer requirements */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />

                <h3 className="font-semibold">Customer Requirements</h3>
              </div>

              <div className="rounded-lg border p-4">
                {folder.requirements ? (
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {folder.requirements}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No requirements have been added.
                  </p>
                )}
              </div>
            </div>

            {/* Original order reference files */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Order Reference Files</h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Files originally uploaded with this customer order.
                  </p>
                </div>

                {!orderLoading && order && (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {order.files.length}{" "}
                    {order.files.length === 1 ? "file" : "files"}
                  </span>
                )}
              </div>

              {orderLoading ? (
                <div className="flex items-center justify-center rounded-xl border p-8">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />

                  <span className="text-sm text-muted-foreground">
                    Loading reference files...
                  </span>
                </div>
              ) : !order ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-2 text-sm font-medium">
                    Order could not be loaded
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    The original order information is currently unavailable.
                  </p>
                </div>
              ) : order.files.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-2 text-sm font-medium">No reference files</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    No files were uploaded with this order.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {order.files.map((file) => {
                    const isImage =
                      file.file_type?.startsWith("image/") ?? false;

                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 rounded-xl border bg-background p-3"
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
                            onClick={() => handleDownloadReferenceFile(file)}
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

            {/* Production files */}
            <ProductionFiles
              folderId={folder.id}
              files={folder.files}
              onChanged={onRefresh}
            />

            {/* Activity */}
            <ProductionActivityTimeline activities={folder.activities} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
