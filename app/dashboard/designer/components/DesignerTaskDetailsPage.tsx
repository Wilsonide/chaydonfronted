"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  Package,
  RotateCcw,
  Send,
  UserRound,
} from "lucide-react";

import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import taskService from "@/app/services/taskService";

import type { Task, TaskComment, TaskStatus } from "@/components/tasks/types";

import DesignerTaskStatusBadge from "./DesignerTaskStatusBadge";
import DesignerCommentComposer from "./DesignerCommentComposer";

interface DesignerTaskDetailsPageProps {
  taskId: string;
}

function formatDate(value: string | null) {
  if (!value) {
    return "No deadline";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isOverdue(task: Task) {
  if (!task.deadline || task.status === "APPROVED") {
    return false;
  }

  return new Date(task.deadline).getTime() < Date.now();
}

function getNextAction(status: TaskStatus) {
  switch (status) {
    case "ASSIGNED":
      return {
        label: "Start work",
        nextStatus: "IN_PROGRESS" as TaskStatus,
      };

    case "IN_PROGRESS":
      return {
        label: "Submit for review",
        nextStatus: "SUBMITTED" as TaskStatus,
      };

    case "REVISION_REQUIRED":
      return {
        label: "Start revision",
        nextStatus: "IN_PROGRESS" as TaskStatus,
      };

    default:
      return null;
  }
}

function getWorkflowIndex(status: TaskStatus) {
  if (status === "REVISION_REQUIRED") {
    return 1;
  }

  const statuses: TaskStatus[] = [
    "ASSIGNED",
    "IN_PROGRESS",
    "SUBMITTED",
    "APPROVED",
  ];

  return statuses.indexOf(status);
}

export default function DesignerTaskDetailsPage({
  taskId,
}: DesignerTaskDetailsPageProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadTask = async () => {
    setLoading(true);

    try {
      const response = await taskService.getTask(taskId);

      setTask(response.data);
    } catch (error) {
      console.error("Failed to load designer task:", error);

      toast.error("Failed to load task.");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    setCommentsLoading(true);

    try {
      const response = await taskService.getComments(taskId);

      setComments(response.data);
    } catch (error) {
      console.error("Failed to load task comments:", error);

      toast.error("Failed to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => loadTask());
    void Promise.resolve().then(() => loadComments());
  }, [taskId]);

  const handleStatusUpdate = async (nextStatus: TaskStatus) => {
    if (!task) {
      return;
    }

    setUpdatingStatus(true);

    try {
      const response = await taskService.updateTaskStatus(task.id, {
        status: nextStatus,
      });

      setTask(response.data);

      if (nextStatus === "SUBMITTED") {
        toast.success("Task submitted for review.");
      } else if (nextStatus === "IN_PROGRESS") {
        toast.success("Task moved to in progress.");
      } else {
        toast.success("Task status updated.");
      }
    } catch (error) {
      console.error("Failed to update task status:", error);

      toast.error("Failed to update task status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCommentAdded = (comment: TaskComment) => {
    setComments((current) => [...current, comment]);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading task...
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/designer/tasks"
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to tasks
        </Link>

        <Card>
          <CardContent className="flex min-h-[240px] items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Task not found</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                This task could not be loaded.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextAction = getNextAction(task.status);
  const overdue = isOverdue(task);
  const workflowIndex = getWorkflowIndex(task.status);

  return (
    <div className="space-y-8">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="space-y-4">
        <Link
          href="/dashboard/designer/tasks"
          className={buttonVariants({ variant: "ghost", className: "-ml-3" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to tasks
        </Link>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <DesignerTaskStatusBadge status={task.status} />

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {task.title}
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                {task.production_folder.folder_number}
                {" · "}
                {task.production_folder.title}
              </p>
            </div>
          </div>

          {nextAction && (
            <Button
              onClick={() => void handleStatusUpdate(nextAction.nextStatus)}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : nextAction.nextStatus === "SUBMITTED" ? (
                <Send className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}

              {nextAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* -------------------------------------------------- */}
          {/* TASK BRIEF */}
          {/* -------------------------------------------------- */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Task brief
              </CardTitle>
            </CardHeader>

            <CardContent>
              {task.description ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No additional instructions were provided.
                </p>
              )}
            </CardContent>
          </Card>

          {/* -------------------------------------------------- */}
          {/* PRODUCTION */}
          {/* -------------------------------------------------- */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Production information
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Production folder
                </p>

                <p className="mt-1 font-semibold">
                  {task.production_folder.folder_number}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Production
                </p>

                <p className="mt-1 font-medium">
                  {task.production_folder.title}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Production status
                </p>

                <p className="mt-1 font-medium">
                  {task.production_folder.status.replaceAll("_", " ")}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Priority
                </p>

                <p className="mt-1 font-semibold">{task.priority}</p>
              </div>
            </CardContent>
          </Card>

          {/* -------------------------------------------------- */}
          {/* REQUIREMENTS */}
          {/* -------------------------------------------------- */}

          {task.production_folder.requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Production requirements
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {task.production_folder.requirements}
                </p>
              </CardContent>
            </Card>
          )}

          {/* -------------------------------------------------- */}
          {/* DISCUSSION */}
          {/* -------------------------------------------------- */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Discussion & files
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading discussion...
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50" />

                  <p className="mt-3 text-sm font-medium">No discussion yet</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Send a message or attach your design file to start the task
                    discussion.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      {/* Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {comment.user.first_name.charAt(0)}
                        {comment.user.last_name.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Author */}
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">
                            {comment.user.first_name} {comment.user.last_name}
                          </p>

                          <span className="text-xs text-muted-foreground">
                            {comment.user.role.replaceAll("_", " ")}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>

                        {/* Revision badge */}
                        {comment.is_revision_request && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                            <RotateCcw className="h-3.5 w-3.5" />
                            Revision requested
                          </div>
                        )}

                        {/* Approval badge */}
                        {comment.is_approval && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approved
                          </div>
                        )}

                        {/* Message */}
                        {comment.message && (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                            {comment.message}
                          </p>
                        )}

                        {/* Attachment */}
                        {comment.attachment_url && (
                          <a
                            href={comment.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 flex max-w-md items-center gap-3 rounded-xl border p-3 transition hover:bg-muted/50"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {comment.attachment_name || "Attached file"}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                Open attachment
                              </p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Composer */}
              <div className="border-t pt-6">
                <DesignerCommentComposer
                  taskId={task.id}
                  onCommentAdded={handleCommentAdded}
                  disabled={task.status === "APPROVED"}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================================================== */}
        {/* SIDEBAR */}
        {/* ================================================== */}

        <div className="space-y-6">
          {/* ------------------------------------------------ */}
          {/* CURRENT STATUS */}
          {/* ------------------------------------------------ */}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current status</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <DesignerTaskStatusBadge status={task.status} />

              {nextAction && (
                <Button
                  className="w-full"
                  onClick={() => void handleStatusUpdate(nextAction.nextStatus)}
                  disabled={updatingStatus}
                >
                  {updatingStatus && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {nextAction.nextStatus === "SUBMITTED" ? (
                    <Send className="mr-2 h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}

                  {nextAction.label}
                </Button>
              )}

              {task.status === "SUBMITTED" && (
                <div className="rounded-lg bg-violet-50 p-3 text-xs leading-5 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400">
                  Your work has been submitted and is waiting for the Graphic
                  Lead&apos;s review.
                </div>
              )}

              {task.status === "REVISION_REQUIRED" && (
                <div className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                  The Graphic Lead requested changes. Review the discussion
                  above, make the required changes, and start the revision.
                </div>
              )}

              {task.status === "APPROVED" && (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  This task has been approved.
                </div>
              )}
            </CardContent>
          </Card>

          {/* ------------------------------------------------ */}
          {/* DEADLINE */}
          {/* ------------------------------------------------ */}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deadline</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-start gap-3">
                <CalendarDays
                  className={`mt-0.5 h-5 w-5 ${
                    overdue ? "text-destructive" : "text-muted-foreground"
                  }`}
                />

                <div>
                  <p
                    className={`font-medium ${
                      overdue ? "text-destructive" : ""
                    }`}
                  >
                    {formatDate(task.deadline)}
                  </p>

                  {overdue && (
                    <p className="mt-1 text-xs text-destructive">
                      This task is overdue.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ------------------------------------------------ */}
          {/* ASSIGNMENT */}
          {/* ------------------------------------------------ */}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignment</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Assigned by</p>

                  <p className="font-medium">Graphic Lead</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ------------------------------------------------ */}
          {/* WORKFLOW */}
          {/* ------------------------------------------------ */}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workflow</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "APPROVED"].map(
                  (step, index) => {
                    const completed = workflowIndex >= index;

                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                            completed
                              ? "border-primary bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-semibold">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-sm ${
                            completed ? "font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {step.replaceAll("_", " ")}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>

              {task.status === "REVISION_REQUIRED" && (
                <div className="mt-5 border-t pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                      <RotateCcw className="h-4 w-4" />
                    </div>

                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Revision required
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
