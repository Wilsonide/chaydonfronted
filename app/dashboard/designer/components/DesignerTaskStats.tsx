"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  RotateCcw,
  ClipboardList,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { Task } from "@/components/tasks/types";

interface DesignerTaskStatsProps {
  tasks: Task[];
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardList;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>

          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DesignerTaskStats({ tasks }: DesignerTaskStatsProps) {
  const assigned = tasks.filter((task) => task.status === "ASSIGNED").length;

  const inProgress = tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;

  const submitted = tasks.filter((task) => task.status === "SUBMITTED").length;

  const revisions = tasks.filter(
    (task) => task.status === "REVISION_REQUIRED",
  ).length;

  const approved = tasks.filter((task) => task.status === "APPROVED").length;

  const overdue = tasks.filter((task) => {
    if (!task.deadline || task.status === "APPROVED") {
      return false;
    }

    // eslint-disable-next-line react-hooks/purity
    return new Date(task.deadline).getTime() < Date.now();
  }).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <StatCard label="Assigned" value={assigned} icon={ClipboardList} />

      <StatCard label="In progress" value={inProgress} icon={Clock3} />

      <StatCard label="Submitted" value={submitted} icon={FileCheck2} />

      <StatCard label="Revisions" value={revisions} icon={RotateCcw} />

      <StatCard label="Approved" value={approved} icon={CheckCircle2} />

      <StatCard label="Overdue" value={overdue} icon={AlertTriangle} />
    </div>
  );
}
