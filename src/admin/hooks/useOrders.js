import { useState, useEffect, useCallback } from "react";
import { orderService } from "../services/orderService";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const list = await orderService.getOrders();
      setOrders(Array.isArray(list) ? list : []);
    } catch (e) {
      console.warn("fetchOrders hook error:", e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    const res = await orderService.updateStatus(orderId, newStatus);
    await fetchOrders();
    return res;
  };

  return {
    orders,
    loading,
    refresh: fetchOrders,
    updateStatus,
  };
}
