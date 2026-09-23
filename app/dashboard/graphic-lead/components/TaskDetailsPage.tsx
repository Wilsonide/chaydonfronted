"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Loader2,
  MessageSquare,
  Package,
  Paperclip,
  RotateCcw,
  UserRound,
} from "lucide-react";

import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Textarea } from "@/components/ui/textarea";

import taskService from "@/app/services/taskService";

import type { Task, TaskComment } from "@/components/tasks/types";

import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskStatusBadge from "./TaskStatusBadge";

interface TaskDetailsPageProps {
  taskId: string;
}

function formatDate(value: string | null) {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatCurrency(value: string | number) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₦0.00";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function isOverdue(task: Task) {
  if (!task.deadline || task.status === "APPROVED") {
    return false;
  }

  return new Date(task.deadline).getTime() < Date.now();
}

export default function TaskDetailsPage({ taskId }: TaskDetailsPageProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const loadTask = async () => {
    setLoading(true);

    try {
      const response = await taskService.getTask(taskId);

      setTask(response.data);
    } catch (error) {
      console.error("Failed to load task:", error);

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
      console.error("Failed to load comments:", error);

      toast.error("Failed to load task comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => loadTask());
    void Promise.resolve().then(() => loadComments());
  }, [taskId]);

  const handleSendComment = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setSendingComment(true);

    try {
      const response = await taskService.addComment(taskId, {
        message: trimmedMessage,
      });

      setComments((current) => [...current, response.data]);
      setMessage("");

      toast.success("Comment added.");
    } catch (error) {
      console.error("Failed to add comment:", error);

      toast.error("Failed to add comment.");
    } finally {
      setSendingComment(false);
    }
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
          href="/dashboard/graphic-lead/tasks"
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
                The requested task could not be loaded.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overdue = isOverdue(task);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/graphic-lead/tasks"
          className={buttonVariants({
            variant: "ghost",
            className: "-ml-3",
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to tasks
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              {task.title}
            </h1>

            <p className="text-sm text-muted-foreground">
              Task created {formatDateOnly(task.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {task.status === "SUBMITTED" && (
              <Link
                href={`/dashboard/graphic-lead/tasks/${task.id}/review`}
                className={buttonVariants()}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Review submission
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* Task description */}
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
                  No task description was provided.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Production */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Production
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Production folder
                  </p>

                  <p className="mt-1 font-semibold">
                    {task.production_folder.folder_number}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Production title
                  </p>

                  <p className="mt-1 font-medium">
                    {task.production_folder.title}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Production status
                  </p>

                  <p className="mt-1 font-medium">
                    {task.production_folder.status.replaceAll("_", " ")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Created
                  </p>

                  <p className="mt-1 font-medium">
                    {formatDateOnly(task.production_folder.created_at)}
                  </p>
                </div>
              </div>

              {task.production_folder.requirements && (
                <div className="mt-6 border-t pt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Production requirements
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {task.production_folder.requirements}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Discussion
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/60" />

                  <p className="mt-3 text-sm font-medium">No comments yet</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Start the discussion with the assigned designer.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {comment.user.first_name.charAt(0)}
                        {comment.user.last_name.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
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

                        {comment.is_approval && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approval
                          </div>
                        )}

                        {comment.is_revision_request && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                            <RotateCcw className="h-3.5 w-3.5" />
                            Revision requested
                          </div>
                        )}

                        {comment.message && (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                            {comment.message}
                          </p>
                        )}

                        {comment.attachment_url && (
                          <a
                            href={comment.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
                          >
                            <Paperclip className="h-4 w-4" />

                            {comment.attachment_name || "View attachment"}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              <div className="border-t pt-5">
                <div className="space-y-3">
                  <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write a comment..."
                    rows={4}
                    disabled={sendingComment}
                  />

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendComment}
                      disabled={sendingComment || !message.trim()}
                    >
                      {sendingComment && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Add comment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignment</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Assigned designer
                  </p>

                  <p className="font-medium">
                    {task.assignee
                      ? `${task.assignee.first_name} ${task.assignee.last_name}`
                      : "Unassigned"}
                  </p>

                  {task.assignee && (
                    <p className="text-xs text-muted-foreground">
                      @{task.assignee.username}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Designer cost */}
          {task.status === "APPROVED" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CircleDollarSign className="h-4 w-4" />
                  Designer Cost
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">
                  {formatCurrency(task.designer_charge)}
                </p>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Designer charge recorded when this task was approved.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Deadline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {overdue ? (
                    <Clock3 className="h-5 w-5 text-destructive" />
                  ) : (
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>

                  <p
                    className={`mt-1 font-medium ${
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

          {/* Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workflow</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "APPROVED"].map(
                  (step, index) => {
                    const statuses = [
                      "ASSIGNED",
                      "IN_PROGRESS",
                      "SUBMITTED",
                      "APPROVED",
                    ];

                    const currentIndex = statuses.indexOf(task.status);

                    const stepIndex = index;

                    const completed = currentIndex >= stepIndex;

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

                        <p
                          className={`text-sm ${
                            completed ? "font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {step.replaceAll("_", " ")}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
