import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Custom On" },
      {
        name: "description",
        content:
          "Custom On is a custom apparel printing studio building premium tools for brands, teams, and creators.",
      },
      { property: "og:title", content: "About — Custom On" },
      {
        property: "og:description",
        content: "Our story, mission, and what makes Custom On different.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell>
      <section className="border-b border-brand-black/5 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Our story
          </span>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase tracking-tight md:text-6xl">
            We exist for people who refuse to wear someone else's idea.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-black/60">
            Custom On started in 2021 as a tiny screen-printing setup in a back-of-shop garage.
            Today we partner with thousands of creators, indie brands, and teams across the world to
            turn ideas into garments people actually love wearing.
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div className="rounded-3xl bg-brand-black p-12 text-white">
            <h2 className="font-display text-2xl font-extrabold uppercase">Mission</h2>
            <p className="mt-4 text-white/70">
              Make premium custom apparel accessible to every creator — without the minimums, setup
              fees, or 6-week timelines the industry treats as normal.
            </p>
          </div>
          <div className="rounded-3xl bg-brand-gray p-12">
            <h2 className="font-display text-2xl font-extrabold uppercase">Vision</h2>
            <p className="mt-4 text-brand-black/70">
              A world where what you wear is as personal as what you say. We're building the tools
              to make that effortless.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-gray px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
            Why choose Custom On
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Premium blanks",
                body: "We hand-pick heavyweight cotton from mills we visit personally.",
              },
              {
                title: "No minimums",
                body: "Order a single piece or ten thousand. Same care either way.",
              },
              {
                title: "Fast turnarounds",
                body: "Most orders ship within 48 hours of design approval.",
              },
              {
                title: "Eco-friendly inks",
                body: "Water-based, phthalate-free, and certified for direct skin contact.",
              },
              {
                title: "Designer-friendly",
                body: "Our studio accepts vector files, color libraries, and brand kits.",
              },
              {
                title: "Real humans",
                body: "Email a designer, not a bot. Average reply time is under an hour.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-brand-black/5 bg-white p-8"
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-orange">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-brand-black/70">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
