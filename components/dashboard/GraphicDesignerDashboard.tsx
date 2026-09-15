"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Palette,
  RotateCcw,
} from "lucide-react";
import type { ElementType } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { GraphicDesignerDashboard as GraphicDesignerDashboardData } from "@/app/types/dashboard";

interface GraphicDesignerDashboardProps {
  data: GraphicDesignerDashboardData;
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
  icon: ElementType;
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

function WorkRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export default function GraphicDesignerDashboard({
  data,
}: GraphicDesignerDashboardProps) {
  const hasAttention = data.revision_required > 0 || data.overdue > 0;

  const activeWork = data.assigned + data.in_progress;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-muted p-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
          </div>

          <span className="text-sm font-medium text-muted-foreground">
            Designer workspace
          </span>
        </div>

        <h1 className="mt-3 text-xl font-semibold tracking-tight">
          My workload
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Focus on assigned work, submissions and items requiring attention.
        </p>
      </div>

      {/* PRIMARY METRICS */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Assigned"
            value={data.assigned}
            description="Tasks assigned to you"
            icon={Palette}
          />

          <StatCard
            title="In progress"
            value={data.in_progress}
            description="Currently being worked on"
            icon={Clock3}
          />

          <StatCard
            title="Revision required"
            value={data.revision_required}
            description="Tasks needing changes"
            icon={RotateCcw}
            tone={data.revision_required > 0 ? "warning" : "default"}
          />

          <StatCard
            title="Submitted"
            value={data.submitted}
            description="Waiting for review"
            icon={FileCheck2}
          />

          <StatCard
            title="Approved"
            value={data.approved}
            description="Approved designs"
            icon={CheckCircle2}
            tone="success"
          />

          <StatCard
            title="Overdue"
            value={data.overdue}
            description="Past their deadline"
            icon={AlertTriangle}
            tone={data.overdue > 0 ? "warning" : "default"}
          />
        </div>
      </section>

      {/* WORK SUMMARY */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-sm font-semibold">
              Work summary
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <WorkRow label="Active workload" value={activeWork} />

            <WorkRow label="Assigned" value={data.assigned} />

            <WorkRow label="In progress" value={data.in_progress} />

            <WorkRow label="Submitted for review" value={data.submitted} />

            <WorkRow label="Approved" value={data.approved} />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-sm font-semibold">
              Attention required
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            {hasAttention ? (
              <div className="space-y-3">
                {data.revision_required > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/10">
                    <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                      <RotateCcw className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Revision required</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {data.revision_required}{" "}
                        {data.revision_required === 1
                          ? "task needs"
                          : "tasks need"}{" "}
                        revision.
                      </p>
                    </div>
                  </div>
                )}

                {data.overdue > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/50 dark:bg-red-950/10">
                    <div className="rounded-lg bg-red-100 p-2 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">Overdue work</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {data.overdue}{" "}
                        {data.overdue === 1 ? "task has" : "tasks have"} passed
                        their deadline.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/10">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold">Nothing urgent</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    You have no overdue or revision tasks.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* STATUS */}
      <section>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="text-sm font-semibold">
              Task progression
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Assigned</p>
                <p className="mt-2 text-xl font-bold tabular-nums">
                  {data.assigned}
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Working</p>
                <p className="mt-2 text-xl font-bold tabular-nums">
                  {data.in_progress}
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="mt-2 text-xl font-bold tabular-nums">
                  {data.submitted}
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="mt-2 text-xl font-bold tabular-nums">
                  {data.approved}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex items-center justify-end border-t border-border/60 pt-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          Assigned work
          <ArrowRight className="h-3.5 w-3.5" />
          Design
          <ArrowRight className="h-3.5 w-3.5" />
          Review
        </span>
      </div>
    </div>
  );
}
