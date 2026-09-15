"use client";

import { CalendarDays, ClipboardCheck, Eye, UserRoundPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Task } from "@/components/tasks/types";

import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";

interface TaskTableRowProps {
  task: Task;
  onAssign: (task: Task) => void;
  onReview: (task: Task) => void;
  onView: (task: Task) => void;
}

function formatDeadline(deadline: string | null) {
  if (!deadline) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(deadline));
}

function isOverdue(task: Task) {
  if (!task.deadline) {
    return false;
  }

  if (task.status === "APPROVED") {
    return false;
  }

  return new Date(task.deadline).getTime() < Date.now();
}

export default function TaskTableRow({
  task,
  onAssign,
  onReview,
  onView,
}: TaskTableRowProps) {
  const overdue = isOverdue(task);

  const designerName = task.assignee
    ? `${task.assignee.first_name} ${task.assignee.last_name}`
    : null;

  const canReview = task.status === "SUBMITTED";

  return (
    <tr className="border-b border-border/50 last:border-0">
      {/* Task */}
      <td className="px-5 py-4">
        <div className="min-w-[220px]">
          <p className="font-medium">{task.title}</p>

          {task.description && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>
      </td>

      {/* Production */}
      <td className="px-5 py-4">
        <div className="min-w-[180px]">
          <p className="text-sm font-medium">
            {task.production_folder.folder_number}
          </p>

          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {task.production_folder.title}
          </p>
        </div>
      </td>

      {/* Designer */}
      <td className="px-5 py-4">
        {designerName ? (
          <div>
            <p className="text-sm font-medium">{designerName}</p>

            <p className="text-xs text-muted-foreground">
              @{task.assignee?.username}
            </p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Not assigned</span>
        )}
      </td>

      {/* Priority */}
      <td className="px-5 py-4">
        <TaskPriorityBadge priority={task.priority} />
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <TaskStatusBadge status={task.status} />
      </td>

      {/* Deadline */}
      <td className="px-5 py-4">
        <div
          className={
            overdue
              ? "flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
              : "flex items-center gap-1.5 text-xs text-muted-foreground"
          }
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDeadline(task.deadline)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {/* Assign / Reassign */}
          {(task.status === "UNASSIGNED" || task.status === "ASSIGNED") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssign(task)}
              className="gap-2"
            >
              <UserRoundPlus className="h-4 w-4" />

              {task.status === "UNASSIGNED" ? "Assign" : "Reassign"}
            </Button>
          )}

          {/* Review */}
          <Button
            size="sm"
            variant={canReview ? "default" : "outline"}
            onClick={() => onReview(task)}
            disabled={!canReview}
            className="gap-2"
            title={
              canReview
                ? "Review submitted task"
                : "Task must be submitted before it can be reviewed"
            }
          >
            <ClipboardCheck className="h-4 w-4" />
            Review
          </Button>

          {/* Details */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(task)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Details
          </Button>
        </div>
      </td>
    </tr>
  );
}
