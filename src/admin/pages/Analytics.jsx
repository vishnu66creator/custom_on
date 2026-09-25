import React, { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Package, Users } from "lucide-react";
import { analyticsService } from "../services/analyticsService";
import { StatCard } from "../components/StatCard";
import { formatCurrency } from "../utils/formatters";

export function Analytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getMetrics()
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) {
    return (
      <div className="py-16 text-center text-white/40 text-xs animate-pulse">
        Loading real-time analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white animate-fade-in">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">
          Sales & Print Volume Analytics
        </h2>
        <p className="text-xs text-white/50">
          Live store performance, average order value, and top customized garments based on actual database records.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Store Revenue"
          value={formatCurrency(metrics.revenueTotal)}
          change=""
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard
          title="Completed Orders"
          value={metrics.ordersTotal}
          change=""
          isPositive={true}
          icon={Package}
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(metrics.averageOrderValue)}
          change=""
          isPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          title="Registered Customers"
          value={metrics.activeUsersTotal}
          change=""
          isPositive={true}
          icon={Users}
        />
      </div>

      {/* Top Garments Leaderboard */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold uppercase tracking-tight">
            Top-Selling Blank Garments
          </h3>
          <span className="text-[11px] text-white/40 font-mono">
            {metrics.topGarments.length} {metrics.topGarments.length === 1 ? "item" : "items"}
          </span>
        </div>

        {metrics.topGarments.length === 0 ? (
          <div className="py-8 text-center text-white/40 text-xs">
            No garment sales recorded yet. Once customer orders are placed, top-selling items will appear here.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {metrics.topGarments.map((g, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-brand-orange">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-white">{g.name}</div>
                    <div className="text-[10px] text-white/40">{g.units} unit(s) printed</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-xs text-white">
                  {formatCurrency(g.revenue)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
