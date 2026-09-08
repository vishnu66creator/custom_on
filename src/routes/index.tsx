import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { PRODUCTS, type Product } from "@/lib/products";
import { getProducts, getProductsAsync } from "@/lib/products-store";
import { useAuth } from "@/lib/auth";
import heroTee from "@/assets/hero-tee.jpg";
import teeFront from "@/assets/tee-front.png";
import { Star, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Custom On — Design Your Own T-Shirt in Minutes" },
      {
        name: "description",
        content:
          "Premium custom apparel printing. Design T-shirts, hoodies, and polos in the Custom On Design Studio and we'll print and ship.",
      },
      { property: "og:title", content: "Custom On — Wear Your Creativity" },
      {
        property: "og:description",
        content: "Premium custom apparel printing. Design in minutes, delivered fast.",
      },
    ],
  }),
  component: HomePage,
});

const TESTIMONIALS = [
  {
    name: "Maya Okafor",
    role: "Founder, Studio Nine",
    quote:
      "The print quality is unreal. We ordered 80 launch T-shirts for our team and every single one looked like a designer drop.",
  },
  {
    name: "Daniel Reyes",
    role: "Creative Director",
    quote:
      "Custom On's studio editor saved us hours. We mocked our entire merch line in one afternoon and shipped two weeks later.",
  },
  {
    name: "Priya Shah",
    role: "Run Club Captain",
    quote:
      "Bulk pricing was the best I found, and the heavyweight T-shirts feel premium. The team has been wearing them every week.",
  },
];

function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState<Product[]>(getProducts().slice(0, 4));

  useEffect(() => {
    let active = true;
    getProductsAsync().then((prods) => {
      if (active) {
        setFeatured(prods.slice(0, 4));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // 1. Hero 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    // Max rotation 12 degrees
    const rX = -(mouseY / (height / 2)) * 12;
    const rY = (mouseX / (width / 2)) * 12;
    setTilt({ x: rX, y: rY });
  };

  const handleHeroMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // 2. Drag to Scroll Featured Products Timeline
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleDragStart = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <PageShell>
      {/* Immersive Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-brand-black/5 dark:border-white/5 py-12 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-6 relative z-10 grid items-center gap-16 lg:grid-cols-12">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start justify-center">
            <span className="mb-6 inline-flex items-center gap-2 bg-brand-orange/10 px-3.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-brand-orange rounded-full">
              <span className="size-1.5 rounded-full bg-brand-orange animate-pulse" />
              Custom On // Wear Your Story
            </span>
            <h1 className="mb-8 font-display text-6xl font-extrabold leading-[0.9] tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl uppercase">
              DESIGN <br />
              YOUR <span className="text-brand-orange">OWN</span> <br />
              CANVAS.
            </h1>
            <p className="mb-10 max-w-lg text-lg leading-relaxed text-brand-black/60 dark:text-white/60">
              Ethically sourced heavyweight garments crafted as a blank canvas for your design.
              Real-time 3D live feedback custom printing studio.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              {user?.role === "shop-owner" ? (
                <Link
                  to="/dashboard"
                  className="group relative overflow-hidden bg-brand-orange px-10 py-5 text-xs font-bold uppercase tracking-widest text-white shadow-brand transition-all hover:bg-brand-black dark:hover:bg-white dark:hover:text-brand-black"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Admin Dashboard <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              ) : (
                <Link
                  to="/studio"
                  data-cursor="EDIT"
                  className="group relative overflow-hidden bg-brand-orange px-10 py-5 text-xs font-bold uppercase tracking-widest text-white shadow-brand transition-all hover:bg-brand-black dark:hover:bg-white dark:hover:text-brand-black"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Designing <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              )}
              <Link
                to="/products"
                className="group border-2 border-brand-black dark:border-white px-10 py-[18px] text-xs font-bold uppercase tracking-widest text-brand-black dark:text-white transition-all hover:bg-brand-black hover:text-white dark:hover:bg-white dark:hover:text-brand-black"
              >
                Browse Catalog
              </Link>
            </div>
          </div>

          {/* Hero Right Motion-Reactive Shirt Display */}
          <div
            className="lg:col-span-5 flex justify-center items-center"
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
          >
            <div
              className="relative w-full max-w-[450px] aspect-[4/5] rounded-3xl border border-brand-black/10 dark:border-white/10 bg-neutral-50 dark:bg-zinc-900/40 p-6 backdrop-blur-xl shadow-2xl flex items-center justify-center overflow-hidden group tilt-wrapper"
              style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`,
                transition: "transform 0.15s ease-out",
              }}
            >
              {/* Inner ambient glow inside the card */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/5 to-transparent pointer-events-none" />

              <img
                src={heroTee}
                alt="Premium oversized black t-shirt preview"
                className="h-[85%] w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />

              {/* Monospace floating detail overlays */}
              <div className="absolute top-6 left-6 font-mono text-[9px] uppercase tracking-wider opacity-60">
                Studio // V1.0
              </div>
              <div className="absolute top-6 right-6 font-mono text-[9px] uppercase tracking-wider text-brand-orange font-bold">
                ● Live Model
              </div>
              <div className="absolute bottom-6 left-6 max-w-[200px]">
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  3D Realtime Preview
                </p>
                <p className="text-[9px] leading-relaxed text-brand-black/40 dark:text-white/40 mt-1">
                  Interact with real-time vector uploads and textures on premium cotton.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Minimal Grid: How it works */}
      <section className="border-b border-brand-black/5 dark:border-white/5 bg-[#0A0A0C] text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Choose Canvas",
                body: "Select from our curated range of ethically sourced, ultra-heavyweight cotton garments.",
              },
              {
                n: "02",
                title: "Upload Artwork",
                body: "Drop your vectors, logos, or typography directly into our vector-friendly browser studio.",
              },
              {
                n: "03",
                title: "Print & Deliver",
                body: "Printed using water-based, eco-certified inks and dispatched to your door in 48h.",
              },
            ].map((step, idx) => (
              <div
                key={step.n}
                className="group p-12 lg:p-16 border-b md:border-b-0 md:border-r border-white/5 last:border-0 hover:bg-white/[0.02] transition-all duration-500 relative"
              >
                <span className="block font-mono text-8xl font-black text-white/5 transition-colors duration-500 group-hover:text-brand-orange/20">
                  {step.n}
                </span>
                <h3 className="mb-3 mt-6 text-lg font-bold uppercase tracking-widest">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/40 group-hover:text-white/60 transition-colors duration-300">
                  {step.body}
                </p>

                {/* Thin overlay line on hover */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Draggable Showcase */}
      <section className="px-6 py-24 border-b border-brand-black/5 dark:border-white/5 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-orange">
                Selected Bases
              </span>
              <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight uppercase md:text-5xl">
                Popular Canvases
              </h2>
            </div>
            <Link
              to="/products"
              className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-b-2 border-brand-orange pb-1 hover:text-brand-orange transition-colors"
            >
              View Full Collection
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Draggable Row */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleDragStart}
            onMouseLeave={handleDragEnd}
            onMouseUp={handleDragEnd}
            onMouseMove={handleDragMove}
            data-cursor="DRAG"
            className="flex gap-8 overflow-x-auto pb-12 cursor-grab active:cursor-grabbing scrollbar-none select-none scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {featured.map((p) => (
              <div
                key={p.id}
                className="min-w-[280px] sm:min-w-[320px] max-w-[320px] group flex-shrink-0"
              >
                <div className="mb-5 aspect-[4/5] w-full overflow-hidden rounded-2xl border border-brand-black/5 dark:border-white/5 bg-brand-gray dark:bg-zinc-900/50 relative p-4 flex items-center justify-center unseen-card">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    draggable="false"
                    className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                  />

                  {/* Floating pricing badge */}
                  <div className="absolute top-4 right-4 bg-brand-black dark:bg-white text-white dark:text-brand-black font-mono text-[10px] font-bold px-2.5 py-1 rounded">
                    ${p.price.toFixed(2)}
                  </div>
                </div>

                <div className="flex flex-col gap-3 px-1">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-bold uppercase tracking-wide text-sm">{p.name}</h4>
                    <span className="font-mono text-xs font-bold text-brand-orange">${p.price.toFixed(2)}</span>
                  </div>
                  <Link
                    to="/studio"
                    search={{ productId: p.id }}
                    data-cursor="EDIT"
                    className="block w-full rounded-xl bg-brand-black dark:bg-white/10 py-2.5 text-center text-[10px] font-extrabold uppercase tracking-wider text-white transition-all hover:bg-brand-orange dark:hover:bg-brand-orange shadow-sm"
                  >
                    Customize & Choose Color
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Studio Splitting Teaser */}
      <section className="px-6 py-24 bg-brand-gray dark:bg-zinc-950 border-b border-brand-black/5 dark:border-white/5">
        <div className="mx-auto max-w-7xl flex flex-col overflow-hidden rounded-3xl border border-brand-black/5 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-2xl lg:flex-row">
          {/* Interactive Shirt design mockup */}
          <div className="relative flex min-h-[500px] items-center justify-center bg-neutral-100 dark:bg-zinc-900/80 p-8 lg:w-2/3 border-b lg:border-b-0 lg:border-r border-brand-black/5 dark:border-white/5">
            <div className="absolute left-6 top-6 flex gap-2">
              <div className="size-3 rounded-full bg-red-400/80" />
              <div className="size-3 rounded-full bg-yellow-400/80" />
              <div className="size-3 rounded-full bg-green-400/80" />
            </div>

            <div
              data-cursor="EDIT"
              className="grid aspect-square w-full max-w-lg place-items-center rounded-2xl bg-white dark:bg-zinc-950 p-8 shadow-lg hover:rotate-1 transition-transform duration-500 border border-brand-black/5 dark:border-white/5"
            >
              <img
                src={teeFront}
                alt="Blank t-shirt designer preview"
                loading="lazy"
                className="max-h-[85%] max-w-[85%] object-contain animate-float"
              />
            </div>
          </div>

          {/* Teaser right content */}
          <div className="flex flex-col justify-center p-12 lg:p-16 lg:w-1/3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-orange">
              Creative Suite
            </span>
            <h2 className="mt-2 mb-6 font-display text-3xl font-extrabold uppercase tracking-tight">
              Pro Design Studio
            </h2>

            <ul className="mb-10 space-y-4 text-xs font-semibold">
              {[
                "High-Res Vector SVG & Raster PNG uploads",
                "100+ Premium typographic sets & Google fonts",
                "Advanced placements (Front, Back & Sleeves)",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid size-5 place-items-center rounded-full bg-brand-orange text-[9px] text-white">
                    ✓
                  </span>
                  <span className="text-brand-black/75 dark:text-white/75">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/studio"
              className="block w-full bg-brand-black dark:bg-white text-white dark:text-brand-black py-4.5 text-center font-bold uppercase tracking-widest transition-all hover:bg-brand-orange hover:text-white dark:hover:bg-brand-orange dark:hover:text-white"
            >
              Open Studio Editor
            </Link>
          </div>
        </div>
      </section>

      {/* Styled Testimonials */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center max-w-xl mx-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-orange">
              Feedback
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
              Loved by Creators
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <figure
                key={t.name}
                className="flex flex-col gap-6 rounded-3xl border border-brand-black/5 dark:border-white/5 bg-brand-gray dark:bg-zinc-900/30 p-8 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex gap-1 text-brand-orange">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <blockquote className="text-base leading-relaxed text-brand-black/80 dark:text-white/80 italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-auto pt-6 border-t border-brand-black/5 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">{t.name}</div>
                    <div className="text-[10px] text-brand-black/40 dark:text-white/40 uppercase tracking-widest mt-0.5">
                      {t.role}
                    </div>
                  </div>
                  <span className="font-mono text-xs text-brand-orange/40">0{idx + 1}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
