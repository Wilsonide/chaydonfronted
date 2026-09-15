"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Loader2,
  MoreHorizontal,
  Pencil,
  UserRound,
  UserRoundX,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Task, TaskPriority, TaskStatus } from "./types";

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  deletingId: string | null;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-600",
  MEDIUM: "border-blue-200 bg-blue-50 text-blue-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  URGENT: "border-red-200 bg-red-50 text-red-700",
};

const statusStyles: Record<TaskStatus, string> = {
  UNASSIGNED: "border-slate-200 bg-slate-50 text-slate-600",
  ASSIGNED: "border-blue-200 bg-blue-50 text-blue-700",
  IN_PROGRESS: "border-indigo-200 bg-indigo-50 text-indigo-700",
  SUBMITTED: "border-purple-200 bg-purple-50 text-purple-700",
  REVISION_REQUIRED: "border-orange-200 bg-orange-50 text-orange-700",
  APPROVED: "border-green-200 bg-green-50 text-green-700",
};

const formatStatus = (value: string) => {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "No deadline";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No deadline";
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isOverdue = (deadline: string | null, status: TaskStatus) => {
  if (!deadline) {
    return false;
  }

  if (status === "APPROVED" || status === "SUBMITTED") {
    return false;
  }

  return new Date(deadline).getTime() < Date.now();
};

export default function TaskTable({
  tasks,
  loading,
  deletingId,
  onView,
  onEdit,
  onDelete,
}: TaskTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />

          <p className="text-sm text-slate-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border bg-white py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <FolderKanban className="h-6 w-6 text-slate-500" />
        </div>

        <h3 className="text-sm font-semibold text-slate-900">No tasks found</h3>

        <p className="mt-1 text-sm text-slate-500">
          There are no tasks matching your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr className="border-b bg-slate-50/80 text-left">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Task
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Production folder
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assignee
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Priority
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Deadline
              </th>

              <th className="w-12 px-3 py-4" />
            </tr>
          </thead>

          <tbody className="divide-y">
            {tasks.map((task) => {
              const overdue = isOverdue(task.deadline, task.status);

              const isDeleting = deletingId === task.id;

              return (
                <tr
                  key={task.id}
                  className="group transition-colors hover:bg-slate-50/70"
                >
                  {/* TASK */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onView(task)}
                      className="block max-w-[300px] text-left"
                    >
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600">
                        {task.title}
                      </div>

                      {task.description && (
                        <div className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {task.description}
                        </div>
                      )}
                    </button>
                  </td>

                  {/* PRODUCTION FOLDER */}
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <FolderKanban className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900">
                          {task.production_folder.folder_number}
                        </div>

                        <div className="max-w-[240px] truncate text-sm text-slate-600">
                          {task.production_folder.title}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {formatStatus(task.production_folder.status)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ASSIGNEE */}
                  <td className="px-5 py-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <UserRound className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="font-medium text-slate-900">
                            {task.assignee.first_name} {task.assignee.last_name}
                          </div>

                          <div className="truncate text-xs text-slate-500">
                            @{task.assignee.username}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                          <UserRoundX className="h-4 w-4" />
                        </div>

                        <span className="text-sm font-medium">
                          Task not assigned
                        </span>
                      </div>
                    )}
                  </td>

                  {/* PRIORITY */}
                  <td className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={priorityStyles[task.priority]}
                    >
                      {formatStatus(task.priority)}
                    </Badge>
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={statusStyles[task.status]}
                    >
                      {formatStatus(task.status)}
                    </Badge>
                  </td>

                  {/* DEADLINE */}
                  <td className="px-5 py-4">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        overdue ? "font-medium text-red-600" : "text-slate-600"
                      }`}
                    >
                      {overdue ? (
                        <Clock3 className="h-4 w-4" />
                      ) : (
                        <CalendarDays className="h-4 w-4" />
                      )}

                      <span>{formatDate(task.deadline)}</span>
                    </div>

                    {overdue && (
                      <div className="mt-1 text-xs text-red-500">Overdue</div>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-3 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => onView(task)}
                          disabled={isDeleting}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onEdit(task)}
                          disabled={isDeleting}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit task
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onDelete(task)}
                          disabled={isDeleting}
                          className="text-red-600 focus:text-red-600"
                        >
                          {isDeleting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2Icon className="mr-2 h-4 w-4" />
                          )}
                          Delete task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Trash2Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}
