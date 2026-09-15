/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import productionService from "@/app/services/productionService";

import type { ProductionFolder, ProductionStatus } from "./types";

import { getProductionStatusLabel } from "./ProductionStatusBadge";

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

interface EditProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: ProductionFolder | null;
  onUpdated: () => void;
}

const statuses: ProductionStatus[] = [
  "CREATED",
  "WAITING_FOR_REQUIREMENTS",
  "READY_FOR_DESIGN",
  "IN_DESIGN",
  "DESIGN_REVIEW",
  "APPROVED_FOR_PRINT",
  "PRINTING",
  "COMPLETED",
  "CANCELLED",
];

export default function EditProductionDialog({
  open,
  onOpenChange,
  folder,
  onUpdated,
}: EditProductionDialogProps) {
  const [title, setTitle] = useState("");
  const [requirements, setRequirements] = useState("");
  const [status, setStatus] = useState<ProductionStatus>("CREATED");
  const [initializedFolderId, setInitializedFolderId] = useState<
    ProductionFolder["id"] | null
  >(null);

  const [submitting, setSubmitting] = useState(false);

  if (folder && folder.id !== initializedFolderId) {
    setInitializedFolderId(folder.id);
    setTitle(folder.title);
    setRequirements(folder.requirements ?? "");
    setStatus(folder.status);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!folder) {
      return;
    }

    if (!title.trim()) {
      toast.error("Production title is required");
      return;
    }

    try {
      setSubmitting(true);

      await productionService.updateProductionFolder(folder.id, {
        title: title.trim(),
        requirements: requirements.trim() || undefined,
        status,
      });

      toast.success("Production folder updated successfully");

      onUpdated();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail ?? "Failed to update production folder",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit Production Folder</DialogTitle>

          <DialogDescription>
            Update the production information and workflow status.
          </DialogDescription>
        </DialogHeader>

        {folder && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Production Folder</p>

              <p className="mt-1 font-semibold">{folder.folder_number}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-production-title">Title</Label>

              <Input
                id="edit-production-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-production-requirements">
                Customer Requirements
              </Label>

              <Textarea
                id="edit-production-requirements"
                value={requirements}
                onChange={(event) => setRequirements(event.target.value)}
                rows={5}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>

              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ProductionStatus)}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {statuses.map((item) => (
                    <SelectItem key={item} value={item}>
                      {getProductionStatusLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={submitting || !title.trim()}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
