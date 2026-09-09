import React, { useState } from "react";
import { UserCheck, Shield, Ban, CheckCircle } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { formatCurrency } from "../utils/formatters";

export function Users({ users = [], onToggleStatus, onUpdateRole }) {
  const [selectedUser, setSelectedUser] = useState(null);

  const columns = [
    {
      header: "Customer",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-xs text-brand-orange">
            {row.name ? row.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="font-bold text-white text-xs">{row.name}</div>
            <div className="text-[10px] text-white/40">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            row.role === "admin"
              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
              : "bg-zinc-800 text-white/70 border-white/10"
          }`}
        >
          <Shield className="h-3 w-3" />
          {row.role}
        </span>
      ),
    },
    {
      header: "Orders",
      accessor: "ordersCount",
      render: (row) => <span className="font-mono text-xs">{row.ordersCount || 0} orders</span>,
    },
    {
      header: "Total Spent",
      accessor: "spent",
      render: (row) => (
        <span className="font-mono font-bold text-white text-xs">
          {formatCurrency(row.spent || 0)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            row.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {row.status === "active" ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
          {row.status || "active"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      render: (row) => (
        <div className="flex items-center gap-2">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(row.id)}
              className="px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:bg-white/5 transition"
            >
              {row.status === "active" ? "Suspend" : "Activate"}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">Registered Customers & Staff</h2>
          <p className="text-xs text-white/50">Manage accounts, assign administrative roles, and view purchase activity.</p>
        </div>
      </div>

      <DataTable columns={columns} data={users} searchKey="name" emptyMessage="No users registered." />
    </div>
  );
}
