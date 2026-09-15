import React, { useState } from "react";
import { Star, Check, Trash2 } from "lucide-react";

export function Reviews() {
  const [reviews, setReviews] = useState([
    { id: 1, customer: "Maya Okafor", rating: 5, garment: "Heavyweight Boxy Tee", comment: "The print quality is unreal. Every single shirt looked like a designer drop.", status: "Published" },
    { id: 2, customer: "Daniel Reyes", rating: 5, garment: "Pullover Hoodie", comment: "Saved us hours. We mocked our entire merch line in one afternoon.", status: "Published" },
    { id: 3, customer: "Priya Shah", rating: 4, garment: "Minimalist Polo", comment: "Bulk pricing was great, and heavyweight fabric feels premium.", status: "Pending" },
  ]);

  const handleApprove = (id) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, status: "Published" } : r)));
  };

  const handleDelete = (id) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6 max-w-3xl text-white animate-fade-in">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">Customer Reviews & Ratings</h2>
        <p className="text-xs text-white/50">Moderate customer feedback on garments and printing accuracy.</p>
      </div>

      <div className="space-y-3">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 shadow-lg flex items-start justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex text-brand-orange">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-white">{rev.customer}</span>
                <span className="text-[10px] text-white/40">• on {rev.garment}</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed italic">"{rev.comment}"</p>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  rev.status === "Published"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {rev.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {rev.status !== "Published" && (
                <button
                  onClick={() => handleApprove(rev.id)}
                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                  title="Approve Review"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => handleDelete(rev.id)}
                className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-950/40"
                title="Delete"
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
