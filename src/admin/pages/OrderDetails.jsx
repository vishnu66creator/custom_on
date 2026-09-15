import React, { useState } from "react";
import { ArrowLeft, Check, Package, Printer, Truck, User } from "lucide-react";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { formatCurrency, formatDate, formatOrderId } from "../utils/formatters";

export function OrderDetails({ order, onBack, onUpdateStatus }) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || "paid");
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setSelectedStatus(newStatus);
    if (onUpdateStatus) {
      await onUpdateStatus(order.id, newStatus);
    }
    setUpdating(false);
  };

  return (
    <div className="space-y-6 max-w-4xl text-white animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-brand-orange">
                {formatOrderId(order.id)}
              </h2>
              <OrderStatusBadge status={selectedStatus} />
            </div>
            <p className="text-xs text-white/50">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white hover:bg-white/10 transition"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print Packing Slip</span>
        </button>
      </div>

      {/* Grid: Order Status Pipeline & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-tight flex items-center gap-2">
              <Package className="h-4 w-4 text-brand-orange" />
              <span>Custom Garment Items ({order.items?.length || 0})</span>
            </h3>

            <div className="divide-y divide-white/5">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold p-1">
                      👕
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{item.productName || "Custom T-Shirt"}</h4>
                      <div className="text-[11px] text-white/40">
                        Size: <span className="text-white/70 font-semibold">{item.size || "M"}</span> | Color: <span className="text-white/70 font-semibold">{item.color || "Black"}</span>
                      </div>
                      <div className="text-[10px] text-brand-orange font-mono">
                        Qty: {item.quantity || 1}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-xs text-white">
                    {formatCurrency(item.price || 0)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-white/60">Total Amount</span>
              <span className="font-mono font-bold text-base text-brand-orange">
                {formatCurrency(order.total || 0)}
              </span>
            </div>
          </div>

          {/* Fulfillment Status Control */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-tight flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-orange" />
              <span>Update Fulfillment State</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["paid", "processing", "shipped", "delivered"].map((st) => (
                <button
                  key={st}
                  disabled={updating}
                  onClick={() => handleStatusChange(st)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    selectedStatus.toLowerCase() === st
                      ? "bg-brand-orange text-white shadow-brand"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Customer & Shipping */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-tight flex items-center gap-2">
              <User className="h-4 w-4 text-brand-orange" />
              <span>Customer Details</span>
            </h3>
            <div className="text-xs space-y-1.5 text-white/70">
              <div className="font-bold text-white">
                {order.shippingAddress?.fullName || order.customerName || "Customer Name"}
              </div>
              <div>{order.shippingAddress?.email || "customer@example.com"}</div>
              <div>{order.shippingAddress?.phone || "+1 (555) 019-2834"}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 shadow-xl space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-tight flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand-orange" />
              <span>Delivery Address</span>
            </h3>
            <div className="text-xs space-y-1 text-white/60">
              <div>{order.shippingAddress?.addressLine1 || "742 Evergreen Terrace"}</div>
              <div>
                {order.shippingAddress?.city || "Springfield"},{" "}
                {order.shippingAddress?.postalCode || "97477"}
              </div>
              <div>{order.shippingAddress?.country || "United States"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
