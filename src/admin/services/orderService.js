/**
 * Admin Order Fulfillment Service
 * Retrieves only real customer orders from the backend database.
 * No mock or fake order data.
 */
import { getOrders, updateOrderStatus } from "@/lib/orders-store";

export const orderService = {
  async getOrders() {
    try {
      const orders = await getOrders("all");
      return Array.isArray(orders) ? orders : [];
    } catch (e) {
      console.warn("Failed to load orders from server:", e?.message);
      return [];
    }
  },

  async updateStatus(orderId, newStatus) {
    try {
      return await updateOrderStatus(orderId, newStatus);
    } catch (e) {
      console.error("Failed to update status:", e);
      return false;
    }
  },

  async getOrderById(orderId) {
    try {
      const all = await this.getOrders();
      return all.find((o) => o.id === orderId) || null;
    } catch (e) {
      return null;
    }
  },
};
