import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Custom On" },
      {
        name: "description",
        content:
          "Get in touch with the Custom On team. Email, phone, and business hours for quotes and support.",
      },
      { property: "og:title", content: "Contact — Custom On" },
      {
        property: "og:description",
        content: "Reach out for bulk quotes, design support, or anything else.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell>
      <section className="border-b border-brand-black/5 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Contact
          </span>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase tracking-tight md:text-6xl">
            Let&rsquo;s talk merch
          </h1>
          <p className="mt-4 max-w-xl text-brand-black/60">
            Need a quote, sample, or design help? Send us a message and we&rsquo;ll be back within
            one business hour.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="rounded-3xl border border-brand-black/5 bg-white p-8 md:p-10"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Name">
                <input
                  required
                  maxLength={80}
                  className="w-full border border-brand-black/15 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                />
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  maxLength={120}
                  className="w-full border border-brand-black/15 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                />
              </Field>
              <Field label="Subject" full>
                <input
                  maxLength={120}
                  className="w-full border border-brand-black/15 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                />
              </Field>
              <Field label="Message" full>
                <textarea
                  required
                  rows={6}
                  maxLength={1500}
                  className="w-full resize-none border border-brand-black/15 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                />
              </Field>
            </div>
            <button
              type="submit"
              className="mt-8 inline-flex items-center justify-center bg-brand-orange px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-brand transition-transform hover:-translate-y-0.5"
            >
              Send Message
            </button>
            {sent && (
              <p className="mt-4 text-sm text-brand-black/60">
                Thanks — we&rsquo;ll get back to you shortly.
              </p>
            )}
          </form>

          <aside className="space-y-6">
            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              title="Email"
              body="Customon.in@gmail.com"
            />
            <InfoCard icon={<Phone className="h-5 w-5" />} title="Phone" body="7090637746" />
            <InfoCard
              icon={<MapPin className="h-5 w-5" />}
              title="Studio Address"
              body={
                <>
                  145/8, 3rd Cross,
                  <br />
                  Venkateshwara Layout, Bengaluru
                </>
              }
            />
            <InfoCard
              icon={<Clock className="h-5 w-5" />}
              title="Working Hours"
              body="Mon–Sat: 9:00 AM - 8:00 PM"
            />
          </aside>
        </div>

        <div className="mx-auto mt-12 max-w-6xl overflow-hidden rounded-3xl border border-brand-black/5">
          <iframe
            title="Custom On Studio location"
            src="https://www.google.com/maps?q=145/8,+3rd+Cross,+Venkateshwara+Layout,+Bengaluru&output=embed"
            className="h-[360px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={full ? "sm:col-span-2" : undefined}>
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-brand-black/60">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-brand-black/5 bg-white p-6">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-orange/10 text-brand-orange">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand-black/60">
          {title}
        </h3>
        <p className="mt-1 text-sm text-brand-black/80">{body}</p>
      </div>
    </div>
  );
}
