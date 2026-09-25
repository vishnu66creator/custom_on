/**
 * Admin Analytics & KPI Service
 * Fetches real metrics directly from the backend database.
 */
import { getAdminAnalytics } from "@/lib/db/app-service";

export const analyticsService = {
  async getMetrics() {
    try {
      const res = await getAdminAnalytics();
      if (res && res.success) {
        return {
          revenueTotal: Number(res.revenueTotal) || 0,
          ordersTotal: Number(res.ordersTotal) || 0,
          activeUsersTotal: Number(res.activeUsersTotal) || 0,
          averageOrderValue: Number(res.averageOrderValue) || 0,
          topGarments: Array.isArray(res.topGarments) ? res.topGarments : [],
        };
      }
    } catch (err) {
      console.error("[analyticsService] Error fetching live metrics:", err);
    }

    return {
      revenueTotal: 0,
      ordersTotal: 0,
      activeUsersTotal: 0,
      averageOrderValue: 0,
      topGarments: [],
    };
  },
};
