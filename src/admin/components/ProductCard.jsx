import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

export function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 shadow-lg flex flex-col hover:border-white/20 transition group text-white">
      {/* Product Image */}
      <div className="aspect-square w-full rounded-xl bg-zinc-800/60 border border-white/5 p-4 flex items-center justify-center overflow-hidden mb-3.5 relative">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
        />
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
          {formatCurrency(product.price)}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange mb-1">
          {product.category || "Apparel"}
        </span>
        <h4 className="font-bold text-sm text-white line-clamp-1 mb-2">
          {product.name}
        </h4>

        <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-white/50">
            {product.colors ? `${product.colors.length} colors` : "Multi-color"}
          </span>
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                aria-label={`Edit ${product.name}`}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 hover:text-white transition"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(product)}
                aria-label={`Delete ${product.name}`}
                className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-950/40 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
