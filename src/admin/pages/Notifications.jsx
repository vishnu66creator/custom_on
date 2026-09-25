import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, Package, MessageSquare } from "lucide-react";
import { orderService } from "../services/orderService";
import { getAllReviews } from "@/lib/db/app-service";

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      const list = [];

      try {
        const orders = await orderService.getOrders();
        if (Array.isArray(orders)) {
          orders.slice(0, 5).forEach((o) => {
            list.push({
              id: `notif-order-${o.id}`,
              type: "order",
              title: `Customer Order #${o.id}`,
              time: o.date ? new Date(o.date).toLocaleDateString("en-IN") : "Recent",
              text: `${o.shippingName || o.customerName || "Customer"} placed an order for ${o.productName || "custom apparel"}. Status: ${o.status || "Pending"}.`,
            });
          });
        }
      } catch (err) {
        console.warn("Could not load order alerts:", err);
      }

      try {
        const revRes = await getAllReviews();
        if (revRes && revRes.success && Array.isArray(revRes.reviews)) {
          revRes.reviews.slice(0, 3).forEach((r) => {
            list.push({
              id: `notif-rev-${r.id}`,
              type: "review",
              title: `New ${r.rating}-Star Review on ${r.garment || "Apparel"}`,
              time: r.date ? new Date(r.date).toLocaleDateString("en-IN") : "Recent",
              text: `"${r.comment || "Customer submitted a review"}" - by ${r.customer || "Customer"}`,
            });
          });
        }
      } catch (err) {
        console.warn("Could not load review alerts:", err);
      }

      setNotifications(list);
      setLoading(false);
    }

    loadNotifications();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl text-white animate-fade-in">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">System Alerts & Notifications</h2>
        <p className="text-xs text-white/50">Real-time alerts for incoming orders, inventory thresholds, and customer reviews.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-12 text-center text-white/40 text-xs">
          Loading alerts...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-12 text-center">
          <Bell className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No active system alerts</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            Live orders and customer product reviews will appear here automatically. No mock notifications are displayed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 shadow-lg flex items-start gap-4 hover:border-white/20 transition"
            >
              <div className="h-9 w-9 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0">
                {n.type === "review" ? (
                  <MessageSquare className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-white">{n.title}</h4>
                  <span className="text-[10px] text-white/40">{n.time}</span>
                </div>
                <p className="text-xs text-white/70">{n.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
