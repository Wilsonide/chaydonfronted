import type { AnalyticsSummary } from "@/app/types/analytics";
import api from "./api";

const analyticsService = {
  async getYearlyAnalytics(year: number): Promise<AnalyticsSummary> {
    const response = await api.get<AnalyticsSummary>(
      `/analytics/yearly?year=${year}`,
    );

    return response.data;
  },
};

export default analyticsService;