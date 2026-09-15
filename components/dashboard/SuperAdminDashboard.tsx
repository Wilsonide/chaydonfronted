"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
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
} from "lucide-react";
import type { ElementType } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { SuperAdminDashboard as SuperAdminDashboardData } from "@/app/types/dashboard";

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

function formatCurrency(value: number | string) {
  return `₦${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>

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
    <Card className="group border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>

            <p className="mt-2 truncate text-2xl font-bold tracking-tight tabular-nums">
              {value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>

          <div
            className={`shrink-0 rounded-xl p-2.5 transition-transform group-hover:scale-105 ${styles[tone]}`}
          >
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
  value: number | string;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span
        className={
          warning
            ? "text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums"
            : "text-sm font-semibold tabular-nums"
        }
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
    <div className="group rounded-xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted/20">
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-lg p-2 ${styles[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>

        <span className="text-2xl font-bold tabular-nums">{value}</span>
      </div>

      <p className="mt-4 text-sm font-medium">{title}</p>
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
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Business command center
        </p>

        <h1 className="mt-1 text-xl font-semibold tracking-tight">Overview</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor business activity, production and financial performance.
        </p>
      </div>

      {/* BUSINESS OVERVIEW */}
      <section>
        <SectionHeading
          title="Business overview"
          description="Key business metrics and financial activity."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Customers"
            value={data.business.customers}
            description={`${data.business.new_customers_today} new today`}
            icon={Users}
          />

          <StatCard
            title="Orders"
            value={data.business.orders}
            description={`${data.business.new_orders_today} received today`}
            icon={ShoppingCart}
          />

          <StatCard
            title="Revenue this month"
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
            description="Customer balances due"
            icon={CreditCard}
            tone={
              Number(data.business.outstanding_balance) > 0
                ? "warning"
                : "default"
            }
          />
        </div>
      </section>

      {/* ATTENTION + WORKLOAD */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card
          className={
            hasAttention
              ? "border-amber-200 shadow-sm dark:border-amber-900/50"
              : "border-emerald-200 shadow-sm dark:border-emerald-900/50"
          }
        >
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              {hasAttention ? (
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
              Attention
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <MetricRow
              label="Overdue orders"
              value={data.business.overdue_orders}
              warning={data.business.overdue_orders > 0}
            />

            <MetricRow
              label="Orders due today"
              value={data.business.due_today}
            />

            <MetricRow
              label="Overdue tasks"
              value={data.tasks.overdue}
              warning={data.tasks.overdue > 0}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Active workload
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <MetricRow
              label="Active production folders"
              value={activeProduction}
            />

            <MetricRow label="Active design tasks" value={activeTasks} />

            <MetricRow
              label="Completed production folders"
              value={data.production.completed}
            />
          </CardContent>
        </Card>
      </section>

      {/* ORDERS */}
      <section>
        <SectionHeading
          title="Order pipeline"
          description="Current distribution of orders across the business workflow."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            title="Ready for production"
            value={data.orders.ready_for_production}
            icon={PackageCheck}
          />

          <PipelineCard
            title="In production"
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
            title="Due today"
            value={data.orders.due_today}
            icon={Clock3}
          />
        </div>
      </section>

      {/* PRODUCTION */}
      <section>
        <SectionHeading
          title="Production pipeline"
          description="Where production folders currently sit in the workflow."
        />

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <div className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-3">
              <MetricRow label="Created" value={data.production.created} />

              <MetricRow
                label="Waiting for requirements"
                value={data.production.waiting}
              />

              <MetricRow
                label="Ready for design"
                value={data.production.ready_for_design}
              />

              <MetricRow label="In design" value={data.production.in_design} />

              <MetricRow
                label="Design review"
                value={data.production.design_review}
              />

              <MetricRow
                label="Approved for print"
                value={data.production.approved_for_print}
              />

              <MetricRow label="Printing" value={data.production.printing} />

              <MetricRow label="Completed" value={data.production.completed} />

              <MetricRow label="Cancelled" value={data.production.cancelled} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* TASKS + FINANCIAL */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Design task workload
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <MetricRow label="Assigned" value={data.tasks.assigned} />

            <MetricRow label="In progress" value={data.tasks.in_progress} />

            <MetricRow label="Submitted" value={data.tasks.submitted} />

            <MetricRow label="Revision required" value={data.tasks.revision} />

            <MetricRow label="Approved" value={data.tasks.approved} />

            <MetricRow
              label="Overdue"
              value={data.tasks.overdue}
              warning={data.tasks.overdue > 0}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Financial position
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <MetricRow
              label="Invoice total"
              value={formatCurrency(data.financial.invoice_total)}
            />

            <MetricRow
              label="Payments received"
              value={formatCurrency(data.financial.payments_total)}
            />

            <MetricRow
              label="Outstanding balance"
              value={formatCurrency(data.financial.outstanding_balance)}
              warning={Number(data.financial.outstanding_balance) > 0}
            />

            <MetricRow
              label="Unpaid invoices"
              value={data.financial.unpaid}
              warning={data.financial.unpaid > 0}
            />

            <MetricRow
              label="Partially paid"
              value={data.financial.partially_paid}
            />

            <MetricRow label="Paid invoices" value={data.financial.paid} />

            <MetricRow label="Void invoices" value={data.financial.void} />
          </CardContent>
        </Card>
      </section>

      {/* QUICK PRODUCTION SIGNAL */}
      <section>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
            <div className="rounded-lg bg-muted p-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Designing</p>

              <p className="mt-1 text-xl font-bold tabular-nums">
                {data.production.in_design}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
            <div className="rounded-lg bg-muted p-2">
              <FileCheck2 className="h-4 w-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Approved for print
              </p>

              <p className="mt-1 text-xl font-bold tabular-nums">
                {data.production.approved_for_print}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
            <div className="rounded-lg bg-muted p-2">
              <Printer className="h-4 w-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Printing</p>

              <p className="mt-1 text-xl font-bold tabular-nums">
                {data.production.printing}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
