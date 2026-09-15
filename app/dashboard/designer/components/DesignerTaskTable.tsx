"use client";

import Link from "next/link";

import { ArrowRight, CalendarDays, Loader2, Package } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { Task } from "@/components/tasks/types";

import DesignerTaskStatusBadge from "./DesignerTaskStatusBadge";

interface DesignerTaskTableProps {
  tasks: Task[];
  loading: boolean;
}

function formatDeadline(value: string | null) {
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

function getPriorityClass(priority: Task["priority"]) {
  switch (priority) {
    case "URGENT":
      return "text-red-600 dark:text-red-400";

    case "HIGH":
      return "text-orange-600 dark:text-orange-400";

    case "MEDIUM":
      return "text-blue-600 dark:text-blue-400";

    default:
      return "text-muted-foreground";
  }
}

export default function DesignerTaskTable({
  tasks,
  loading,
}: DesignerTaskTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[280px] items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />

            <h3 className="mt-4 font-semibold">No tasks found</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Your assigned design tasks will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-4 font-medium">Task</th>

                <th className="px-5 py-4 font-medium">Production</th>

                <th className="px-5 py-4 font-medium">Priority</th>

                <th className="px-5 py-4 font-medium">Status</th>

                <th className="px-5 py-4 font-medium">Deadline</th>

                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {tasks.map((task) => {
                const overdue = isOverdue(task);

                return (
                  <tr
                    key={task.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-4">
                      <div className="max-w-[280px]">
                        <p className="truncate text-sm font-semibold">
                          {task.title}
                        </p>

                        {task.description && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium">
                          {task.production_folder.folder_number}
                        </p>

                        <p className="mt-1 max-w-[220px] truncate text-xs text-muted-foreground">
                          {task.production_folder.title}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-semibold ${getPriorityClass(
                          task.priority,
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <DesignerTaskStatusBadge status={task.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div
                        className={`flex items-center gap-2 text-sm ${
                          overdue
                            ? "font-medium text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        <CalendarDays className="h-4 w-4" />

                        <span>{formatDeadline(task.deadline)}</span>
                      </div>

                      {overdue && (
                        <p className="mt-1 text-xs text-destructive">Overdue</p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/designer/tasks/${task.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        Open
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
