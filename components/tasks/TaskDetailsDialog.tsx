"use client";

import { useState } from "react";

import {
  CheckCircle2,
  CircleDollarSign,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import taskService from "@/app/services/taskService";

import type { Task } from "@/components/tasks/types";

interface ReviewTaskDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewed: (task: Task) => void;
}

export default function ReviewTaskDialog({
  task,
  open,
  onOpenChange,
  onReviewed,
}: ReviewTaskDialogProps) {
  const [message, setMessage] = useState("");
  const [designerCharge, setDesignerCharge] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setMessage("");
      setDesignerCharge("");
      setSubmitting(false);
    }

    onOpenChange(nextOpen);
  };

  const handleReview = async (approve: boolean) => {
    if (!task) return;

    const trimmedMessage = message.trim();
    const trimmedCharge = designerCharge.trim();

    /*
     * A designer charge is required only when approving.
     *
     * Zero is a valid charge, so we must not use:
     *
     * if (!Number(designerCharge))
     *
     * because that would incorrectly reject 0.
     */
    if (approve) {
      if (!trimmedCharge) {
        toast.error("Enter the designer charge before approving the task.");
        return;
      }

      const numericCharge = Number(trimmedCharge);

      if (!Number.isFinite(numericCharge) || numericCharge < 0) {
        toast.error("Designer charge must be a valid amount of ₦0 or more.");
        return;
      }

      /*
       * Normalize the value before sending it to the API.
       *
       * Examples:
       * 2500     -> "2500.00"
       * 2500.5   -> "2500.50"
       * 0        -> "0.00"
       */
      const normalizedCharge = numericCharge.toFixed(2);

      setSubmitting(true);

      try {
        const response = await taskService.reviewTask(task.id, {
          approve: true,
          message: trimmedMessage || null,
          designer_charge: normalizedCharge,
        });

        onReviewed(response.data);

        toast.success("Task approved successfully.");

        onOpenChange(false);
      } catch (error) {
        console.error("Failed to approve task:", error);

        toast.error("Failed to approve task.");
      } finally {
        setSubmitting(false);
      }

      return;
    }

    /*
     * Revision requests do not require a designer charge.
     *
     * The backend schema has a default of 0.00, but because our
     * frontend payload type requires the field, send 0.00.
     */
    setSubmitting(true);

    try {
      const response = await taskService.reviewTask(task.id, {
        approve: false,
        message: trimmedMessage || null,
        designer_charge: "0.00",
      });

      onReviewed(response.data);

      toast.success("Revision requested successfully.");

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to request revision:", error);

      toast.error("Failed to request revision.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Review design task</DialogTitle>

          <DialogDescription>
            Review the submitted work and either approve it or send it back for
            revision.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Task summary */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold">{task.title}</p>

              <p className="text-sm text-muted-foreground">
                {task.production_folder.folder_number}
                {" · "}
                {task.production_folder.title}
              </p>
            </div>

            {task.description && (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {task.description}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Designer</p>

                <p className="mt-1 font-medium">
                  {task.assignee
                    ? `${task.assignee.first_name} ${task.assignee.last_name}`
                    : "Unassigned"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status</p>

                <p className="mt-1 font-medium">
                  {task.status.replaceAll("_", " ")}
                </p>
              </div>
            </div>
          </div>

          {/* Designer charge */}
          <div className="space-y-2">
            <label htmlFor="designer-charge" className="text-sm font-medium">
              Designer charge
            </label>

            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="designer-charge"
                type="number"
                min="0"
                step="0.01"
                value={designerCharge}
                onChange={(event) => setDesignerCharge(event.target.value)}
                placeholder="0.00"
                disabled={submitting}
                className="pl-9"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Enter the amount to charge for this design. Enter{" "}
              <span className="font-medium">0.00</span> if there is no designer
              charge. This amount is recorded when the task is approved.
            </p>
          </div>

          {/* Review message */}
          <div className="space-y-2">
            <label htmlFor="review-message" className="text-sm font-medium">
              Review message
            </label>

            <Textarea
              id="review-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Add feedback, approval notes, or revision instructions..."
              rows={5}
              disabled={submitting}
            />

            <p className="text-xs text-muted-foreground">
              This message will be added to the task activity as your review
              comment.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleReview(false)}
            disabled={submitting}
            className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Request revision
          </Button>

          <Button
            type="button"
            onClick={() => handleReview(true)}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Approve task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
