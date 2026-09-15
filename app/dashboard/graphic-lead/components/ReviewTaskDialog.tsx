"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
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
  const [submitting, setSubmitting] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setMessage("");
      setSubmitting(false);
    }

    onOpenChange(nextOpen);
  };

  const handleReview = async (approve: boolean) => {
    if (!task) return;

    setSubmitting(true);

    try {
      const response = await taskService.reviewTask(task.id, {
        approve,
        message: message.trim() || null,
      });

      onReviewed(response.data);

      toast.success(
        approve
          ? "Task approved successfully."
          : "Revision requested successfully.",
      );

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to review task:", error);

      toast.error(
        approve ? "Failed to approve task." : "Failed to request revision.",
      );
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
