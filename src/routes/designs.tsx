import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";
import { getWishlistDesigns, removeDesignFromWishlist, type SavedDesign } from "@/lib/wishlist-store";
import { PRODUCTS } from "@/lib/products";
import { GarmentImage } from "@/lib/garments";
import { Palette, Trash2, Edit3, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/designs")({
  head: () => ({
    meta: [
      { title: "My Designs — CustomON" },
      { name: "description", content: "View and edit your saved custom apparel designs." },
    ],
  }),
  component: MyDesignsPage,
});

function MyDesignsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  const loadDesigns = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWishlistDesigns();
      setDesigns(data);
    } catch (err) {
      console.error("Failed to load saved designs", err);
      setError("Unable to load your saved designs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadDesigns();
    }
  }, [user?.username]);

  const handleDelete = async (designId: string, name: string) => {
    try {
      await removeDesignFromWishlist(designId);
      toast.success(`Removed saved design: "${name}"`);
      await loadDesigns();
    } catch (err) {
      console.error("Failed to delete saved design", err);
      toast.error("Unable to delete saved design.");
    }
  };

  if (authLoading || (!user && isLoading)) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF5F1F]" />
          <p className="text-xs font-bold uppercase tracking-wider text-brand-black/60 dark:text-zinc-400">
            Loading saved designs...
          </p>
        </div>
      </PageShell>
    );
  }

  if (!user) return null;

  return (
    <PageShell>
      {/* Header */}
      <section className="bg-brand-black px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#FF5F1F] flex items-center gap-2">
              <Palette className="h-3.5 w-3.5" /> Customer Gallery
            </span>
            <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
              My Designs
            </h1>
            <p className="mt-1 text-xs text-white/60">
              Your saved custom apparel configurations ({designs.length})
            </p>
          </div>

          <Link
            to="/studio"
            className="flex items-center gap-2 rounded-xl bg-[#FF5F1F] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#ff7a45]"
          >
            <Sparkles className="h-4 w-4" /> Create New Design
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-12 bg-brand-gray/30 dark:bg-[#0b0b0d] min-h-[60vh]">
        <div className="mx-auto max-w-7xl space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-xs font-bold text-red-500">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#FF5F1F]" />
              <p className="text-xs font-bold text-brand-black/50 dark:text-zinc-500">
                Fetching your custom artwork...
              </p>
            </div>
          ) : designs.length === 0 ? (
            /* Professional Empty State */
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-brand-black/15 dark:border-white/15 bg-white/80 dark:bg-[#141417]/80 p-12 text-center shadow-xs">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#FF5F1F]/10 text-[#FF5F1F]">
                <Palette className="h-8 w-8" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-black uppercase tracking-tight text-brand-black dark:text-white">
                You haven&apos;t saved any designs yet
              </h2>
              <p className="mt-2 max-w-md text-xs font-medium text-brand-black/60 dark:text-zinc-400">
                Customize any garment with text, uploaded artwork, and custom font styling in our Studio, then save it here to edit or order anytime.
              </p>
              <Link
                to="/studio"
                className="mt-6 flex items-center gap-2 rounded-xl bg-[#FF5F1F] px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white transition hover:bg-[#ff7a45]"
              >
                <span>Start Designing</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            /* Saved Designs Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((design) => {
                const product = PRODUCTS.find((p) => p.id === design.productId) ?? PRODUCTS[0]!;
                const dateStr = design.date
                  ? new Date(design.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently Saved";

                return (
                  <div
                    key={design.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-brand-black/10 dark:border-white/10 bg-white dark:bg-[#141417] p-5 shadow-xs transition-all hover:border-[#FF5F1F]/40 hover:shadow-xl"
                  >
                    <div>
                      {/* T-Shirt Garment Mockup Box */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-[#1c1c20] p-4 flex items-center justify-center border border-brand-black/5 dark:border-white/5">
                        <div
                          className="relative h-full w-full max-w-[180px] rounded-xl flex flex-col items-center justify-center"
                          style={{ backgroundColor: design.shirtColor }}
                        >
                          <GarmentImage
                            product={product}
                            side="front"
                            size="M"
                            color={design.shirtColor}
                            className="h-full w-full object-contain"
                          />
                          {design.customImage && (
                            <img
                              src={design.customImage}
                              alt="Graphic"
                              className="absolute h-10 w-10 object-contain drop-shadow-md"
                              style={{ top: "38%", left: "50%", transform: "translate(-50%, -50%)" }}
                            />
                          )}
                          {design.customText && (
                            <span
                              className="absolute max-w-[80%] truncate text-center text-[10px] font-extrabold"
                              style={{
                                top: "58%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                color: design.customTextColor || "#000",
                                fontFamily: design.customTextFont,
                              }}
                            >
                              {design.customText}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Design Details */}
                      <div className="mt-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5F1F]">
                            {design.shirtColorName || "Custom Color"}
                          </span>
                          <span className="text-[10px] font-bold text-brand-black/50 dark:text-zinc-500">
                            {dateStr}
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-black uppercase tracking-tight text-brand-black dark:text-white truncate">
                          {design.productName}
                        </h3>

                        <p className="truncate text-xs font-semibold text-brand-black/70 dark:text-zinc-300">
                          {design.customText || "Custom Artwork & Layers"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-2 border-t border-brand-black/5 dark:border-white/5 pt-3">
                      <Link
                        to="/studio"
                        search={{ designId: design.id }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF5F1F] py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#ff7a45]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Design</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(design.id, design.productName)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-black/10 dark:border-white/10 text-brand-black/60 dark:text-zinc-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition"
                        title="Delete saved design"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
