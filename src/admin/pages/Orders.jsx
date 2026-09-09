import React from "react";
import { Eye } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { formatCurrency, formatDate, formatOrderId } from "../utils/formatters";

export function Orders({ orders = [], onSelectOrder }) {
  const columns = [
    {
      header: "Order ID",
      accessor: "id",
      render: (row) => (
        <span className="font-mono font-bold text-brand-orange text-xs">
          {formatOrderId(row.id)}
        </span>
      ),
    },
    {
      header: "Customer",
      accessor: "customer",
      render: (row) => (
        <div>
          <div className="font-bold text-white text-xs">{row.shippingAddress?.fullName || row.customerName || "Customer"}</div>
          <div className="text-[10px] text-white/40">{row.shippingAddress?.email || "Direct Studio Order"}</div>
        </div>
      ),
    },
    {
      header: "Items",
      accessor: "items",
      render: (row) => (
        <span className="text-xs text-white/80">
          {row.items?.length || 1} item(s)
        </span>
      ),
    },
    {
      header: "Amount",
      accessor: "total",
      render: (row) => (
        <span className="font-mono font-bold text-white text-xs">
          {formatCurrency(row.total || 0)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <OrderStatusBadge status={row.status || "paid"} />,
    },
    {
      header: "Placed At",
      accessor: "createdAt",
      render: (row) => (
        <span className="text-xs text-white/50">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      render: (row) => (
        <button
          onClick={() => onSelectOrder(row)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/80 hover:bg-white/5 hover:text-white transition"
        >
          <Eye className="h-3 w-3" />
          <span>Details</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">Custom Orders & Fulfillment</h2>
        <p className="text-xs text-white/50">Manage printing queue, customer orders, shipping labels, and status updates.</p>
      </div>

      <DataTable columns={columns} data={orders} searchKey="id" emptyMessage="No orders found." />
    </div>
  );
}
