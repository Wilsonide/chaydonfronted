"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Factory,
  FileCheck2,
  FileText,
  PackageCheck,
  Palette,
  Printer,
  ShoppingCart,
  Users,
  Circle,
} from "lucide-react";

import type { ElementType } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type {
  StaffActivity,
  SuperAdminDashboard as SuperAdminDashboardData,
} from "@/app/types/dashboard";

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

function formatCurrency(value: number | string) {
  return `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string | null) {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function relativeTime(value: string | null) {
  if (!value) return "No activity";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No activity";
  }

  const diff = Date.now() - date.getTime();

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

function presenceBadge(staff: StaffActivity) {
  if (staff.is_online) {
    return {
      label: "Online",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      dot: "text-emerald-500",
    };
  }

  return {
    label: "Offline",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    dot: "text-slate-400",
  };
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 min-w-0">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

      <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">
        {description}
      </p>
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
  value: string | number;
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
    <Card className="h-full min-w-0 border-border/60 shadow-sm">
      <CardContent className="flex h-full min-w-0 items-start justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted-foreground">{title}</p>

          <p className="mt-2 break-words text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>

        <div
          className={`shrink-0 rounded-xl p-3 ${styles[tone]}`}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
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
  value: number | string;
  warning?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 border-b border-border/50 py-3 last:border-0">
      <span className="min-w-0 truncate text-sm text-muted-foreground">
        {label}
      </span>

      <span
        className={`shrink-0 text-right text-sm font-semibold tabular-nums ${
          warning ? "text-amber-600 dark:text-amber-400" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PipelineCard({
  title,
  value,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: number;
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
    <div className="flex min-h-[116px] min-w-0 flex-col justify-between rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className={`shrink-0 rounded-lg p-2 ${styles[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>

        <span className="shrink-0 text-2xl font-bold tabular-nums">
          {value}
        </span>
      </div>

      <p className="mt-4 break-words text-sm font-medium leading-5">{title}</p>
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

function ProductionSnapshotCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ElementType;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
      <div className="shrink-0 rounded-lg bg-muted p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>

        <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard({
  data,
}: SuperAdminDashboardProps) {
  const activeProduction =
    data.production.created +
    data.production.waiting +
    data.production.ready_for_design +
    data.production.in_design +
    data.production.design_review +
    data.production.approved_for_print +
    data.production.printing;

  const activeTasks =
    data.tasks.assigned +
    data.tasks.in_progress +
    data.tasks.submitted +
    data.tasks.revision;

  const hasAttention =
    data.business.overdue_orders > 0 ||
    data.business.due_today > 0 ||
    data.tasks.overdue > 0;

  return (
    <main className="w-full min-w-0 overflow-x-hidden">
      <div className="w-full min-w-0 space-y-6 pb-8 sm:space-y-8">
        {/* Executive Header */}
        <section className="w-full min-w-0 rounded-2xl border border-border/60 bg-gradient-to-br from-background to-muted/30 p-4 sm:p-6">
          <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                PrintFlow Command Center
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Business Overview
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Monitor operations, production, designers, and financial
                performance in one place.
              </p>
            </div>

            <div
              className={`w-full shrink-0 rounded-xl border p-4 sm:w-auto sm:min-w-[250px] ${
                hasAttention
                  ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20"
                  : "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20"
              }`}
            >
              <div className="flex items-center gap-2">
                {hasAttention ? (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                )}

                <span className="font-semibold">
                  {hasAttention ? "Needs Attention" : "Operations Healthy"}
                </span>
              </div>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {data.business.overdue_orders} overdue orders •{" "}
                {data.tasks.overdue} overdue tasks
              </p>
            </div>
          </div>
        </section>

        {/* KPI */}
        <section className="min-w-0">
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Customers"
              value={data.business.customers}
              description={`${data.business.new_customers_today} new today`}
              icon={Users}
            />

            <StatCard
              title="Orders"
              value={data.business.orders}
              description={`${data.business.new_orders_today} today`}
              icon={ShoppingCart}
            />

            <StatCard
              title="Revenue"
              value={formatCurrency(data.business.revenue_this_month)}
              description={`${formatCurrency(
                data.business.payments_today,
              )} received today`}
              icon={DollarSign}
              tone="success"
            />

            <StatCard
              title="Outstanding"
              value={formatCurrency(data.business.outstanding_balance)}
              description="Customer balances"
              icon={CreditCard}
              tone={
                Number(data.business.outstanding_balance) > 0
                  ? "warning"
                  : "default"
              }
            />
          </div>
        </section>

        {/* Live Staff */}
        <section className="min-w-0">
          <SectionHeading
            title="Live Staff"
            description="Monitor Front Desk, Graphic Lead, and Graphic Designer presence and activity."
          />

          <Card className="min-w-0 overflow-hidden border-border/60 shadow-sm">
            <CardContent className="p-0">
              {data.staff.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-6">
                  No staff activity available.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {data.staff.map((staff) => {
                    const presence = presenceBadge(staff);

                    return (
                      <div key={staff.id} className="min-w-0 p-4 sm:p-5">
                        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                            <div className="relative mt-1 shrink-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted sm:h-11 sm:w-11">
                                <Users className="h-5 w-5 text-muted-foreground" />
                              </div>

                              <Circle
                                className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 fill-current ${presence.dot}`}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <h3 className="max-w-full break-words font-semibold">
                                  {staff.name}
                                </h3>

                                <span className="max-w-full break-all text-xs text-muted-foreground">
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

                              <div className="mt-3 min-w-0 space-y-2 text-sm text-muted-foreground">
                                <p className="break-words leading-5">
                                  <span className="font-medium text-foreground">
                                    Current Task:
                                  </span>{" "}
                                  {staff.current_task ?? "No active task"}
                                </p>

                                <div className="flex min-w-0 flex-col gap-1 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                                  <span className="flex items-center gap-1">
                                    <Activity className="h-3 w-3 shrink-0" />
                                    {relativeTime(staff.last_activity)}
                                  </span>

                                  <span className="break-words">
                                    Last sign-in: {formatDate(staff.last_login)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {staff.task_status && (
                            <div className="shrink-0 xl:pt-1">
                              <span
                                className={`inline-flex max-w-full rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                                  staff.task_status,
                                )}`}
                              >
                                {staff.task_status.replaceAll("_", " ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Attention + Workload */}
        <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Attention Required</CardTitle>
            </CardHeader>

            <CardContent>
              <MetricRow
                label="Overdue Orders"
                value={data.business.overdue_orders}
                warning={data.business.overdue_orders > 0}
              />

              <MetricRow label="Due Today" value={data.business.due_today} />

              <MetricRow
                label="Overdue Tasks"
                value={data.tasks.overdue}
                warning={data.tasks.overdue > 0}
              />
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Current Workload</CardTitle>
            </CardHeader>

            <CardContent>
              <MetricRow label="Active Production" value={activeProduction} />

              <MetricRow label="Active Tasks" value={activeTasks} />

              <MetricRow
                label="Completed Production"
                value={data.production.completed}
              />
            </CardContent>
          </Card>
        </section>

        {/* Order Pipeline */}
        <section className="min-w-0">
          <SectionHeading
            title="Order Pipeline"
            description="Current order distribution across the business workflow."
          />

          <div className="grid min-w-0 grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            <PipelineCard
              title="Received"
              value={data.orders.received}
              icon={ShoppingCart}
            />

            <PipelineCard
              title="Reviewing"
              value={data.orders.reviewing}
              icon={FileText}
            />

            <PipelineCard
              title="Ready for Production"
              value={data.orders.ready_for_production}
              icon={PackageCheck}
            />

            <PipelineCard
              title="In Production"
              value={data.orders.in_production}
              icon={Factory}
            />

            <PipelineCard
              title="Completed"
              value={data.orders.completed}
              icon={CheckCircle2}
              tone="success"
            />

            <PipelineCard
              title="Cancelled"
              value={data.orders.cancelled}
              icon={AlertTriangle}
            />

            <PipelineCard
              title="Overdue"
              value={data.orders.overdue}
              icon={Clock3}
              tone={data.orders.overdue > 0 ? "warning" : "default"}
            />

            <PipelineCard
              title="Due Today"
              value={data.orders.due_today}
              icon={Clock3}
            />
          </div>
        </section>

        {/* Production Pipeline */}
        <section className="min-w-0">
          <SectionHeading
            title="Production Pipeline"
            description="Production folders currently moving through the workflow."
          />

          <Card className="min-w-0 overflow-hidden">
            <CardContent className="grid min-w-0 grid-cols-1 gap-x-8 px-4 py-2 sm:px-5 md:grid-cols-2 lg:grid-cols-3">
              <MetricRow label="Created" value={data.production.created} />

              <MetricRow label="Waiting" value={data.production.waiting} />

              <MetricRow
                label="Ready for Design"
                value={data.production.ready_for_design}
              />

              <MetricRow label="In Design" value={data.production.in_design} />

              <MetricRow
                label="Design Review"
                value={data.production.design_review}
              />

              <MetricRow
                label="Approved for Print"
                value={data.production.approved_for_print}
              />

              <MetricRow label="Printing" value={data.production.printing} />

              <MetricRow label="Completed" value={data.production.completed} />

              <MetricRow label="Cancelled" value={data.production.cancelled} />
            </CardContent>
          </Card>
        </section>

        {/* Tasks + Financial */}
        <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Design Tasks</CardTitle>
            </CardHeader>

            <CardContent>
              <MetricRow label="Assigned" value={data.tasks.assigned} />

              <MetricRow label="In Progress" value={data.tasks.in_progress} />

              <MetricRow label="Submitted" value={data.tasks.submitted} />

              <MetricRow label="Revision" value={data.tasks.revision} />

              <MetricRow label="Approved" value={data.tasks.approved} />

              <MetricRow
                label="Overdue"
                value={data.tasks.overdue}
                warning={data.tasks.overdue > 0}
              />
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Financial Position</CardTitle>
            </CardHeader>

            <CardContent>
              <MetricRow
                label="Invoice Total"
                value={formatCurrency(data.financial.invoice_total)}
              />

              <MetricRow
                label="Payments"
                value={formatCurrency(data.financial.payments_total)}
              />

              <MetricRow
                label="Outstanding"
                value={formatCurrency(data.financial.outstanding_balance)}
                warning={Number(data.financial.outstanding_balance) > 0}
              />

              <MetricRow label="Unpaid" value={data.financial.unpaid} />

              <MetricRow
                label="Partially Paid"
                value={data.financial.partially_paid}
              />

              <MetricRow label="Paid" value={data.financial.paid} />

              <MetricRow label="Void" value={data.financial.void} />
            </CardContent>
          </Card>
        </section>

        {/* Production Snapshot */}
        <section className="min-w-0">
          <SectionHeading
            title="Production Snapshot"
            description="Live view of the current production stage."
          />

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
            <ProductionSnapshotCard
              label="In Design"
              value={data.production.in_design}
              icon={Palette}
            />

            <ProductionSnapshotCard
              label="Approved"
              value={data.production.approved_for_print}
              icon={FileCheck2}
            />

            <ProductionSnapshotCard
              label="Printing"
              value={data.production.printing}
              icon={Printer}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
