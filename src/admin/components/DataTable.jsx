import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchKey = "name",
  emptyMessage = "No records found",
  pageSize = 8,
}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((item) => {
    if (!search) return true;
    const val = item[searchKey];
    if (typeof val === "string") return val.toLowerCase().includes(search.toLowerCase());
    return JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const pageItems = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden shadow-xl backdrop-blur-md">
      {searchable && (
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search table..."
              className="w-full rounded-xl bg-zinc-800/80 border border-white/10 px-3 py-1.5 pl-8 text-xs text-white placeholder-white/30 outline-none focus:border-brand-orange"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
          </div>
          <span className="text-[11px] text-white/40 font-mono">
            {filteredData.length} records
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 font-bold uppercase tracking-wider text-white/50 text-[10px]">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-white/40">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageItems.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-white/[0.02] transition">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-3.5 text-white/80">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-3.5 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
