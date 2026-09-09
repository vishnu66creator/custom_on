import React, { useState } from "react";
import { Plus, Ticket, Trash2 } from "lucide-react";
import { validateCouponForm } from "../utils/validation";

export function Coupons() {
  const [coupons, setCoupons] = useState([
    { id: 1, code: "FIRST10", discount: 10, type: "percentage", uses: 84, active: true },
    { id: 2, code: "CUSTOMSPRING", discount: 15, type: "percentage", uses: 42, active: true },
    { id: 3, code: "FREESHIP", discount: 5, type: "fixed", uses: 120, active: true },
  ]);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("10");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    const val = validateCouponForm({ code, discount });
    if (!val.isValid) return;

    setCoupons([
      ...coupons,
      {
        id: Date.now(),
        code: code.trim().toUpperCase(),
        discount: parseFloat(discount),
        type: "percentage",
        uses: 0,
        active: true,
      },
    ]);
    setCode("");
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 max-w-2xl text-white animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">Coupons & Discount Codes</h2>
          <p className="text-xs text-white/50">Manage promotional checkout vouchers and percentage discounts.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-orange text-xs font-bold uppercase tracking-wider text-white shadow-brand hover:bg-orange-600 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-2xl border border-white/10 bg-zinc-900/90 p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-orange">Create Coupon Code</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SUMMER25"
                className="w-full rounded-xl bg-zinc-800 border border-white/10 px-3 py-2 text-xs text-white uppercase outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Discount %</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="10"
                className="w-full rounded-xl bg-zinc-800 border border-white/10 px-3 py-2 text-xs text-white outline-none"
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
              Save Coupon
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 overflow-hidden divide-y divide-white/5">
        {coupons.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange">
                <Ticket className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono font-bold text-sm text-brand-orange">{c.code}</div>
                <div className="text-[10px] text-white/40">{c.discount}% off entire order</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-white/60">{c.uses} redeemed</span>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-950/40"
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
