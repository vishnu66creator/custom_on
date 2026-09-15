import React from "react";
import { Bell, AlertTriangle, CheckCircle, Package } from "lucide-react";

export function Notifications() {
  const notifications = [
    { id: 1, type: "order", title: "New Custom Order #ORD-948275", time: "10 mins ago", text: "Alex Morgan placed an order for 2x Heavyweight Boxy Tee." },
    { id: 2, type: "stock", title: "Low Stock Alert: Heather Gray Hoodie (L)", time: "1 hour ago", text: "Inventory for size L has fallen below 5 units." },
    { id: 3, type: "review", title: "New 5-Star Review Received", time: "3 hours ago", text: "Maya Okafor submitted a positive review for the T-shirt collection." },
  ];

  return (
    <div className="space-y-6 max-w-3xl text-white animate-fade-in">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">System Alerts & Notifications</h2>
        <p className="text-xs text-white/50">Real-time alerts for incoming orders, inventory thresholds, and reviews.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 shadow-lg flex items-start gap-4 hover:border-white/20 transition"
          >
            <div className="h-9 w-9 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0">
              {n.type === "stock" ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : <Package className="h-4 w-4" />}
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
    </div>
  );
}
