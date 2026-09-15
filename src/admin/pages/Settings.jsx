import React, { useState } from "react";
import { Save, ShieldCheck } from "lucide-react";

export function Settings() {
  const [storeName, setStoreName] = useState("Custom On Apparel");
  const [supportEmail, setSupportEmail] = useState("support@customon.in");
  const [currency, setCurrency] = useState("USD");
  const [shippingFlatRate, setShippingFlatRate] = useState("4.99");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl text-white animate-fade-in">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">Store & Studio Parameters</h2>
        <p className="text-xs text-white/50">Manage global store currency, shipping policies, and notifications.</p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6 shadow-xl space-y-4">
        {saved && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Store Name</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-brand-orange"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Support Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-brand-orange"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="INR">INR (₹)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Standard Shipping Flat Rate ($)</label>
          <input
            type="number"
            step="0.01"
            value={shippingFlatRate}
            onChange={(e) => setShippingFlatRate(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-brand-orange"
          />
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange text-xs font-bold uppercase tracking-wider text-white shadow-brand hover:bg-orange-600 transition"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
