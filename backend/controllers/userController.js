/**
 * User Controller
 */
export const userController = {
  async getAllUsers(req, res) {
    return res.json({
      success: true,
      users: [
        { id: "u-1", name: "Alex Morgan", email: "alex@example.com", role: "customer", ordersCount: 4, spent: 184.5 },
        { id: "u-2", name: "Jordan Lee", email: "jordan@example.com", role: "customer", ordersCount: 2, spent: 92.0 },
        { id: "u-3", name: "Samantha Cole", email: "sam@example.com", role: "customer", ordersCount: 7, spent: 345.2 },
      ],
    });
  },

  async updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;
    return res.json({ success: true, message: `User ${id} updated to ${role}` });
  },
};
