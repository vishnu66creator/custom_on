import React, { useState } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { DataTable } from "../components/DataTable";
import { formatCurrency } from "../utils/formatters";

export function Products({ products = [], onAddClick, onEdit, onDelete }) {
  const [viewMode, setViewMode] = useState("grid");

  const tableColumns = [
    {
      header: "Product",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.image} alt={row.name} className="h-10 w-10 object-contain rounded-lg bg-zinc-800 p-1" />
          <div>
            <div className="font-bold text-white text-xs">{row.name}</div>
            <div className="text-[10px] text-brand-orange uppercase tracking-wider">{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      render: (row) => <span className="font-mono font-bold text-white text-xs">{formatCurrency(row.price)}</span>,
    },
    {
      header: "Colors",
      accessor: "colors",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.colors?.map((c, i) => (
            <span key={i} className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} title={c.name} />
          ))}
        </div>
      ),
    },
    {
      header: "Sizes",
      accessor: "sizes",
      render: (row) => <span className="text-[11px] text-white/60">{row.sizes?.join(", ")}</span>,
    },
    {
      header: "Actions",
      accessor: "id",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(row)}
            className="px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:bg-white/5 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(row)}
            className="px-2.5 py-1 rounded-lg border border-red-500/20 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-950/40 transition"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-white animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">Apparel Catalog</h2>
          <p className="text-xs text-white/50">Manage blank apparel products, pricing, available colors, and print placements.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-xl bg-zinc-900 border border-white/10 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${viewMode === "grid" ? "bg-brand-orange text-white" : "text-white/40 hover:text-white"}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition ${viewMode === "list" ? "bg-brand-orange text-white" : "text-white/40 hover:text-white"}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-xs font-bold uppercase tracking-wider text-white shadow-brand hover:bg-orange-600 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Garment</span>
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <DataTable columns={tableColumns} data={products} searchKey="name" emptyMessage="No products in catalog." />
      )}
    </div>
  );
}
