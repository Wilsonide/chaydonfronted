"use client";

import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { Order } from "./types";

interface OrderDeleteDialogProps {
  order: Order | null;
  open: boolean;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function OrderDeleteDialog({
  order,
  open,
  deleting,
  onOpenChange,
  onConfirm,
}: OrderDeleteDialogProps) {
  if (!order) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!deleting) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{order.title}</span>?
          </p>

          <p className="text-sm text-destructive">
            This action cannot be undone. All reference files associated with
            this order will also be removed.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={onConfirm}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {deleting ? "Deleting..." : "Delete Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
