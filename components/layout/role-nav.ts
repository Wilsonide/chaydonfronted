import {
  LayoutDashboard,
  Users,
  UserPlus,
  ShoppingCart,
  FolderKanban,
  ClipboardList,
  Package,
  Receipt,
  CreditCard,
  LucideIcon,
} from "lucide-react";

export type UserRole =
  | "SUPER_ADMIN"
  | "FRONT_DESK"
  | "GRAPHIC_LEAD"
  | "GRAPHIC_DESIGNER";

export const roleNavigation: Record<
  UserRole,
  {
    label: string;
    href: string;
    icon: LucideIcon;
  }[]
> = {
  SUPER_ADMIN: [
    {
      label: "Dashboard",
      href: "/dashboard/super-admin",
      icon: LayoutDashboard,
    },
    {
      label: "Customers",
      href: "/dashboard/super-admin/customers",
      icon: Users,
    },
    {
      label: "Orders",
      href: "/dashboard/super-admin/orders",
      icon: ShoppingCart,
    },
    {
      label: "Production",
      href: "/dashboard/super-admin/production",
      icon: FolderKanban,
    },
    {
      label: "Tasks",
      href: "/dashboard/super-admin/tasks",
      icon: ClipboardList,
    },
    {
      label: "Inventory",
      href: "/dashboard/super-admin/inventory",
      icon: Package,
    },
    {
      label: "Invoices",
      href: "/dashboard/super-admin/invoices",
      icon: Receipt,
    },
    {
      label: "Payments",
      href: "/dashboard/super-admin/payments",
      icon: CreditCard,
    },
    {
      label: "Register Staff",
      href: "/dashboard/super-admin/register",
      icon: UserPlus,
    },
    {
      label: "Manage Staffs",
      href: "/dashboard/super-admin/staff-credentials",
      icon: UserPlus,
    },
  ],

  FRONT_DESK: [
    {
      label: "Dashboard",
      href: "/dashboard/front-desk",
      icon: LayoutDashboard,
    },
    {
      label: "Customers",
      href: "/dashboard/front-desk/customers",
      icon: Users,
    },
    {
      label: "Orders",
      href: "/dashboard/front-desk/orders",
      icon: ShoppingCart,
    },
    {
      label: "Inventory",
      href: "/dashboard/front-desk/inventory",
      icon: Package,
    },
    {
      label: "Payments",
      href: "/dashboard/front-desk/payments",
      icon: CreditCard,
    },
    {
      label: "Invoices",
      href: "/dashboard/front-desk/invoices",
      icon: Receipt,
    },
  ],

  GRAPHIC_LEAD: [
    {
      label: "Dashboard",
      href: "/dashboard/graphic-lead",
      icon: LayoutDashboard,
    },

    {
      label: "Manage Tasks",
      href: "/dashboard/graphic-lead/tasks",
      icon: ClipboardList,
    },
  ],

  GRAPHIC_DESIGNER: [
    {
      label: "Dashboard",
      href: "/dashboard/designer",
      icon: LayoutDashboard,
    },
    {
      label: "Tasks",
      href: "/dashboard/designer/tasks",
      icon: ClipboardList,
    },
  ],
};
