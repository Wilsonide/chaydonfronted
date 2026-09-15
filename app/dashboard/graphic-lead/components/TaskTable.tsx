"use client";

import { ClipboardList } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { Task } from "@/components/tasks/types";

import TaskTableRow from "./TaskTableRow";

interface TaskTableProps {
  tasks: Task[];
  loading?: boolean;
  onAssign: (task: Task) => void;
  onReview: (task: Task) => void;
  onView: (task: Task) => void;
}

export default function TaskTable({
  tasks,
  loading = false,
  onAssign,
  onReview,
  onView,
}: TaskTableProps) {
  if (loading) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-0">
          <div className="space-y-4 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
          <div className="rounded-xl bg-muted p-3">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </div>

          <h3 className="mt-4 text-sm font-semibold">No tasks found</h3>

          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            There are no tasks matching the current search and filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                Task
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                Production
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                Designer
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                Priority
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                Status
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                Deadline
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <TaskTableRow
                key={task.id}
                task={task}
                onAssign={onAssign}
                onReview={onReview}
                onView={onView}
              />
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
