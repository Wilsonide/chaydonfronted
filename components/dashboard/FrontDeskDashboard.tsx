"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  ShoppingCart,
  Users,
} from "lucide-react";
import type { ElementType } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { FrontDeskDashboard as FrontDeskDashboardData } from "@/app/types/dashboard";

interface FrontDeskDashboardProps {
  data: FrontDeskDashboardData;
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
  const iconClasses = {
    default: "bg-muted text-muted-foreground",
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    success:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  };

  return (
    <Card className="group overflow-hidden border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>

            <p className="mt-2 truncate text-2xl font-bold tracking-tight">
              {value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>

          <div
            className={`shrink-0 rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105 ${iconClasses[tone]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 py-3 last:border-0">
      <span
        className={
          emphasis ? "text-sm font-medium" : "text-sm text-muted-foreground"
        }
      >
        {label}
      </span>

      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "warning" | "success";
}) {
  const styles = {
    neutral: "border-border/60 bg-muted/40",
    warning:
      "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20",
    success:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[tone]}`}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>

      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}

export default function FrontDeskDashboard({ data }: FrontDeskDashboardProps) {
  const hasAttention = data.overdue_orders > 0 || data.due_today > 0;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Front Desk</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor today&apos;s orders, customers and payments.
        </p>
      </div>

      {/* TODAY */}
      <section>
        <SectionHeading
          title="Today at a glance"
          description="A quick view of activity happening today."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Today's orders"
            value={data.today_orders}
            description="Orders received today"
            icon={ShoppingCart}
          />

          <StatCard
            title="Today's payments"
            value={formatCurrency(data.today_payments)}
            description="Payments recorded today"
            icon={CreditCard}
            tone="success"
          />

          <StatCard
            title="Outstanding balance"
            value={formatCurrency(data.outstanding_balance)}
            description="Customer balances due"
            icon={FileText}
            tone={Number(data.outstanding_balance) > 0 ? "warning" : "default"}
          />

          <StatCard
            title="New customers"
            value={data.new_customers}
            description="Customers added today"
            icon={Users}
          />
        </div>
      </section>

      {/* ATTENTION */}
      <section>
        <Card
          className={
            hasAttention
              ? "border-amber-200 bg-amber-50/40 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/10"
              : "border-emerald-200 bg-emerald-50/40 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/10"
          }
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div
                className={
                  hasAttention
                    ? "rounded-xl bg-amber-100 p-2.5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    : "rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                }
              >
                {hasAttention ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0">
                <p className="font-semibold">
                  {hasAttention
                    ? "Orders need attention"
                    : "Everything is on schedule"}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {hasAttention
                    ? `${data.overdue_orders} overdue ${
                        data.overdue_orders === 1 ? "order" : "orders"
                      } and ${data.due_today} ${
                        data.due_today === 1 ? "order" : "orders"
                      } due today.`
                    : "There are currently no overdue or due-today orders requiring attention."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ORDER PIPELINE */}
      <section>
        <SectionHeading
          title="Order pipeline"
          description="Current order distribution across the workflow."
        />

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-0">
            <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="p-5">
                <PipelineRow
                  label="Received"
                  value={data.received_orders}
                  emphasis
                />

                <PipelineRow label="Reviewing" value={data.reviewing_orders} />
              </div>

              <div className="p-5">
                <PipelineRow
                  label="Ready for production"
                  value={data.ready_for_production}
                  emphasis
                />

                <PipelineRow label="In production" value={data.in_production} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* DUE DATE + INVOICES */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              Due-date watch
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-3 p-5">
            <StatusPill
              label="Due today"
              value={data.due_today}
              tone="neutral"
            />

            <StatusPill
              label="Overdue"
              value={data.overdue_orders}
              tone={data.overdue_orders > 0 ? "warning" : "neutral"}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Invoice status
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-3 gap-3 p-5">
            <StatusPill
              label="Unpaid"
              value={data.unpaid_invoices}
              tone={data.unpaid_invoices > 0 ? "warning" : "neutral"}
            />

            <StatusPill
              label="Partial"
              value={data.partially_paid_invoices}
              tone="neutral"
            />

            <StatusPill
              label="Paid"
              value={data.paid_invoices}
              tone="success"
            />
          </CardContent>
        </Card>
      </section>

      {/* WORKFLOW FOOTER */}
      <div className="flex items-center justify-between border-t border-border/60 pt-5 text-xs text-muted-foreground">
        <span>Front desk operations</span>

        <span className="flex items-center gap-1">
          Orders
          <ArrowRight className="h-3.5 w-3.5" />
          Production
        </span>
      </div>
    </div>
  );
}
