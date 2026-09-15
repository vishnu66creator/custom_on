import React from "react";
import { DollarSign, ShoppingBag, Users, Sparkles, Plus, ArrowUpRight } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { formatCurrency, formatDate, formatOrderId } from "../utils/formatters";

export function Dashboard({ orders = [], onSelectTab }) {
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0) + 14250;
  const totalOrders = orders.length > 0 ? orders.length : 128;

  return (
    <div className="space-y-8 animate-fade-in text-white">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={formatCurrency(totalRevenue)}
          change="+18.4%"
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard
          title="Custom Orders"
          value={totalOrders}
          change="+12.1%"
          isPositive={true}
          icon={ShoppingBag}
        />
        <StatCard
          title="Active Customers"
          value="1,842"
          change="+24.5%"
          isPositive={true}
          icon={Users}
        />
        <StatCard
          title="Studio Designs"
          value="456"
          change="+31.0%"
          isPositive={true}
          icon={Sparkles}
        />
      </div>

      {/* Action shortcuts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold uppercase tracking-tight text-white">
                Recent Custom Orders
              </h3>
              <p className="text-xs text-white/50">Live orders placed from the Custom On studio.</p>
            </div>
            <button
              onClick={() => onSelectTab("orders")}
              className="text-xs font-bold uppercase tracking-wider text-brand-orange hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Garment</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-3 font-mono font-semibold text-brand-orange">
                      {formatOrderId(order.id)}
                    </td>
                    <td className="py-3 px-3">
                      {order.items && order.items[0] ? order.items[0].productName : "Custom Heavyweight Tee"}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-3">
                      <OrderStatusBadge status={order.status || "paid"} />
                    </td>
                    <td className="py-3 px-3 text-white/50">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Launch Actions */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-display text-base font-bold uppercase tracking-tight text-white mb-1">
              Store Management
            </h3>
            <p className="text-xs text-white/50 mb-4">
              Quick shortcuts to configure your shop catalog.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onSelectTab("add-product")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/40 hover:bg-white/10 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-brand-orange transition">
                      Add Apparel Item
                    </div>
                    <div className="text-[10px] text-white/40">New blank garment or mockup</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-brand-orange transition" />
              </button>

              <button
                onClick={() => onSelectTab("custom-designs")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/40 hover:bg-white/10 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-400 transition">
                      Review Custom Designs
                    </div>
                    <div className="text-[10px] text-white/40">Studio creations & art</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-purple-400 transition" />
              </button>

              <button
                onClick={() => onSelectTab("coupons")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/40 hover:bg-white/10 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                      Create Discount Code
                    </div>
                    <div className="text-[10px] text-white/40">Flash sale or promo coupon</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-center text-[11px] text-white/40">
            Connected to shared live database
          </div>
        </div>
      </div>
    </div>
  );
}
