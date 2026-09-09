/**
 * Admin User & Customer Management Service
 */

export const userService = {
  async getUsers() {
    try {
      const stored = localStorage.getItem("admin_users_data");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: "u-1", name: "Alex Morgan", email: "alex@example.com", role: "customer", ordersCount: 4, spent: 184.5, status: "active", createdAt: "2026-03-01" },
      { id: "u-2", name: "Jordan Lee", email: "jordan@example.com", role: "customer", ordersCount: 2, spent: 92.0, status: "active", createdAt: "2026-03-02" },
      { id: "u-3", name: "Samantha Cole", email: "sam@example.com", role: "customer", ordersCount: 7, spent: 345.2, status: "active", createdAt: "2026-02-15" },
      { id: "u-4", name: "System Admin", email: "admin@customon.in", role: "admin", ordersCount: 0, spent: 0, status: "active", createdAt: "2026-01-01" },
    ];
  },

  async updateUserRole(userId, newRole) {
    const users = await this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    localStorage.setItem("admin_users_data", JSON.stringify(updated));
    return { success: true, users: updated };
  },

  async toggleUserStatus(userId) {
    const users = await this.getUsers();
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, status: u.status === "active" ? "suspended" : "active" };
      }
      return u;
    });
    localStorage.setItem("admin_users_data", JSON.stringify(updated));
    return { success: true, users: updated };
  },
};
