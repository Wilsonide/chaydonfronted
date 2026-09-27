export interface DailyAnalytics {
  day: number;
  date: string;
  orders: number;
  revenue: string;
  material_cost: string;
  profit: string;
  inventory_units_used: number;
  inventory_value_used: string;
}

export interface MonthlyAnalytics {
  month: number;
  month_name: string;
  orders: number;
  revenue: string;
  material_cost: string;
  profit: string;
  inventory_units_used: number;
  inventory_value_used: string;
  daily: DailyAnalytics[];
}

export interface AnalyticsSummary {
  year: number;
  total_orders: number;
  total_revenue: string;
  total_material_cost: string;
  total_profit: string;
  total_inventory_units_used: number;
  total_inventory_value_used: string;
  monthly: MonthlyAnalytics[];
}
