import React, { useState, useEffect } from "react";
import { Plus, Trash2, Sticker as StickerIcon } from "lucide-react";
import { stickerService } from "../services/stickerService";

export function Stickers() {
  const [stickers, setStickers] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Vintage");
  const [icon, setIcon] = useState("⚡");
  const [showAdd, setShowAdd] = useState(false);

  const loadStickers = async () => {
    const list = await stickerService.getStickers();
    setStickers(list);
  };

  useEffect(() => {
    loadStickers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await stickerService.addSticker({ name: name.trim(), category, icon });
    setName("");
    setShowAdd(false);
    loadStickers();
  };

  const handleDelete = async (id) => {
    await stickerService.deleteSticker(id);
    loadStickers();
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">Studio Stickers & Clipart</h2>
          <p className="text-xs text-white/50">Manage the vector graphic stickers available in the customer Design Studio.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-xs font-bold uppercase tracking-wider text-white shadow-brand hover:bg-orange-600 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Sticker</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-2xl border border-white/10 bg-zinc-900/90 p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-orange">New Sticker Asset</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Neon Crown"
                className="w-full rounded-xl bg-zinc-800 border border-white/10 px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-zinc-800 border border-white/10 px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Emoji / Symbol</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full rounded-xl bg-zinc-800 border border-white/10 px-3 py-2 text-xs text-white outline-none text-center text-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-white/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-brand-orange text-xs font-bold uppercase tracking-wider text-white"
            >
              Save Sticker
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stickers.map((stk) => (
          <div
            key={stk.id}
            className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 flex flex-col items-center justify-center hover:border-white/20 transition group relative"
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition duration-300 select-none">
              {stk.icon}
            </span>
            <div className="font-bold text-xs text-white text-center line-clamp-1">{stk.name}</div>
            <div className="text-[10px] text-white/40">{stk.category}</div>
            <button
              onClick={() => handleDelete(stk.id)}
              className="absolute top-2 right-2 p-1 rounded-lg border border-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-950/40 transition"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
