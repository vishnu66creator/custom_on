import React, { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { validateProductForm } from "../utils/validation";

export function EditProduct({ product, onBack, onSave }) {
  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "T-Shirts");
  const [price, setPrice] = useState(product?.price ? String(product.price) : "29.99");
  const [description, setDescription] = useState(product?.description || "");
  const [image, setImage] = useState(product?.image || "");
  const [colors, setColors] = useState(product?.colors || []);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#f97316");
  const [errors, setErrors] = useState({});

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName("");
  };

  const handleRemoveColor = (idx) => {
    setColors(colors.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = validateProductForm({ name, price, category });
    if (!val.isValid) {
      setErrors(val.errors);
      return;
    }

    onSave(product.id, {
      name: name.trim(),
      category,
      price: parseFloat(price),
      description: description.trim(),
      image,
      colors,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl text-white animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">Edit Apparel Item</h2>
          <p className="text-xs text-white/50">Update specifications, pricing, and color variants.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6 shadow-xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">Garment Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-zinc-800/80 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-brand-orange"
            />
            {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl bg-zinc-800/80 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-brand-orange"
            >
              <option value="T-Shirts">T-Shirts</option>
              <option value="Hoodies">Hoodies</option>
              <option value="Sweatshirts">Sweatshirts</option>
              <option value="Polos">Polos</option>
              <option value="Tanks">Tanks</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">Base Price ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl bg-zinc-800/80 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-brand-orange"
            />
            {errors.price && <p className="text-red-400 text-[10px] mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">Image Asset URL</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-xl bg-zinc-800/80 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-brand-orange"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl bg-zinc-800/80 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-brand-orange"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">Colors</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {colors.map((col, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-xs"
              >
                <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: col.hex }} />
                <span>{col.name}</span>
                <button type="button" onClick={() => handleRemoveColor(idx)} className="text-white/40 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Color name"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              className="rounded-xl bg-zinc-800 border border-white/10 px-3 py-1.5 text-xs text-white outline-none"
            />
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="h-8 w-10 rounded-lg cursor-pointer bg-transparent"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/5"
            >
              Add Color
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white/60 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-orange text-xs font-bold uppercase tracking-wider text-white shadow-brand hover:bg-orange-600 transition"
          >
            <Save className="h-4 w-4" />
            <span>Update Garment</span>
          </button>
        </div>
      </form>
    </div>
  );
}
