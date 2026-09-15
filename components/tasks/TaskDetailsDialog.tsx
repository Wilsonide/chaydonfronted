"use client";

import { useState } from "react";

import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  Loader2,
  UserRound,
  X,
} from "lucide-react";

import { toast } from "sonner";

import taskService from "@/app/services/taskService";

import { Task } from "./types";
import TaskComments from "./TaskComments";

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: string | null) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getAssigneeName(task: Task) {
  if (!task.assignee) {
    return "Task not assigned";
  }

  return `${task.assignee.first_name} ${task.assignee.last_name}`;
}

export default function TaskDetailsDialog({
  task,
  open,
  onClose,
  onUpdated,
}: TaskDetailsDialogProps) {
  const [reviewedTask, setReviewedTask] = useState<Task | null>(null);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const currentTask = reviewedTask?.id === task?.id ? reviewedTask : task;

  if (!open || !currentTask) {
    return null;
  }

  const currentTaskId = currentTask.id;
  const folder = currentTask.production_folder;
  const canReview = currentTask.status === "SUBMITTED";

  async function handleReview(approve: boolean) {
    try {
      setReviewing(true);

      const response = await taskService.reviewTask(currentTaskId, {
        approve,
        message: reviewMessage.trim() || undefined,
      });

      setReviewedTask(response.data);
      setReviewMessage("");

      toast.success(approve ? "Task approved." : "Revision requested.");

      onUpdated();
    } catch (error) {
      console.error("Failed to review task:", error);

      toast.error("Failed to update task review.");
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto my-8 w-full max-w-5xl overflow-hidden rounded-2xl border bg-background shadow-xl">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex items-start justify-between border-b px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="truncate text-xl font-semibold">
                {currentTask.title}
              </h2>

              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {formatStatus(currentTask.status)}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Task details and activity
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setReviewMessage("");
              onClose();
            }}
            className="ml-4 shrink-0 rounded-lg p-2 transition hover:bg-muted"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================================================== */}
        {/* CONTENT */}
        {/* ================================================== */}

        <div className="grid gap-6 p-6 lg:grid-cols-[300px_1fr]">
          {/* ================================================== */}
          {/* LEFT SIDEBAR */}
          {/* ================================================== */}

          <div className="space-y-4">
            {/* ================================================== */}
            {/* TASK INFORMATION */}
            {/* ================================================== */}

            <div className="rounded-xl border p-4">
              <h3 className="mb-4 text-sm font-semibold">Task Information</h3>

              <div className="space-y-5 text-sm">
                {/* Production Folder */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-primary" />

                    <p className="text-xs font-medium text-muted-foreground">
                      Production Folder
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold">
                          {folder.folder_number}
                        </p>

                        <p className="mt-1 font-medium">{folder.title}</p>
                      </div>

                      <span className="shrink-0 rounded-full bg-background px-2 py-1 text-[10px] font-medium">
                        {formatStatus(folder.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Production #{folder.production_number}
                    </p>
                  </div>
                </div>

                {/* Assigned Designer */}
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <UserRound className="h-4 w-4 text-primary" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {getAssigneeName(currentTask)}
                      </p>

                      {currentTask.assignee && (
                        <p className="truncate text-xs text-muted-foreground">
                          @{currentTask.assignee.username}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>

                  <p className="mt-1 font-medium">
                    {formatStatus(currentTask.priority)}
                  </p>
                </div>

                {/* Deadline */}
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>

                  <div className="mt-1 flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />

                    <span>{formatDate(currentTask.deadline)}</span>
                  </div>
                </div>

                {/* Created */}
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>

                  <p className="mt-1">{formatDate(currentTask.created_at)}</p>
                </div>
              </div>
            </div>

            {/* ================================================== */}
            {/* DESCRIPTION */}
            {/* ================================================== */}

            {currentTask.description && (
              <div className="rounded-xl border p-4">
                <h3 className="mb-2 text-sm font-semibold">Description</h3>

                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {currentTask.description}
                </p>
              </div>
            )}

            {/* ================================================== */}
            {/* FOLDER REQUIREMENTS */}
            {/* ================================================== */}

            {folder.requirements && (
              <div className="rounded-xl border p-4">
                <h3 className="mb-2 text-sm font-semibold">
                  Folder Requirements
                </h3>

                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {folder.requirements}
                </p>
              </div>
            )}

            {/* ================================================== */}
            {/* REVIEW */}
            {/* ================================================== */}

            {canReview && (
              <div className="rounded-xl border p-4">
                <h3 className="text-sm font-semibold">Review Task</h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  This task has been submitted by the designer.
                </p>

                <textarea
                  value={reviewMessage}
                  onChange={(event) => setReviewMessage(event.target.value)}
                  rows={3}
                  placeholder="Optional review message..."
                  className="mt-4 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {/* Request Revision */}
                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() => handleReview(false)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {reviewing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Revision
                  </button>

                  {/* Approve */}
                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() => handleReview(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {reviewing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================================================== */}
          {/* COMMENTS / ACTIVITY */}
          {/* ================================================== */}

          <div className="min-w-0">
            <TaskComments taskId={currentTask.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
