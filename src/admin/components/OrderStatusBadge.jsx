import React from "react";
import { formatStatus } from "../utils/formatters";

export function OrderStatusBadge({ status = "pending" }) {
  const s = status.toLowerCase();

  let styles = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (s === "delivered" || s === "paid" || s === "approved" || s === "completed") {
    styles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  } else if (s === "processing" || s === "shipped") {
    styles = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  } else if (s === "cancelled" || s === "refunded" || s === "rejected") {
    styles = "bg-red-500/10 text-red-400 border-red-500/20";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {formatStatus(status)}
    </span>
  );
}
