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
          <div className="font-bold text-white text-xs">
            {row.shippingName || row.customerName || "Customer"}
          </div>
          <div className="text-[10px] text-white/40 font-mono">
            {row.shippingPhone || row.shippingAddress || "Storefront Order"}
          </div>
        </div>
      ),
    },
    {
      header: "Garment / Item",
      accessor: "productName",
      render: (row) => (
        <span className="text-xs text-white/80">
          {row.productName || "Custom Apparel"} {row.size ? `(${row.size})` : ""}
        </span>
      ),
    },
    {
      header: "Amount",
      accessor: "totalPrice",
      render: (row) => (
        <span className="font-mono font-bold text-white text-xs">
          {formatCurrency(row.totalPrice || row.total || 0)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <OrderStatusBadge status={row.status || "Pending"} />,
    },
    {
      header: "Placed At",
      accessor: "date",
      render: (row) => (
        <span className="text-xs text-white/50">
          {formatDate(row.date || row.createdAt)}
        </span>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">
            Customer Orders & Fulfillment
          </h2>
          <p className="text-xs text-white/50">
            Real customer orders placed through the CustomOn application.
          </p>
        </div>
        <div className="text-xs text-white/40 font-mono">
          Total: {orders.length} {orders.length === 1 ? "order" : "orders"}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchKey="id"
        emptyMessage="No customer orders placed yet."
      />
    </div>
  );
}
