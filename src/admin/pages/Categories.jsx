import React, { useState } from "react";
import { FolderTree, Plus, Trash2 } from "lucide-react";

export function Categories() {
  const [categories, setCategories] = useState([
    { id: 1, name: "T-Shirts", slug: "t-shirts", count: 8 },
    { id: 2, name: "Hoodies", slug: "hoodies", count: 4 },
    { id: 3, name: "Sweatshirts", slug: "sweatshirts", count: 3 },
    { id: 4, name: "Polos", slug: "polos", count: 2 },
    { id: 5, name: "Tanks", slug: "tanks", count: 2 },
  ]);
  const [newCat, setNewCat] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setCategories([
      ...categories,
      {
        id: Date.now(),
        name: newCat.trim(),
        slug: newCat.trim().toLowerCase().replace(/\s+/g, "-"),
        count: 0,
      },
    ]);
    setNewCat("");
  };

  const handleDelete = (id) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 max-w-2xl text-white animate-fade-in">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">Apparel Categories</h2>
        <p className="text-xs text-white/50">Organize merchandise into store taxonomy groups.</p>
      </div>

      {/* Add bar */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="New Category Name (e.g. Long Sleeves)"
          className="flex-1 rounded-xl bg-zinc-900 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-brand-orange"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-xs font-bold uppercase tracking-wider text-white shadow-brand hover:bg-orange-600 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add</span>
        </button>
      </form>

      {/* List */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden divide-y divide-white/5">
        {categories.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                <FolderTree className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">{c.name}</div>
                <div className="text-[10px] text-white/40">slug: /{c.slug}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-mono text-white/50">{c.count} items</span>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-950/40 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
