"use client";

import { useEffect, useState } from "react";
import { Loader2, UserRoundPlus } from "lucide-react";
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

import type { Task } from "@/components/tasks/types";
import type { Designer } from "@/components/users/types";

import taskService from "@/app/services/taskService";
import userService from "@/app/services/user.service";

interface AssignDesignerDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: (task: Task) => void;
}

export default function AssignDesignerDialog({
  task,
  open,
  onOpenChange,
  onAssigned,
}: AssignDesignerDialogProps) {
  const [designers, setDesigners] = useState<Designer[]>([]);

  const [designerSelection, setDesignerSelection] = useState<{
    taskId: Task["id"] | null;
    value: string;
  }>({ taskId: null, value: "" });

  const [loadingDesigners, setLoadingDesigners] = useState(false);

  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const loadDesigners = async () => {
      try {
        setLoadingDesigners(true);

        const response = await userService.getDesigners();

        setDesigners(response.data);
      } catch (error) {
        console.error("Failed to load designers:", error);

        toast.error("Unable to load graphic designers.");
      } finally {
        setLoadingDesigners(false);
      }
    };

    void loadDesigners();
  }, [open, task]);

  const selectedDesigner =
    designerSelection.taskId === (task?.id ?? null)
      ? designerSelection.value
      : (task?.assigned_to ?? "");

  async function handleAssign() {
    if (!task) {
      return;
    }

    if (!selectedDesigner) {
      toast.error("Please select a designer.");

      return;
    }

    try {
      setAssigning(true);

      const response = await taskService.assignTask(task.id, {
        assigned_to: selectedDesigner,
      });

      onAssigned(response.data);

      toast.success(
        task.assigned_to
          ? "Designer reassigned successfully."
          : "Task assigned successfully.",
      );

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to assign designer:", error);

      toast.error("Unable to assign the designer.");
    } finally {
      setAssigning(false);
    }
  }

  const isReassignment = Boolean(task?.assigned_to);

  const selectedDesignerData = designers.find(
    (designer) => designer.id === selectedDesigner,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-muted p-2">
              <UserRoundPlus className="h-4 w-4 text-muted-foreground" />
            </div>

            {isReassignment ? "Reassign task" : "Assign task"}
          </DialogTitle>

          <DialogDescription>
            {task
              ? `Choose the designer responsible for "${task.title}".`
              : "Choose a graphic designer for this task."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {task && (
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">Task</p>

              <p className="mt-1 text-sm font-semibold">{task.title}</p>

              <p className="mt-1 text-xs text-muted-foreground">
                {task.production_folder.folder_number}
                {" · "}
                {task.production_folder.title}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="designer" className="text-sm font-medium">
              Graphic designer
            </label>

            {loadingDesigners ? (
              <div className="flex h-10 items-center gap-2 rounded-md border border-input px-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading designers...
              </div>
            ) : designers.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
                No active graphic designers are currently available.
              </div>
            ) : (
              <select
                id="designer"
                value={selectedDesigner}
                onChange={(event) =>
                  setDesignerSelection({
                    taskId: task?.id ?? null,
                    value: event.target.value,
                  })
                }
                disabled={assigning}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a designer</option>

                {designers.map((designer) => (
                  <option key={designer.id} value={designer.id}>
                    {designer.first_name} {designer.last_name} (@
                    {designer.username})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedDesignerData && (
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-xs text-muted-foreground">Selected designer</p>

              <p className="mt-1 text-sm font-semibold">
                {selectedDesignerData.first_name}{" "}
                {selectedDesignerData.last_name}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                @{selectedDesignerData.username}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assigning}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleAssign}
            disabled={assigning || loadingDesigners || !selectedDesigner}
            className="gap-2"
          >
            {assigning && <Loader2 className="h-4 w-4 animate-spin" />}

            {isReassignment ? "Reassign task" : "Assign task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
