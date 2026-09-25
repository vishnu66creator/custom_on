import React from "react";
import { CheckCircle, Ban, RefreshCw, User, Mail, Phone, Calendar, Hash } from "lucide-react";
import { DataTable } from "../components/DataTable";

export function Users({ users = [], onRefresh, loading }) {
  const columns = [
    {
      header: "Customer ID",
      accessor: "id",
      render: (row) => (
        <span className="font-mono text-[11px] text-brand-orange bg-brand-orange/10 px-2.5 py-1 rounded-lg border border-brand-orange/20 whitespace-nowrap">
          {row.id || "—"}
        </span>
      ),
    },
    {
      header: "Customer Name",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
            {row.name ? row.name.charAt(0).toUpperCase() : "C"}
          </div>
          <div className="font-bold text-white text-xs">
            {row.name || "Customer"}
          </div>
        </div>
      ),
    },
    {
      header: "Email Address",
      accessor: "email",
      render: (row) => (
        <span className="font-mono text-xs text-white/80">
          {row.email || "—"}
        </span>
      ),
    },
    {
      header: "Phone Number",
      accessor: "phone",
      render: (row) => (
        <span className="font-mono text-xs text-white/70 whitespace-nowrap">
          {row.phone || "—"}
        </span>
      ),
    },
    {
      header: "Joined Date",
      accessor: "createdAt",
      render: (row) => (
        <span className="text-xs text-white/60 whitespace-nowrap">
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      header: "Account Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
            row.status === "active"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}
        >
          {row.status === "active" ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <Ban className="h-3 w-3" />
          )}
          {row.status || "active"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">
            Registered Customers
          </h2>
          <p className="text-xs text-white/50">
            Real customer accounts registered through the CustomOn application.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-white/40 font-mono">
            Total: {users.length} {users.length === 1 ? "customer" : "customers"}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/40 text-xs font-semibold text-white/80 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-brand-orange" : ""}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        emptyMessage="No customer accounts registered yet."
      />
    </div>
  );
}
