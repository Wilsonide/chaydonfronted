export type UserRole = "FRONT_DESK" | "GRAPHIC_LEAD" | "GRAPHIC_DESIGNER";

export interface StaffCredential {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  password: string | null;
}

export interface StaffCredentialDetail {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  password: string;
}

export type StaffCredentialListResponse = StaffCredential[];

export interface StaffPasswordUpdatePayload {
  password: string;
}

export interface StaffRoleUpdatePayload {
  role: UserRole;
}

export interface StaffStatusUpdatePayload {
  is_active: boolean;
}

export const STAFF_ROLES: {
  value: UserRole;
  label: string;
}[] = [
  {
    value: "FRONT_DESK",
    label: "Front Desk",
  },
  {
    value: "GRAPHIC_LEAD",
    label: "Graphic Lead",
  },
  {
    value: "GRAPHIC_DESIGNER",
    label: "Graphic Designer",
  },
];

export function getRoleLabel(role: UserRole) {
  switch (role) {
    case "FRONT_DESK":
      return "Front Desk";

    case "GRAPHIC_LEAD":
      return "Graphic Lead";

    case "GRAPHIC_DESIGNER":
      return "Graphic Designer";

    default:
      return role;
  }
}
