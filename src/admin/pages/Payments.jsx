import React, { useState, useEffect } from "react";
import { CreditCard, RefreshCw, CheckCircle2 } from "lucide-react";
import { paymentService } from "../services/paymentService";
import { DataTable } from "../components/DataTable";
import { formatCurrency } from "../utils/formatters";

export function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    const data = await paymentService.getPayments();
    setPayments(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRefund = async (row) => {
    if (!window.confirm(`Issue refund for transaction ${row.id} (Order ${row.orderId})?`)) return;
    const res = await paymentService.refundPayment(row.id, row.orderId);
    alert(res.message);
    loadPayments();
  };

  const columns = [
    {
      header: "Tx ID",
      accessor: "id",
      render: (row) => <span className="font-mono font-bold text-brand-orange text-xs">{row.id}</span>,
    },
    {
      header: "Order ID",
      accessor: "orderId",
      render: (row) => <span className="font-mono text-xs text-white/80">{row.orderId}</span>,
    },
    {
      header: "Customer",
      accessor: "customer",
      render: (row) => <span className="font-bold text-xs text-white">{row.customer}</span>,
    },
    {
      header: "Amount",
      accessor: "amount",
      render: (row) => <span className="font-mono font-bold text-xs">{formatCurrency(row.amount)}</span>,
    },
    {
      header: "Method",
      accessor: "method",
      render: (row) => <span className="text-xs text-white/60">{row.method}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            row.status === "Captured"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "date",
      render: (row) => <span className="text-xs text-white/40">{row.date}</span>,
    },
    {
      header: "Action",
      accessor: "id",
      render: (row) =>
        row.status === "Captured" ? (
          <button
            onClick={() => handleRefund(row)}
            className="px-2.5 py-1 rounded-lg border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-950/40 transition cursor-pointer"
          >
            Refund
          </button>
        ) : (
          <span className="text-[11px] text-white/30">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">Payments & Settlement Ledger</h2>
          <p className="text-xs text-white/50">Real-time payment gateway transactions and settlements from database orders.</p>
        </div>

        <button
          onClick={loadPayments}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/40 text-xs font-semibold text-white/80 hover:text-white transition cursor-pointer w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-brand-orange" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchKey="id"
        emptyMessage="No payment transactions recorded yet."
      />
    </div>
  );
}
