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
  Circle,
  Users,
  Activity,
} from "lucide-react";
import { useEffect, useState, type ElementType } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type {
  GraphicLeadDashboard as GraphicLeadDashboardData,
  StaffActivity,
} from "@/app/types/dashboard";

interface GraphicLeadDashboardProps {
  data: GraphicLeadDashboardData;
}

function formatDate(value: string | null) {
  if (!value) return "Never";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function relativeTime(value: string | null, now: number | null) {
  if (!value || now === null) return "No activity";

  const diff = now - new Date(value).getTime();

  if (diff < 0) return "Just now";

  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs} hr ago`;

  return `${Math.floor(hrs / 24)} day(s) ago`;
}

function formatRole(role: StaffActivity["role"]) {
  switch (role) {
    case "FRONT_DESK":
      return "Front Desk";

    case "GRAPHIC_LEAD":
      return "Graphic Lead";

    case "GRAPHIC_DESIGNER":
      return "Graphic Designer";

    case "SUPER_ADMIN":
      return "Super Admin";

    default:
      return role;
  }
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
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
  const styles = {
    default: "bg-muted text-muted-foreground",
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    success:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  };

  return (
    <Card className="border-border/60 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>

            <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
              {value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>

          <div className={`rounded-xl p-3 ${styles[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span
        className={`text-sm font-semibold tabular-nums ${
          warning ? "text-amber-600 dark:text-amber-400" : ""
        }`}
      >
        {value}
      </span>
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
    <div className="rounded-xl border border-border/60 bg-card p-4 transition hover:bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>

        <span className="text-2xl font-bold tabular-nums">{value}</span>
      </div>

      <p className="mt-4 text-sm font-medium">{label}</p>
    </div>
  );
}

function statusBadge(status: string | null) {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";

    case "SUBMITTED":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";

    case "REVISION_REQUIRED":
      return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";

    case "APPROVED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";

    case "ASSIGNED":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

    default:
      return "bg-muted text-muted-foreground";
  }
}

function presenceBadge(staff: StaffActivity) {
  if (staff.is_online) {
    return {
      label: "Online",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      dot: "text-emerald-500",
    };
  }

  if (staff.last_activity) {
    return {
      label: "Idle",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      dot: "text-amber-500",
    };
  }

  return {
    label: "Offline",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "text-slate-400",
  };
}

export default function GraphicLeadDashboard({
  data,
}: GraphicLeadDashboardProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNow(Date.now());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const activeProduction =
    data.created +
    data.waiting_for_requirements +
    data.ready_for_design +
    data.in_design +
    data.design_review +
    data.approved_for_print +
    data.printing;

  const hasAttention = data.overdue_tasks > 0 || data.pending_reviews > 0;

  // Graphic Lead should only see Graphic Designers.
  const designers = data.staff.filter(
    (staff) => staff.role === "GRAPHIC_DESIGNER",
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/30 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Design Operations Center
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Graphic Lead Dashboard
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Monitor designer activity, production readiness and review
              workload.
            </p>
          </div>

          <div
            className={`rounded-xl border px-4 py-3 ${
              hasAttention
                ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20"
                : "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {hasAttention ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              )}

              <span className="font-semibold">
                {hasAttention ? "Needs Attention" : "Design Flow Healthy"}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {data.pending_reviews} awaiting review • {data.overdue_tasks}{" "}
              overdue
            </p>
          </div>
        </div>
      </div>

      {/* KPI */}
      <section>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Design Queue"
            value={data.design_queue}
            description="Assigned or active work"
            icon={Palette}
          />

          <StatCard
            title="Pending Reviews"
            value={data.pending_reviews}
            description="Waiting for approval"
            icon={Eye}
          />

          <StatCard
            title="Overdue Tasks"
            value={data.overdue_tasks}
            description="Past deadline"
            icon={AlertTriangle}
            tone={data.overdue_tasks > 0 ? "warning" : "default"}
          />
        </div>
      </section>

      {/* Live Designers */}
      <section>
        <SectionHeading
          title="Live Designers"
          description="Monitor designer presence, activity and current design work."
        />

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-0">
            {designers.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No designers available.
              </div>
            ) : (
              <div className="divide-y">
                {designers.map((staff) => {
                  const presence = presenceBadge(staff);

                  return (
                    <div
                      key={staff.id}
                      className="flex flex-col gap-4 p-5 transition hover:bg-muted/20 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative mt-1">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <Circle
                            className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 fill-current ${presence.dot}`}
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{staff.name}</h3>

                            <span className="text-xs text-muted-foreground">
                              @{staff.username}
                            </span>

                            <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                              {formatRole(staff.role)}
                            </span>

                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${presence.className}`}
                            >
                              {presence.label}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>
                              <span className="font-medium text-foreground">
                                Current Task:
                              </span>{" "}
                              {staff.current_task ?? "No active task"}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {relativeTime(staff.last_activity, now)}
                              </span>

                              <span>
                                Last sign-in: {formatDate(staff.last_login)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {staff.task_status && (
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                            staff.task_status,
                          )}`}
                        >
                          {staff.task_status.replaceAll("_", " ")}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Task Summary */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>

          <CardContent>
            <MetricRow label="Assigned" value={data.assigned_tasks} />

            <MetricRow label="In Progress" value={data.in_progress_tasks} />

            <MetricRow label="Submitted" value={data.submitted_tasks} />

            <MetricRow
              label="Revision Required"
              value={data.revision_required_tasks}
            />

            <MetricRow label="Approved" value={data.approved_tasks} />

            <MetricRow
              label="Overdue"
              value={data.overdue_tasks}
              warning={data.overdue_tasks > 0}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Snapshot</CardTitle>
          </CardHeader>

          <CardContent>
            <MetricRow label="Active Production" value={activeProduction} />

            <MetricRow label="Ready for Design" value={data.ready_for_design} />

            <MetricRow label="In Design" value={data.in_design} />

            <MetricRow label="Completed" value={data.completed} />
          </CardContent>
        </Card>
      </section>

      {/* Production Pipeline */}
      <section>
        <SectionHeading
          title="Production Pipeline"
          description="Track folders moving through each production stage."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ProductionStage
            label="Created"
            value={data.created}
            icon={Factory}
          />

          <ProductionStage
            label="Waiting"
            value={data.waiting_for_requirements}
            icon={ClipboardList}
          />

          <ProductionStage
            label="Ready for Design"
            value={data.ready_for_design}
            icon={Palette}
          />

          <ProductionStage
            label="In Design"
            value={data.in_design}
            icon={Palette}
          />

          <ProductionStage
            label="Design Review"
            value={data.design_review}
            icon={Eye}
          />

          <ProductionStage
            label="Approved"
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
    </div>
  );
}
