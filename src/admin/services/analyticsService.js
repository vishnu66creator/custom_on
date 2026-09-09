/**
 * Admin Analytics & KPI Service
 */

export const analyticsService = {
  async getMetrics() {
    return {
      revenueTotal: 28450.0,
      revenueGrowth: "+18.2%",
      ordersTotal: 642,
      ordersGrowth: "+12.4%",
      activeUsersTotal: 1890,
      usersGrowth: "+24.0%",
      averageOrderValue: 44.31,
      topGarments: [
        { name: "Heavyweight Boxy Tee", units: 312, revenue: 10920 },
        { name: "Vintage Wash Hoodie", units: 184, revenue: 9936 },
        { name: "Minimalist Polo", units: 146, revenue: 5840 },
      ],
      monthlySales: [
        { month: "Jan", sales: 4200 },
        { month: "Feb", sales: 6100 },
        { month: "Mar", sales: 8400 },
        { month: "Apr", sales: 9750 },
      ],
    };
  },
};
