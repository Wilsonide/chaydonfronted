"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BarChart3,
  Boxes,
  CalendarDays,
  ClipboardList,
  Loader2,
  Package,
  Users,
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

export default function AnalyticsPage() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const data = await analyticsService.getYearlyAnalytics(year);

      setAnalytics(data);
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
  // CHART DATA
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

      designer_cost: Number(month.designer_cost || 0),

      profit: Number(month.profit || 0),

      inventory_units_used: month.inventory_units_used,

      inventory_value_used: Number(month.inventory_value_used || 0),
    }));
  }, [analytics]);

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
            Monitor revenue, material costs, designer costs, profit, and
            inventory consumption.
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
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

            {/* Designer Cost */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Designer Cost
                </CardTitle>

                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.total_designer_cost)}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Charges for completed designs
                </p>
              </CardContent>
            </Card>

            {/* Gross Profit */}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Gross Profit
                </CardTitle>

                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.total_profit)}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Revenue − material − designer cost
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
                  Gross profit margin
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

                  <p className="mt-1 text-sm text-muted-foreground">
                    Total units consumed for completed orders.
                  </p>
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

                  <p className="mt-1 text-sm text-muted-foreground">
                    Recorded value of consumed materials.
                  </p>
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

            {/* Monthly Gross Profit */}

            <Card>
              <CardHeader>
                <CardTitle>Monthly Gross Profit</CardTitle>

                <CardDescription>
                  Revenue minus material and designer costs for completed
                  orders.
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
                        name="Gross Profit"
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

            {/* Revenue vs Costs */}

            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Costs</CardTitle>

                <CardDescription>
                  Monthly revenue compared with material and designer costs.
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

                      <Bar
                        dataKey="designer_cost"
                        name="Designer Cost"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ====================================================
              DESIGNER EARNINGS
          ==================================================== */}

          <Card>
            <CardHeader>
              <CardTitle>Designer Earnings — {analytics.year}</CardTitle>

              <CardDescription>
                Charges recorded for approved design tasks belonging to
                completed design orders.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {analytics.designers.length === 0 ? (
                <div className="flex min-h-[120px] items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No designer charges recorded for {analytics.year}.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="px-4 py-3 font-medium">Designer</th>

                        <th className="px-4 py-3 text-right font-medium">
                          Completed Tasks
                        </th>

                        <th className="px-4 py-3 text-right font-medium">
                          Total Charge
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {analytics.designers.map((designer) => (
                        <tr
                          key={designer.designer_id}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-3 font-medium">
                            {designer.designer_name}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatNumber(designer.completed_tasks)}
                          </td>

                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(designer.total_charge)}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="border-t bg-muted/40 font-semibold">
                        <td className="px-4 py-3">Total</td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(
                            analytics.designers.reduce(
                              (total, designer) =>
                                total + designer.completed_tasks,
                              0,
                            ),
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatCurrency(analytics.total_designer_cost)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ====================================================
              MONTHLY BREAKDOWN
          ==================================================== */}

          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance — {analytics.year}</CardTitle>

              <CardDescription>
                Revenue, material cost, designer cost, and gross profit by
                completion month.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm">
                  <thead>
                    <tr className="border-b text-left">
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
                        Designer Cost
                      </th>

                      <th className="px-4 py-3 text-right font-medium">
                        Gross Profit
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
                    {analytics.monthly.map((month) => (
                      <tr key={month.month} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">
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

                        <td className="px-4 py-3 text-right">
                          {formatCurrency(month.designer_cost)}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(month.profit)}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatNumber(month.inventory_units_used)}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatCurrency(month.inventory_value_used)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr className="border-t bg-muted/40 font-semibold">
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
                        {formatCurrency(analytics.total_designer_cost)}
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
