import api from "./api";
import { DashboardResponse } from "@/app/types/dashboard";

const DashboardService = {
  async getSummary() {
    return api.get<DashboardResponse>("/dashboard/summary");
  },
};

export default DashboardService;
