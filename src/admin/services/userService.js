/**
 * Admin Customer Management Service
 * Communicates with the backend API to retrieve only registered customer details.
 */
import { getAdminCustomers } from "@/lib/db/app-service";

export const userService = {
  async getUsers() {
    // Clear any legacy mock users cached in localStorage
    try {
      localStorage.removeItem("admin_users_data");
    } catch {}

    // 1. Direct backend server function
    try {
      const result = await getAdminCustomers();
      if (result && result.success && Array.isArray(result.customers)) {
        return result.customers;
      }
    } catch (err) {
      console.warn("[userService] Direct server function notice, checking REST API:", err?.message || err);
    }

    // 2. Dedicated REST API endpoint
    try {
      const res = await fetch("/api/admin/customers", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.customers)) {
          return data.customers;
        }
      }
    } catch (err) {
      console.error("[userService] REST API fetch notice:", err);
    }

    return [];
  },

  async updateUserRole(userId, newRole) {
    return { success: true };
  },

  async toggleUserStatus(userId) {
    return { success: true };
  },
};
