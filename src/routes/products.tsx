import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import {
  CATEGORIES,
  ALL_APPAREL_COLORS,
  STANDARD_APPAREL_SIZES,
  type Category,
  type Product,
} from "@/lib/products";
import { useAuth } from "../lib/auth";
import { getProducts, getProductsAsync } from "../lib/products-store";
import { Search, Heart, Star, X } from "lucide-react";
import { getWishlistProducts, toggleProductWishlist } from "@/lib/wishlist-store";
import { getReviews, addReview, getRatingSummary, type Review } from "@/lib/reviews-store";
import { GarmentImage } from "@/lib/garments";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Shop Custom Apparel — Custom On" },
      {
        name: "description",
        content:
          "Browse premium custom T-shirts, hoodies, polos, and oversized T-shirts. Filter by category, size, color, and price.",
      },
      { property: "og:title", content: "Shop Custom Apparel — Custom On" },
      {
        property: "og:description",
        content: "Premium blanks ready to be customized in our Design Studio.",
      },
    ],
  }),
  component: ProductsPage,
});

const ALL_SIZES = STANDARD_APPAREL_SIZES;
const ALL_COLORS = ALL_APPAREL_COLORS;

function ProductsPage() {
  const { user } = useAuth();
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(getProducts());
  const [category, setCategory] = useState<Category | "All">("All");

  useEffect(() => {
    getProductsAsync().then((prods) => {
      setCatalogProducts(prods);
    });
  }, []);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(60);
  // Search & Sorting States
  type SortMode = "featured" | "price-asc" | "price-desc" | "name";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortMode>("featured");
  const [ratingSummaries, setRatingSummaries] = useState<
    Record<string, { average: number; count: number }>
  >({});

  useEffect(() => {
    Promise.all(
      catalogProducts.map(
        async (product) => [product.id, await getRatingSummary(product.id)] as const,
      ),
    )
      .then((entries) => setRatingSummaries(Object.fromEntries(entries)))
      .catch((error) => console.error("Failed to load rating summaries", error));
  }, [catalogProducts]);

  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  useEffect(() => {
    if (!user) return;
    getWishlistProducts()
      .then(setWishlistedIds)
      .catch((error) => console.error("Failed to load wishlist", error));
  }, [user]);

  const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      await toggleProductWishlist(productId);
      setWishlistedIds(await getWishlistProducts());
    } catch (error) {
      console.error("Failed to update wishlist", error);
    }
  };

  // Details Modal State
  const [selectedDetailsProduct, setSelectedDetailsProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const result = catalogProducts
      .filter((p) => category === "All" || p.category === category)
      .filter((p) => !size || p.sizes.includes(size))
      .filter((p) => !color || p.colors.includes(color))
      .filter((p) => p.price <= maxPrice)
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.blurb.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [catalogProducts, category, size, color, maxPrice, searchQuery, sortBy]);

  return (
    <PageShell>
      <section className="border-b border-brand-black/5 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            The Catalog
          </span>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase tracking-tight md:text-6xl">
            Shop Premium Blanks
          </h1>
          <p className="mt-4 max-w-xl text-brand-black/60">
            Every product is print-ready and pairs with our Design Studio for instant customization.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          {user?.role === "shop-owner" && (
            <div className="rounded-2xl border border-brand-orange/20 bg-brand-orange/5 p-8 text-center animate-fade-in">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-orange">
                Management Mode Active
              </span>
              <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-tight text-brand-black">
                Welcome back, {user.username}!
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-brand-black/60">
                You are logged in as a Shop Owner. Use the unified admin dashboard to manage orders,
                catalog blank products, and reference designs.
              </p>
              <Link
                to="/dashboard"
                className="mt-5 inline-block bg-brand-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-orange shadow-brand transition hover:-translate-y-0.5"
              >
                Open Owner Dashboard
              </Link>
            </div>
          )}

          <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
            {/* Filters */}
            <aside className="space-y-8">
              {/* Search catalog */}
              <FilterGroup title="Search Catalog">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-brand-black/15 pl-9 pr-4 py-2.5 text-xs outline-none focus:border-brand-orange"
                  />
                  <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-brand-black/40" />
                </div>
              </FilterGroup>

              <FilterGroup title="Category">
                {(["All", ...CATEGORIES] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`block w-full text-left text-sm transition-colors ${
                      category === c
                        ? "font-bold text-brand-orange"
                        : "text-brand-black/70 hover:text-brand-black"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </FilterGroup>

              <FilterGroup title="Size">
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(size === s ? null : s)}
                      className={`min-w-[2.75rem] border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                        size === s
                          ? "border-brand-black bg-brand-black text-white"
                          : "border-brand-black/15 hover:border-brand-black"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup title="Color">
                <div className="flex flex-wrap gap-2">
                  {ALL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Color ${c}`}
                      onClick={() => setColor(color === c ? null : c)}
                      className={`size-8 rounded-full border-2 ${
                        color === c ? "border-brand-orange" : "border-brand-black/10"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup title={`Max price: $${maxPrice}`}>
                <input
                  type="range"
                  min={15}
                  max={60}
                  step={1}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-orange"
                />
              </FilterGroup>
            </aside>

            {/* Grid */}
            <div>
              {/* Grid Header with Sorting options */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-brand-black/5 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-black/60">
                  Showing {filtered.length} products
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-black/40">
                    Sort By:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortMode)}
                    className="rounded-lg border border-brand-black/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider outline-none focus:border-brand-orange bg-white"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-lg border border-dashed border-brand-black/15 p-16 text-center text-brand-black/50">
                  No products match these filters.
                </div>
              ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((p) => {
                    const ratingSummary = ratingSummaries[p.id] ?? { average: 5, count: 0 };
                    const isWishlisted = wishlistedIds.includes(p.id);
                    return (
                      <article
                        key={p.id}
                        onClick={() => setSelectedDetailsProduct(p)}
                        className="group cursor-pointer"
                      >
                        <div className="mb-4 aspect-[4/5] overflow-hidden rounded-lg bg-brand-gray relative">
                          <GarmentImage
                            product={p}
                            side="front"
                            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Heart wish overlay */}
                          {user?.role !== "shop-owner" && (
                            <button
                              type="button"
                              onClick={(e) => handleToggleWishlist(e, p.id)}
                              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition hover:scale-105"
                            >
                              <Heart
                                className={`h-4 w-4 transition-colors ${
                                  isWishlisted
                                    ? "fill-red-500 text-red-500"
                                    : "text-brand-black/40 hover:text-red-500"
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40 flex items-center gap-1.5">
                              <span>{p.category}</span>
                              <span>•</span>
                              <span className="flex items-center text-amber-500">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="ml-0.5 text-brand-black/60 font-bold">
                                  {ratingSummary.average} ({ratingSummary.count})
                                </span>
                              </span>
                            </p>
                            <h3 className="truncate font-bold uppercase mt-1 text-sm">{p.name}</h3>
                          </div>
                          <span className="shrink-0 font-bold text-sm">${p.price}</span>
                        </div>
                        <p className="mt-2 text-xs text-brand-black/50 leading-relaxed truncate">
                          {p.blurb}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          {p.colors.slice(0, 4).map((c) => (
                            <span
                              key={c}
                              className="size-3.5 rounded-full border border-brand-black/10"
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                        {user?.role === "shop-owner" ? (
                          <Link
                            to="/dashboard"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-4 block bg-brand-orange py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-black"
                          >
                            Manage this blank
                          </Link>
                        ) : (
                          <Link
                            to="/studio"
                            search={{ productId: p.id }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-4 block border border-brand-black/10 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-brand-black hover:text-white"
                          >
                            Customize this
                          </Link>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Details & Reviews Modal overlay */}
      {selectedDetailsProduct && (
        <ProductDetailsModal
          product={selectedDetailsProduct}
          onClose={() => setSelectedDetailsProduct(null)}
          wishlisted={wishlistedIds.includes(selectedDetailsProduct.id)}
          onToggleWishlist={(e) => handleToggleWishlist(e, selectedDetailsProduct.id)}
        />
      )}
    </PageShell>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-brand-black/60">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/* ------------------ PRODUCT DETAILS & REVIEWS MODAL ------------------ */

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  wishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
}

function ProductDetailsModal({
  product,
  onClose,
  wishlisted,
  onToggleWishlist,
}: ProductDetailsModalProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getReviews(product.id)
      .then(setReviews)
      .catch((error) => console.error("Failed to load reviews", error));
  }, [product.id]);

  const [ratingSummary, setRatingSummary] = useState({ average: 5, count: 0 });

  useEffect(() => {
    getRatingSummary(product.id)
      .then(setRatingSummary)
      .catch((error) => console.error("Failed to load rating summary", error));
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addReview(product.id, author, rating, comment);
    setReviews(await getReviews(product.id));
    setAuthor("");
    setRating(5);
    setComment("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-brand-black/5 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-fade-in">
        {/* Left: Product Image */}
        <div className="md:w-1/2 bg-brand-gray relative flex items-center justify-center p-6 shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-[300px] md:max-h-[440px] object-contain rounded-2xl"
          />
          <button
            type="button"
            onClick={onToggleWishlist}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white shadow-md transition hover:scale-105"
          >
            <Heart
              className={`h-5 w-5 ${wishlisted ? "fill-red-500 text-red-500" : "text-brand-black/40"}`}
            />
          </button>
        </div>

        {/* Right: Info & Reviews */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-between gap-6 max-h-[90vh] md:max-h-[500px]">
          <div>
            <div className="flex items-center justify-between border-b border-brand-black/5 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-orange">
                  {product.category}
                </span>
                <h2 className="font-display text-2xl font-extrabold uppercase mt-1 text-brand-black">
                  {product.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-brand-gray p-2 hover:bg-brand-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-xl font-extrabold text-brand-black">
                ${product.price.toFixed(2)}
              </span>
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(ratingSummary.average)
                        ? "fill-current"
                        : "text-brand-black/15"
                    }`}
                  />
                ))}
                <span className="ml-1.5 text-xs text-brand-black/60 font-bold">
                  {ratingSummary.average} ({ratingSummary.count} reviews)
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm text-brand-black/60 leading-relaxed">{product.blurb}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-brand-gray px-3 py-1.5 text-xs font-bold text-brand-black/70"
                >
                  {s}
                </span>
              ))}
            </div>

            {user?.role === "shop-owner" ? (
              <Link
                to="/dashboard"
                className="mt-6 block w-full bg-brand-orange text-center py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-black shadow-md transition hover:-translate-y-0.5"
              >
                Manage this apparel blank in Dashboard
              </Link>
            ) : (
              <Link
                to="/studio"
                search={{ productId: product.id }}
                className="mt-6 block w-full bg-brand-black text-center py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-orange shadow-md transition hover:-translate-y-0.5"
              >
                Customize in Design Studio
              </Link>
            )}

            {/* Reviews Section */}
            <div className="mt-8 pt-6 border-t border-brand-black/5 space-y-6">
              <h3 className="font-display text-lg font-bold uppercase text-brand-black">
                Customer Reviews ({reviews.length})
              </h3>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl bg-brand-gray/30 p-4 border border-brand-black/5"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-brand-black">{rev.author}</span>
                      <span className="text-[10px] text-brand-black/40">
                        {new Date(rev.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-amber-500 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${s <= rev.rating ? "fill-current" : "text-brand-black/10"}`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-brand-black/60 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>

              {/* Write Review Form */}
              {user?.role !== "shop-owner" && (
                <form
                  onSubmit={handleSubmitReview}
                  className="pt-6 border-t border-brand-black/5 space-y-4"
                >
                  <h4 className="text-sm font-bold uppercase tracking-wider text-brand-black">
                    Write a Review
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-black/60">
                        Your Name
                      </span>
                      <input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full rounded-xl border border-brand-black/10 px-3 py-2 text-xs outline-none focus:border-brand-orange mt-1"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-black/60 font-bold">
                        Rating
                      </span>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            className="text-amber-500 transition hover:scale-110"
                          >
                            <Star
                              className={`h-5 w-5 ${s <= rating ? "fill-current" : "text-brand-black/20"}`}
                            />
                          </button>
                        ))}
                      </div>
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-black/60">
                      Review Details
                    </span>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us what you liked or disliked..."
                      rows={3}
                      className="w-full rounded-xl border border-brand-black/10 px-3 py-2 text-xs outline-none focus:border-brand-orange mt-1"
                    />
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="bg-brand-black text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-brand-orange"
                    >
                      Submit Review
                    </button>
                    {success && (
                      <span className="text-xs font-bold text-green-600">
                        Review posted! Thank you.
                      </span>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
