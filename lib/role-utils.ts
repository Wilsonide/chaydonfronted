import { UserRole } from "@/app/types/auth";

export const isSuperAdmin = (role?: UserRole) => role === "SUPER_ADMIN";

export const isFrontDesk = (role?: UserRole) => role === "FRONT_DESK";

export const isGraphicLead = (role?: UserRole) => role === "GRAPHIC_LEAD";

export const isDesigner = (role?: UserRole) => role === "GRAPHIC_DESIGNER";

export const isDesignTeam = (role?: UserRole) =>
  role === "GRAPHIC_LEAD" || role === "GRAPHIC_DESIGNER";

export const canManageProduction = (role?: UserRole) =>
  role === "SUPER_ADMIN" || role === "GRAPHIC_LEAD";

export const canManageOrders = (role?: UserRole) =>
  role === "SUPER_ADMIN" || role === "FRONT_DESK";
