import React, { useState, useEffect } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import { paymentService } from "../services/paymentService";
import { DataTable } from "../components/DataTable";
import { formatCurrency } from "../utils/formatters";

export function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    const data = await paymentService.getPayments();
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRefund = async (id) => {
    const res = await paymentService.refundPayment(id);
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
            onClick={() => handleRefund(row.id)}
            className="px-2.5 py-1 rounded-lg border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-950/40 transition"
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
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">Payments & Settlement Ledger</h2>
        <p className="text-xs text-white/50">Track customer gateway transactions, captured charges, and refunds.</p>
      </div>

      <DataTable columns={columns} data={payments} searchKey="id" emptyMessage="No transactions recorded." />
    </div>
  );
}
