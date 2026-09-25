import React, { useState, useEffect } from "react";
import { Star, Trash2, MessageSquare, RefreshCw } from "lucide-react";
import { getAllReviews, deleteReview } from "@/lib/db/app-service";

export function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await getAllReviews();
      if (res && res.success && Array.isArray(res.reviews)) {
        setReviews(res.reviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("[Reviews] Error loading reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer review from the database?")) return;
    try {
      const res = await deleteReview({ data: { id } });
      if (res && res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(res?.error || "Failed to delete review.");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">Customer Reviews & Ratings</h2>
          <p className="text-xs text-white/50">Genuine product reviews and ratings submitted by store customers.</p>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/40 text-xs font-semibold text-white/80 hover:text-white transition cursor-pointer w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-brand-orange" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-12 text-center text-white/50 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-orange" />
          <span>Loading customer reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-12 text-center">
          <MessageSquare className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No customer reviews yet</h3>
          <p className="text-xs text-white/40 max-w-sm mx-auto">
            Real customer reviews and feedback submitted on product pages will appear here. No mock or fake reviews are displayed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 shadow-lg flex items-start justify-between gap-4 hover:border-white/20 transition"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white">{rev.customer}</span>
                  <span className="text-[10px] text-white/40">• on {rev.garment || "Apparel"}</span>
                  {rev.date && (
                    <span className="text-[10px] text-white/30 font-mono">
                      {new Date(rev.date).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
                {rev.comment && (
                  <p className="text-xs text-white/80 leading-relaxed italic">"{rev.comment}"</p>
                )}
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {rev.status || "Verified"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                  title="Delete review"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
