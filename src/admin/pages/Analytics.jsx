import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";
import { analyticsService } from "../services/analyticsService";
import { StatCard } from "../components/StatCard";
import { formatCurrency } from "../utils/formatters";

export function Analytics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    analyticsService.getMetrics().then(setMetrics);
  }, []);

  if (!metrics) return null;

  return (
    <div className="space-y-8 text-white animate-fade-in">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">Sales & Print Volume Analytics</h2>
        <p className="text-xs text-white/50">Comprehensive store performance, AOV, and top custom print categories.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Annual Projected" value={formatCurrency(metrics.revenueTotal)} change={metrics.revenueGrowth} isPositive={true} icon={DollarSign} />
        <StatCard title="Fulfillments" value={metrics.ordersTotal} change={metrics.ordersGrowth} isPositive={true} icon={Package} />
        <StatCard title="Average Order" value={formatCurrency(metrics.averageOrderValue)} change="+4.2%" isPositive={true} icon={TrendingUp} />
        <StatCard title="Studio Interactions" value="12.4k" change="+34%" isPositive={true} icon={BarChart3} />
      </div>

      {/* Top Garments Leaderboard */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl space-y-4">
        <h3 className="font-display text-base font-bold uppercase tracking-tight">
          Top-Selling Blank Garments
        </h3>

        <div className="divide-y divide-white/5">
          {metrics.topGarments.map((g, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-brand-orange">0{idx + 1}</span>
                <div>
                  <div className="font-bold text-xs text-white">{g.name}</div>
                  <div className="text-[10px] text-white/40">{g.units} units printed</div>
                </div>
              </div>
              <div className="font-mono font-bold text-xs text-white">
                {formatCurrency(g.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
