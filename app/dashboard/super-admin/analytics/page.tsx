"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Loader2,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

import { AnalyticsSummary } from "@/app/types/analytics";
import analyticsService from "@/app/services/analyticsService";

function formatCurrency(value: string | number) {
  const amount =
    typeof value === "number" ? value : Number.parseFloat(value || "0");

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatChartCurrency(value: string | number) {
  const amount =
    typeof value === "number" ? value : Number.parseFloat(value || "0");

  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}m`;
  }

  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}k`;
  }

  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatTooltipCurrency(value: string | number) {
  const amount =
    typeof value === "number" ? value : Number.parseFloat(value || "0");

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatShortDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default function AnalyticsPage() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [expandedMonths, setExpandedMonths] = useState<number[]>([]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const data = await analyticsService.getYearlyAnalytics(year);

      setAnalytics(data);

      // Keep the monthly table collapsed after every year change.
      setExpandedMonths([]);
    } catch (error) {
      console.error("Failed to load analytics:", error);

      toast.error("Failed to load analytics");

      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => loadAnalytics());
  }, [year]);

  // ============================================================
  // PROFIT MARGIN
  // ============================================================

  const profitMargin = useMemo(() => {
    if (!analytics) {
      return 0;
    }

    const revenue = Number(analytics.total_revenue || 0);

    const profit = Number(analytics.total_profit || 0);

    if (revenue <= 0) {
      return 0;
    }

    return (profit / revenue) * 100;
  }, [analytics]);

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

    return analytics.monthly.map((month) => ({
      month: month.month_name.slice(0, 3),
      orders: month.orders,
      revenue: Number(month.revenue || 0),
      material_cost: Number(month.material_cost || 0),
      profit: Number(month.profit || 0),
      inventory_units_used: month.inventory_units_used,
      inventory_value_used: Number(month.inventory_value_used || 0),
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

            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor revenue, material costs, profit, and inventory consumption.
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
          EMPTY
      ======================================================== */}

      {!loading && !analytics && (
        <Card>
          <CardContent className="flex min-h-[250px] items-center justify-center">
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {/* Completed Orders */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Orders
                </CardTitle>

                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analytics.total_orders)}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Completed in {analytics.year}
                </p>
              </CardContent>
            </Card>

            {/* Revenue */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>

                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.total_revenue)}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Completed-order revenue
                </p>
              </CardContent>
            </Card>

            {/* Material Cost */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Material Cost
                </CardTitle>

                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.total_material_cost)}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Materials consumed
                </p>
              </CardContent>
            </Card>

            {/* Profit */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Profit</CardTitle>

                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.total_profit)}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Revenue − material cost
                </p>
              </CardContent>
            </Card>

            {/* Profit Margin */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Profit Margin
                </CardTitle>

                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {profitMargin.toFixed(1)}%
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Profit as a percentage of revenue
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ====================================================
              INVENTORY SUMMARY
          ==================================================== */}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Inventory Units */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Inventory Used</CardTitle>

                  <CardDescription className="mt-1">
                    Total units consumed for completed orders.
                  </CardDescription>
                </div>

                <Package className="h-5 w-5 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-bold">
                  {formatNumber(analytics.total_inventory_units_used)}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  units consumed
                </p>
              </CardContent>
            </Card>

            {/* Inventory Value */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Inventory Value Used</CardTitle>

                  <CardDescription className="mt-1">
                    Recorded value of consumed materials.
                  </CardDescription>
                </div>

                <Boxes className="h-5 w-5 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(analytics.total_inventory_value_used)}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  material value consumed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ====================================================
              CHARTS
          ==================================================== */}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Revenue */}

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>

                <CardDescription>
                  Revenue generated from completed orders in {analytics.year}.
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

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="revenue"
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

            {/* Monthly Profit */}

            <Card>
              <CardHeader>
                <CardTitle>Monthly Profit</CardTitle>

                <CardDescription>
                  Revenue minus material costs for completed orders.
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

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="profit"
                        name="Profit"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Completed Orders */}

            <Card>
              <CardHeader>
                <CardTitle>Completed Orders</CardTitle>

                <CardDescription>
                  Number of orders completed each month.
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
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip />

                      <Legend />

                      <Bar
                        dataKey="orders"
                        name="Completed Orders"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue vs Material Cost */}

            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Material Cost</CardTitle>

                <CardDescription>
                  Monthly revenue compared with material costs.
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
                        tickFormatter={formatChartCurrency}
                      />

                      <Tooltip
                        formatter={(value) =>
                          formatTooltipCurrency(value as string | number)
                        }
                      />

                      <Legend />

                      <Bar
                        dataKey="revenue"
                        name="Revenue"
                        radius={[4, 4, 0, 0]}
                      />

                      <Bar
                        dataKey="material_cost"
                        name="Material Cost"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ====================================================
              MONTHLY + DAILY DRILL DOWN
          ==================================================== */}

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Monthly Performance — {analytics.year}</CardTitle>

                  <CardDescription className="mt-1">
                    Click a month to drill down into its daily performance.
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
                <table className="w-full min-w-[950px] text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="w-10 px-2 py-3" />

                      <th className="px-4 py-3 font-medium">Month</th>

                      <th className="px-4 py-3 text-right font-medium">
                        Orders
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Revenue
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Material Cost
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Profit
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Units Used
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Inventory Value
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {analytics.monthly.map((month) => {
                      const isExpanded = expandedMonths.includes(month.month);

                      return (
                        <>
                          {/* ==================================================
                                MONTH ROW
                            ================================================== */}

                          <tr
                            key={`month-${month.month}`}
                            className="border-b bg-background transition-colors hover:bg-muted/40"
                          >
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

                            <td className="px-4 py-3 text-right">
                              {formatCurrency(month.revenue)}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {formatCurrency(month.material_cost)}
                            </td>

                            <td className="px-4 py-3 text-right font-semibold">
                              {formatCurrency(month.profit)}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {formatNumber(month.inventory_units_used)}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {formatCurrency(month.inventory_value_used)}
                            </td>
                          </tr>

                          {/* ==================================================
                                DAILY BREAKDOWN
                            ================================================== */}

                          {isExpanded && (
                            <tr
                              key={`daily-${month.month}`}
                              className="border-b bg-muted/20"
                            >
                              <td colSpan={8} className="p-0">
                                <div className="border-l-2 border-primary/20">
                                  <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px] text-sm">
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
                                            Material Cost
                                          </th>

                                          <th className="px-4 py-3 text-right font-medium">
                                            Profit
                                          </th>

                                          <th className="px-4 py-3 text-right font-medium">
                                            Units Used
                                          </th>

                                          <th className="px-4 py-3 text-right font-medium">
                                            Inventory Value
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {month.daily.map((day) => {
                                          const hasActivity =
                                            day.orders > 0 ||
                                            Number(day.revenue) > 0 ||
                                            Number(day.material_cost) > 0 ||
                                            day.inventory_units_used > 0;

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
                                                    {
                                                      formatDate(
                                                        day.date,
                                                      ).split(",")[0]
                                                    }
                                                  </span>
                                                </div>
                                              </td>

                                              <td className="px-4 py-3 text-right">
                                                {formatNumber(day.orders)}
                                              </td>

                                              <td className="px-4 py-3 text-right">
                                                {formatCurrency(day.revenue)}
                                              </td>

                                              <td className="px-4 py-3 text-right">
                                                {formatCurrency(
                                                  day.material_cost,
                                                )}
                                              </td>

                                              <td className="px-4 py-3 text-right font-medium">
                                                {formatCurrency(day.profit)}
                                              </td>

                                              <td className="px-4 py-3 text-right">
                                                {formatNumber(
                                                  day.inventory_units_used,
                                                )}
                                              </td>

                                              <td className="px-4 py-3 text-right">
                                                {formatCurrency(
                                                  day.inventory_value_used,
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>

                                      {/* Daily total should equal
                                            the monthly figures */}

                                      <tfoot>
                                        <tr className="bg-muted/40 font-semibold">
                                          <td className="px-4 py-3 pl-14">
                                            {month.month_name} Total
                                          </td>

                                          <td className="px-4 py-3 text-right">
                                            {formatNumber(month.orders)}
                                          </td>

                                          <td className="px-4 py-3 text-right">
                                            {formatCurrency(month.revenue)}
                                          </td>

                                          <td className="px-4 py-3 text-right">
                                            {formatCurrency(
                                              month.material_cost,
                                            )}
                                          </td>

                                          <td className="px-4 py-3 text-right">
                                            {formatCurrency(month.profit)}
                                          </td>

                                          <td className="px-4 py-3 text-right">
                                            {formatNumber(
                                              month.inventory_units_used,
                                            )}
                                          </td>

                                          <td className="px-4 py-3 text-right">
                                            {formatCurrency(
                                              month.inventory_value_used,
                                            )}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>

                  {/* ==================================================
                      YEAR TOTAL
                  ================================================== */}

                  <tfoot>
                    <tr className="border-t bg-muted/40 font-semibold">
                      <td className="px-2 py-3" />

                      <td className="px-4 py-3">Total</td>

                      <td className="px-4 py-3 text-right">
                        {formatNumber(analytics.total_orders)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(analytics.total_revenue)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(analytics.total_material_cost)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(analytics.total_profit)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatNumber(analytics.total_inventory_units_used)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(analytics.total_inventory_value_used)}
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
