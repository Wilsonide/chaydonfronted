export type AnalyticsValue = string | number;

export interface DailyAnalytics {
  date: string;
  orders: number;
  order_value: AnalyticsValue;
  revenue_received: AnalyticsValue;
  outstanding_balance: AnalyticsValue;
}

export interface MonthlyAnalytics {
  month: number;
  month_name: string;
  orders: number;
  order_value: AnalyticsValue;
  revenue_received: AnalyticsValue;
  outstanding_balance: AnalyticsValue;
  daily: DailyAnalytics[];
}

export interface AnalyticsSummary {
  year: number;
  total_orders: number;
  total_order_value: AnalyticsValue;
  total_revenue_received: AnalyticsValue;
  total_outstanding_balance: AnalyticsValue;
  monthly: MonthlyAnalytics[];
}