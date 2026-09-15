import api from "./api";

import type { Designer } from "@/components/users/types";

class UserService {
  async getDesigners() {
    return api.get<Designer[]>("/users/designers");
  }
}

const userService = new UserService();

export default userService;
