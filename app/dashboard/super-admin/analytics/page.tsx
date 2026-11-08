
"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Loader2,
  TrendingUp,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  AnalyticsSummary,
  DailyAnalytics,
  MonthlyAnalytics,
} from "@/app/types/analytics";

import analyticsService from "@/app/services/analyticsService";

// ============================================================
// FORMATTERS
// ============================================================

function toNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatChartCurrency(value: number | string): string {
  const amount = toNumber(value);

  if (Math.abs(amount) >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}m`;
  }

  if (Math.abs(amount) >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}k`;
  }

  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatTooltipCurrency(value: number | string): string {
  return formatCurrency(value);
}

function formatDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatShortDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
  }).format(date);
}

// ============================================================
// COMPONENT
// ============================================================

export default function AnalyticsPage() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState<number[]>([]);

  // ============================================================
  // LOAD ANALYTICS
  // ============================================================

  useEffect(() => {
    let isActive = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        const data = await analyticsService.getYearlyAnalytics(year);

        if (!isActive) {
          return;
        }

        setAnalytics(data);
        setExpandedMonths([]);
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("Failed to load analytics:", error);

        toast.error("Failed to load analytics");

        setAnalytics(null);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      isActive = false;
    };
  }, [year]);

  // ============================================================
  // YEAR OPTIONS
  // ============================================================

  const yearOptions = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => currentYear - index);
  }, [currentYear]);

  // ============================================================
  // MONTHLY CHART DATA
  // ============================================================

  const chartData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return analytics.monthly.map((month: MonthlyAnalytics) => ({
      month: month.month_name.slice(0, 3),
      orders: month.orders,
      order_value: toNumber(month.order_value),
      outstanding_balance: toNumber(month.outstanding_balance),
    }));
  }, [analytics]);

  // ============================================================
  // MONTH TOGGLE
  // ============================================================

  const toggleMonth = (monthNumber: number) => {
    setExpandedMonths((current) => {
      if (current.includes(monthNumber)) {
        return current.filter((month) => month !== monthNumber);
      }

      return [...current, monthNumber];
    });
  };

  const expandAllMonths = () => {
    if (!analytics) {
      return;
    }

    setExpandedMonths(analytics.monthly.map((month) => month.month));
  };

  const collapseAllMonths = () => {
    setExpandedMonths([]);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6 p-6">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />

            <h1 className="text-2xl font-bold tracking-tight">
              Analytics
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor print order revenue, order volume, and outstanding balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />

          <Select
            value={String(year)}
            onValueChange={(value) => setYear(Number(value))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>

            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      )}

      {/* ========================================================
          EMPTY STATE
      ======================================================== */}

      {!loading && !analytics && (
        <Card>
          <CardContent className="flex min-h-[250px] flex-col items-center justify-center gap-3">
            <BarChart3 className="h-10 w-10 text-muted-foreground" />

            <p className="text-sm text-muted-foreground">
              No analytics data available.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ========================================================
          ANALYTICS
      ======================================================== */}

      {!loading && analytics && (
        <>
          {/* ====================================================
              SUMMARY CARDS
          ==================================================== */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* Total Orders */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>

                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analytics.total_orders)}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Non-cancelled orders in {analytics.year}
                </p>
              </CardContent>
            </Card>

            {/* Total Revenue */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>

                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.total_revenue_received)}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Total value of print orders in {analytics.year}
                </p>
              </CardContent>
            </Card>

            {/* Outstanding Balance */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding Balance
                </CardTitle>

                <Clock3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.total_outstanding_balance)}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Remaining invoice balances
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ====================================================
              REVENUE OVERVIEW
          ==================================================== */}

          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>

              <CardDescription>
                Total revenue is calculated from the value of valid print orders,
                regardless of payment status.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(analytics.total_revenue_received)}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Total order revenue for {analytics.year}
                  </p>
                </div>

                <div className="text-sm text-muted-foreground sm:text-right">
                  <p>
                    Orders:{" "}
                    <span className="font-medium text-foreground">
                      {formatNumber(analytics.total_orders)}
                    </span>
                  </p>

                  <p>
                    Outstanding:{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(analytics.total_outstanding_balance)}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ====================================================
              CHARTS
          ==================================================== */}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Revenue */}

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>

                <CardDescription>
                  Total value of print orders recorded each month in {analytics.year}.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />

                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatChartCurrency}
                      />

                      <Tooltip
                        formatter={(value) =>
                          formatTooltipCurrency(value as string | number)
                        }
                      />

                      <Line
                        type="monotone"
                        dataKey="order_value"
                        name="Revenue"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Order Volume */}

            <Card>
              <CardHeader>
                <CardTitle>Monthly Order Volume</CardTitle>

                <CardDescription>
                  Number of print orders recorded each month.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />

                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />

                      <Tooltip
                        formatter={(value) => formatNumber(toNumber(value as number | string))}
                      />

                      <Bar
                        dataKey="orders"
                        name="Orders"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Outstanding Balance */}

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Outstanding Balance</CardTitle>

                <CardDescription>
                  Remaining invoice balances associated with orders created each month.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 10,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />

                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatChartCurrency}
                      />

                      <Tooltip
                        formatter={(value) =>
                          formatTooltipCurrency(value as string | number)
                        }
                      />

                      <Line
                        type="monotone"
                        dataKey="outstanding_balance"
                        name="Outstanding Balance"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ====================================================
              MONTHLY AND DAILY BREAKDOWN
          ==================================================== */}

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>
                    Monthly Performance — {analytics.year}
                  </CardTitle>

                  <CardDescription className="mt-1">
                    Expand a month to see its daily order activity and revenue.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={expandAllMonths}
                    className="rounded-md border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    Expand all
                  </button>

                  <button
                    type="button"
                    onClick={collapseAllMonths}
                    className="rounded-md border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    Collapse all
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="w-10 px-2 py-3" />

                      <th className="px-4 py-3 font-medium">
                        Month
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Orders
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Revenue
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Outstanding
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {analytics.monthly.map((month: MonthlyAnalytics) => {
                      const isExpanded = expandedMonths.includes(month.month);

                      return (
                        <Fragment key={month.month}>
                          {/* MONTH ROW */}

                          <tr className="border-b bg-background transition-colors hover:bg-muted/40">
                            <td className="px-2 py-3">
                              <button
                                type="button"
                                onClick={() => toggleMonth(month.month)}
                                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                                aria-label={
                                  isExpanded
                                    ? `Collapse ${month.month_name}`
                                    : `Expand ${month.month_name}`
                                }
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            </td>

                            <td className="px-4 py-3 font-semibold">
                              {month.month_name}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {formatNumber(month.orders)}
                            </td>

                            <td className="px-4 py-3 text-right font-medium">
                              {formatCurrency(month.revenue_received)}
                            </td>

                            <td className="px-4 py-3 text-right font-medium">
                              {formatCurrency(month.outstanding_balance)}
                            </td>
                          </tr>

                          {/* DAILY BREAKDOWN */}

                          {isExpanded && (
                            <tr className="border-b bg-muted/20">
                              <td colSpan={5} className="p-0">
                                <div className="border-l-2 border-primary/20">
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px] text-sm">
                                      <thead>
                                        <tr className="border-b bg-muted/30 text-left">
                                          <th className="px-4 py-3 pl-14 font-medium">
                                            Date
                                          </th>

                                          <th className="px-4 py-3 text-right font-medium">
                                            Orders
                                          </th>

                                          <th className="px-4 py-3 text-right font-medium">
                                            Revenue
                                          </th>

                                          <th className="px-4 py-3 text-right font-medium">
                                            Outstanding
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {month.daily.map(
                                          (day: DailyAnalytics) => {
                                            const hasActivity =
                                              day.orders > 0 ||
                                              toNumber(day.order_value) > 0 ||
                                              toNumber(day.outstanding_balance) > 0;

                                            return (
                                              <tr
                                                key={day.date}
                                                className={`border-b last:border-0 ${
                                                  hasActivity
                                                    ? "bg-background"
                                                    : "text-muted-foreground"
                                                }`}
                                              >
                                                <td className="px-4 py-3 pl-14">
                                                  <div className="flex flex-col">
                                                    <span
                                                      className={
                                                        hasActivity
                                                          ? "font-medium"
                                                          : ""
                                                      }
                                                    >
                                                      {formatShortDate(day.date)}
                                                    </span>

                                                    <span className="text-xs text-muted-foreground">
                                                      {formatDate(day.date).split(",")[0]}
                                                    </span>
                                                  </div>
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                  {formatNumber(day.orders)}
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                  {formatCurrency(day.revenue_received)}
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                  {formatCurrency(day.outstanding_balance)}
                                                </td>
                                              </tr>
                                            );
                                          },
                                        )}
                                      </tbody>

                                      {/* MONTH TOTAL */}

                                      <tfoot>
                                        <tr className="bg-muted/40 font-semibold">
                                          <td className="px-4 py-3 pl-14">
                                            {month.month_name} Total
                                          </td>

                                          <td className="px-4 py-3 text-right">
                                            {formatNumber(month.orders)}
                                          </td>

                                          <td className="px-4 py-3 text-right">
                                            {formatCurrency(month.revenue_received)}
                                          </td>

                                          <td className="px-4 py-3 text-right">
                                            {formatCurrency(month.outstanding_balance)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>

                  {/* YEAR TOTAL */}

                  <tfoot>
                    <tr className="border-t bg-muted/40 font-semibold">
                      <td className="px-2 py-3" />

                      <td className="px-4 py-3">
                        Year Total
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatNumber(analytics.total_orders)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(analytics.total_revenue_received)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(analytics.total_outstanding_balance)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
