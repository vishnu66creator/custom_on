/**
 * Admin Controller
 */
export const adminController = {
  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }
    // Demo mode / mock
    if ((email === "admin@customon.in" || email === "admin") && password.length >= 4) {
      return res.json({
        success: true,
        user: { id: "admin-1", email, name: "System Admin", role: "admin" },
        token: "demo-admin-token-2026",
      });
    }
    return res.status(401).json({ success: false, error: "Invalid admin credentials." });
  },

  async getDashboardStats(req, res) {
    return res.json({
      success: true,
      stats: {
        totalRevenue: 148250,
        ordersCount: 642,
        customersCount: 1890,
        designsCount: 456,
      },
    });
  },
};
