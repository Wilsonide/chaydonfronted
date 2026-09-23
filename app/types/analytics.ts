export interface MonthlyAnalytics {
  month: number;
  month_name: string;
  orders: number;
  revenue: string;
  material_cost: string;
  designer_cost: string;
  profit: string;
  inventory_units_used: number;
  inventory_value_used: string;
}

export interface DesignerAnalytics {
  designer_id: string;
  designer_name: string;
  completed_tasks: number;
  total_charge: string;
}

export interface AnalyticsSummary {
  year: number;
  total_orders: number;
  total_revenue: string;
  total_material_cost: string;
  total_designer_cost: string;
  total_profit: string;
  total_inventory_units_used: number;
  total_inventory_value_used: string;
  monthly: MonthlyAnalytics[];
  designers: DesignerAnalytics[];
}
