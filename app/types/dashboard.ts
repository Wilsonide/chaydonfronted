export type SuperAdminDashboard = {
  role: "SUPER_ADMIN";

  business: {
    customers: number;
    orders: number;
    revenue_this_month: number | string;
    outstanding_balance: number | string;

    new_orders_today: number;
    payments_today: number | string;
    new_customers_today: number;

    overdue_orders: number;
    due_today: number;
  };

  orders: {
    received: number;
    reviewing: number;
    ready_for_production: number;
    in_production: number;
    completed: number;
    cancelled: number;

    overdue: number;
    due_today: number;
  };

  production: {
    created: number;
    waiting: number;
    ready_for_design: number;
    in_design: number;
    design_review: number;
    approved_for_print: number;
    printing: number;
    completed: number;
    cancelled: number;
  };

  tasks: {
    assigned: number;
    in_progress: number;
    submitted: number;
    revision: number;
    approved: number;
    overdue: number;
  };

  financial: {
    invoice_total: number | string;
    payments_total: number | string;
    outstanding_balance: number | string;

    unpaid: number;
    partially_paid: number;
    paid: number;
    void: number;
  };
};

export type FrontDeskDashboard = {
  role: "FRONT_DESK";

  today_orders: number;
  today_payments: number | string;
  outstanding_balance: number | string;
  new_customers: number;

  received_orders: number;
  reviewing_orders: number;
  ready_for_production: number;
  in_production: number;

  overdue_orders: number;
  due_today: number;

  unpaid_invoices: number;
  partially_paid_invoices: number;
  paid_invoices: number;
};

export type GraphicLeadDashboard = {
  role: "GRAPHIC_LEAD";

  design_queue: number;
  pending_reviews: number;
  overdue_tasks: number;

  assigned_tasks: number;
  in_progress_tasks: number;
  submitted_tasks: number;
  revision_required_tasks: number;
  approved_tasks: number;

  created: number;
  waiting_for_requirements: number;
  ready_for_design: number;
  in_design: number;
  design_review: number;
  approved_for_print: number;
  printing: number;
  completed: number;
};

export type GraphicDesignerDashboard = {
  role: "GRAPHIC_DESIGNER";

  assigned: number;
  in_progress: number;
  submitted: number;
  revision_required: number;
  approved: number;
  overdue: number;
};

export type DashboardResponse =
  | SuperAdminDashboard
  | FrontDeskDashboard
  | GraphicLeadDashboard
  | GraphicDesignerDashboard;
