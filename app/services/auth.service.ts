import api from "./api";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/app/types/auth";

class AuthService {
  login(data: LoginPayload) {
    return api.post<AuthResponse>("/auth/login", data);
  }

  register(data: RegisterPayload) {
    return api.post("/auth/register", data);
  }

  refresh() {
    return api.post<AuthResponse>("/auth/refresh");
  }

  logout() {
    return api.post("/auth/logout");
  }

  me() {
    return api.get<User>("/auth/me");
  }
}

const authService = new AuthService();

export default authService;
