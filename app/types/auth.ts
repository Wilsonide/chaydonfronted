export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  FRONT_DESK = "FRONT_DESK",
  GRAPHIC_LEAD = "GRAPHIC_LEAD",
  GRAPHIC_DESIGNER = "GRAPHIC_DESIGNER",
}

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
