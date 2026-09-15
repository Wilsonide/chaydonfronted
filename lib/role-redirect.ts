export type UserRole =
  | "SUPER_ADMIN"
  | "FRONT_DESK"
  | "GRAPHIC_LEAD"
  | "GRAPHIC_DESIGNER";

export function getDashboardRoute(role: UserRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return "/dashboard/super-admin";

    case "FRONT_DESK":
      return "/dashboard/front-desk";

    case "GRAPHIC_LEAD":
      return "/dashboard/graphic-lead";

    case "GRAPHIC_DESIGNER":
      return "/dashboard/designer";

    default:
      return "/dashboard";
  }
}
