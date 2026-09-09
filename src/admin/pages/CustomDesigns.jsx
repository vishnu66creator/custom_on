import React, { useState, useEffect } from "react";
import { Sparkles, Check, X, Eye } from "lucide-react";
import { designService } from "../services/designService";
import { DataTable } from "../components/DataTable";

export function CustomDesigns() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDesigns = async () => {
    setLoading(true);
    const data = await designService.getCustomDesigns();
    setDesigns(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDesigns();
  }, []);

  const handleApprove = async (id) => {
    await designService.approveDesign(id);
    loadDesigns();
  };

  const handleReject = async (id) => {
    await designService.rejectDesign(id);
    loadDesigns();
  };

  const columns = [
    {
      header: "Artwork Title",
      accessor: "title",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-white text-xs">{row.title}</div>
            <div className="text-[10px] text-white/40">by {row.customer}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Garment Base",
      accessor: "garment",
      render: (row) => (
        <span className="text-xs text-white/80">
          {row.garment} ({row.color})
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            row.status === "Approved"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : row.status === "Rejected"
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      render: (row) => <span className="text-xs text-white/50">{row.createdAt}</span>,
    },
    {
      header: "Print Review",
      accessor: "id",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status !== "Approved" && (
            <button
              onClick={() => handleApprove(row.id)}
              className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition"
              title="Approve for Production"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          {row.status !== "Rejected" && (
            <button
              onClick={() => handleReject(row.id)}
              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
              title="Flag Resolution / Reject"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">Customer Studio Designs</h2>
        <p className="text-xs text-white/50">Verify high-resolution print vectors, vector DPI, and approve customer mockups.</p>
      </div>

      <DataTable columns={columns} data={designs} searchKey="title" emptyMessage="No custom designs submitted." />
    </div>
  );
}
