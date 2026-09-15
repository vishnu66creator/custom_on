import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({ title, value, change, isPositive = true, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-lg backdrop-blur-md hover:border-white/20 transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
          {title}
        </span>
        {Icon && (
          <div className="h-9 w-9 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="font-display text-2xl font-black tracking-tight text-white">
          {value}
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
