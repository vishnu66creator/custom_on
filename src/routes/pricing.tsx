import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Custom On" },
      {
        name: "description",
        content:
          "Transparent pricing for single pieces, bulk orders, and corporate packages. No setup fees.",
      },
      { property: "og:title", content: "Pricing — Custom On" },
      {
        property: "og:description",
        content: "Single, bulk, and corporate custom apparel pricing.",
      },
    ],
  }),
  component: PricingPage,
});

const TIERS = [
  {
    name: "Single",
    price: "$28",
    unit: "/piece",
    description: "Perfect for personal one-off custom designs.",
    features: ["1 garment", "Full-color print", "Free design preview", "3-5 day delivery"],
    cta: "Start Designing",
    highlight: false,
  },
  {
    name: "Bulk",
    price: "$19",
    unit: "/piece",
    description: "10+ pieces. Ideal for events, run clubs, and merch drops.",
    features: [
      "10+ garments",
      "Up to 25% off retail",
      "Mixed sizes free",
      "Dedicated production rep",
    ],
    cta: "Get Bulk Quote",
    highlight: true,
  },
  {
    name: "Corporate",
    price: "Custom",
    unit: "",
    description: "100+ pieces with managed account and net-30 invoicing.",
    features: [
      "Account manager",
      "Net-30 invoicing",
      "Sample kit included",
      "On-site brand color matching",
    ],
    cta: "Talk to Sales",
    highlight: false,
  },
];

function PricingPage() {
  return (
    <PageShell>
      <section className="border-b border-brand-black/5 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Pricing
          </span>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase tracking-tight md:text-6xl">
            Simple, scalable pricing
          </h1>
          <p className="mt-4 text-brand-black/60">
            One price covers garment, printing, and quality control. No setup fees, no surprises.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              className={`flex flex-col rounded-3xl border p-8 ${
                tier.highlight
                  ? "border-brand-orange bg-brand-black text-white shadow-2xl"
                  : "border-brand-black/10 bg-white"
              }`}
            >
              <h3 className="text-sm font-bold uppercase tracking-widest">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-extrabold">{tier.price}</span>
                <span className={tier.highlight ? "text-white/60" : "text-brand-black/50"}>
                  {tier.unit}
                </span>
              </div>
              <p
                className={`mt-3 text-sm ${
                  tier.highlight ? "text-white/60" : "text-brand-black/60"
                }`}
              >
                {tier.description}
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <Check
                      className={`h-4 w-4 ${tier.highlight ? "text-brand-orange" : "text-brand-orange"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={tier.name === "Corporate" ? "/contact" : "/studio"}
                className={`mt-10 block py-3.5 text-center text-xs font-bold uppercase tracking-widest ${
                  tier.highlight
                    ? "bg-brand-orange text-white"
                    : "border-2 border-brand-black hover:bg-brand-black hover:text-white"
                }`}
              >
                {tier.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-brand-gray px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <Card title="Bulk discounts">
            <DiscountRow qty="10–24 pieces" off="15% off" />
            <DiscountRow qty="25–49 pieces" off="20% off" />
            <DiscountRow qty="50–99 pieces" off="25% off" />
            <DiscountRow qty="100+ pieces" off="Custom quote" />
          </Card>
          <Card title="Delivery">
            <DiscountRow qty="Standard (3–5 days)" off="$6.99" />
            <DiscountRow qty="Express (2 days)" off="$14.99" />
            <DiscountRow qty="Free over $80" off="$0" />
            <DiscountRow qty="Bulk freight" off="Quoted" />
          </Card>
        </div>
      </section>
    </PageShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-brand-black/5 bg-white p-8">
      <h3 className="mb-6 text-sm font-bold uppercase tracking-widest">{title}</h3>
      <ul className="divide-y divide-brand-black/5">{children}</ul>
    </div>
  );
}

function DiscountRow({ qty, off }: { qty: string; off: string }) {
  return (
    <li className="flex items-center justify-between py-3 text-sm">
      <span className="text-brand-black/70">{qty}</span>
      <span className="font-bold">{off}</span>
    </li>
  );
}
