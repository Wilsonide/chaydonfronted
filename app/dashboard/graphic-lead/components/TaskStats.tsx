"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  UserRoundPlus,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { Task } from "@/components/tasks/types";

interface TaskStatsProps {
  tasks: Task[];
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof ClipboardList;
  tone?: "default" | "warning" | "success";
}) {
  const iconStyles = {
    default: "bg-muted text-muted-foreground",

    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",

    success:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  };

  return (
    <Card className="group border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>

            <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
              {value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>

          <div
            className={`rounded-xl p-2.5 transition-transform group-hover:scale-105 ${iconStyles[tone]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TaskStats({ tasks }: TaskStatsProps) {
  // eslint-disable-next-line react-hooks/purity
  const currentTime = Date.now();

  const unassigned = tasks.filter(
    (task) => task.status === "UNASSIGNED",
  ).length;

  const active = tasks.filter(
    (task) => task.status === "ASSIGNED" || task.status === "IN_PROGRESS",
  ).length;

  const submitted = tasks.filter((task) => task.status === "SUBMITTED").length;

  const revisions = tasks.filter(
    (task) => task.status === "REVISION_REQUIRED",
  ).length;

  const approved = tasks.filter((task) => task.status === "APPROVED").length;

  const overdue = tasks.filter((task) => {
    if (!task.deadline) {
      return false;
    }

    if (task.status === "APPROVED") {
      return false;
    }

    return new Date(task.deadline).getTime() < currentTime;
  }).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <StatCard
        title="Total tasks"
        value={tasks.length}
        description="Tasks in this view"
        icon={ClipboardList}
      />

      <StatCard
        title="Unassigned"
        value={unassigned}
        description="Need a designer"
        icon={UserRoundPlus}
        tone={unassigned > 0 ? "warning" : "default"}
      />

      <StatCard
        title="Active"
        value={active}
        description="Assigned or working"
        icon={ClipboardList}
      />

      <StatCard
        title="For review"
        value={submitted}
        description="Awaiting your review"
        icon={Eye}
        tone={submitted > 0 ? "warning" : "default"}
      />

      <StatCard
        title="Revision"
        value={revisions}
        description="Changes requested"
        icon={AlertTriangle}
        tone={revisions > 0 ? "warning" : "default"}
      />

      <StatCard
        title="Approved"
        value={approved}
        description={`${overdue} overdue`}
        icon={CheckCircle2}
        tone="success"
      />
    </div>
  );
}
