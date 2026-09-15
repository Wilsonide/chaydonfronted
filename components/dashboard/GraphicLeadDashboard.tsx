"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  Factory,
  FileCheck2,
  Palette,
  Printer,
} from "lucide-react";
import type { ElementType } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { GraphicLeadDashboard as GraphicLeadDashboardData } from "@/app/types/dashboard";

interface GraphicLeadDashboardProps {
  data: GraphicLeadDashboardData;
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

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function ProductionStage({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
      <div className="rounded-lg bg-muted p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">{label}</p>

        <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export default function GraphicLeadDashboard({
  data,
}: GraphicLeadDashboardProps) {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-muted p-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
          </div>

          <span className="text-sm font-medium text-muted-foreground">
            Production control
          </span>
        </div>

        <h1 className="mt-3 text-xl font-semibold tracking-tight">
          Design operations
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor design workload, reviews and production readiness.
        </p>
      </div>

      {/* PRIMARY KPIs */}
      <section>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Design queue"
            value={data.design_queue}
            description="Assigned or active design work"
            icon={Palette}
          />

          <StatCard
            title="Pending reviews"
            value={data.pending_reviews}
            description="Designs waiting for review"
            icon={Eye}
          />

          <StatCard
            title="Overdue tasks"
            value={data.overdue_tasks}
            description="Tasks past their deadline"
            icon={AlertTriangle}
            tone={data.overdue_tasks > 0 ? "warning" : "default"}
          />
        </div>
      </section>

      {/* TASK WORKLOAD */}
      <section>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Task workload
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <div className="grid gap-x-8 md:grid-cols-2">
              <div>
                <MetricRow label="Assigned" value={data.assigned_tasks} />

                <MetricRow label="In progress" value={data.in_progress_tasks} />

                <MetricRow label="Submitted" value={data.submitted_tasks} />
              </div>

              <div>
                <MetricRow
                  label="Revision required"
                  value={data.revision_required_tasks}
                />

                <MetricRow label="Approved" value={data.approved_tasks} />

                <MetricRow label="Overdue" value={data.overdue_tasks} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* PRODUCTION */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold tracking-tight">
            Production readiness
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            See how production folders are moving through the workflow.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ProductionStage
            label="Created"
            value={data.created}
            icon={Factory}
          />

          <ProductionStage
            label="Waiting for requirements"
            value={data.waiting_for_requirements}
            icon={ClipboardList}
          />

          <ProductionStage
            label="Ready for design"
            value={data.ready_for_design}
            icon={Palette}
          />

          <ProductionStage
            label="In design"
            value={data.in_design}
            icon={Palette}
          />

          <ProductionStage
            label="Design review"
            value={data.design_review}
            icon={Eye}
          />

          <ProductionStage
            label="Approved for print"
            value={data.approved_for_print}
            icon={FileCheck2}
          />

          <ProductionStage
            label="Printing"
            value={data.printing}
            icon={Printer}
          />

          <ProductionStage
            label="Completed"
            value={data.completed}
            icon={CheckCircle2}
          />
        </div>
      </section>

      {/* OPERATIONAL SIGNAL */}
      <section>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div
                className={
                  data.overdue_tasks > 0
                    ? "rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                    : "rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                }
              >
                {data.overdue_tasks > 0 ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {data.overdue_tasks > 0
                    ? "Production attention required"
                    : "Production is on track"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {data.overdue_tasks > 0
                    ? `${data.overdue_tasks} task${
                        data.overdue_tasks === 1 ? "" : "s"
                      } currently past the deadline.`
                    : "There are currently no overdue design tasks."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
