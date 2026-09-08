import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { cartTotal, clearCart, getCart, type CartItem } from "@/lib/cart-store";
import { createCustomerOrder } from "@/lib/db/app-service";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/order-review")({ component: OrderReviewPage });

function OrderReviewPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.username ?? "",
    address: "",
  });
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    getCart()
      .then(setItems)
      .catch((error) => {
        console.error("Failed to load cart", error);
        toast.error("Unable to load your cart.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, navigate, user]);

  const total = cartTotal(items);

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast.error("Please complete your delivery details.");
      return;
    }
    try {
      await createCustomerOrder({
        data: {
          shippingName: form.name.trim(),
          shippingAddress: form.address.trim(),
          shippingPhone: form.phone.trim(),
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            customerName: user?.name ?? form.name.trim(),
            shippingName: form.name.trim(),
            shippingAddress: form.address.trim(),
            shippingPhone: form.phone.trim(),
            productName: item.productName,
            shirtColor: item.color,
            shirtColorName: item.colorName,
            customText: item.summary,
            customTextColor: "#0A0A0A",
            customTextFont: "Inter",
            customTextSize: 40,
            customImage: item.frontPreview ?? item.backPreview,
            totalPrice: item.unitPrice * item.quantity,
            size: item.size,
            targetGroup: item.targetGroup,
            designState: item.designState ?? null,
          })),
        },
      });
      await clearCart();
      toast.success(
        "Order review completed. Continue to the payment handoff when it is connected.",
      );
      navigate({ to: "/dashboard", search: { tab: "orders" } });
    } catch (error) {
      console.error("Failed to create order", error);
      toast.error("Unable to place the order. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-brand-black dark:bg-[#0b0b0d] dark:text-white">
      <header className="border-b border-black/10 bg-white px-5 py-5 dark:border-white/10 dark:bg-[#121214]">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" /> Cart
          </Link>
          <Link to="/" className="font-display text-2xl font-black uppercase">
            CustomON
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-orange">
          Final review
        </p>
        <h1 className="mt-2 font-display text-4xl font-black uppercase">Order review</h1>
        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm dark:bg-white/5">
            <h2 className="text-xl font-black uppercase">Delivery information</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Full name"
                className="rounded-xl border border-black/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-brand-orange dark:border-white/15"
              />
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="Phone number"
                className="rounded-xl border border-black/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-brand-orange dark:border-white/15"
              />
            </div>
            <textarea
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Delivery address"
              rows={4}
              className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-brand-orange dark:border-white/15"
            />
            <h2 className="pt-3 text-xl font-black uppercase">Products</h2>
            {items.length === 0 ? (
              <p className="text-sm opacity-60">No items are currently in your cart.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b border-black/10 py-3 text-sm dark:border-white/10"
                >
                  <div>
                    <p className="font-black uppercase">{item.productName}</p>
                    <p className="mt-1 opacity-60">
                      {item.colorName} · Size {item.size} · Qty {item.quantity}
                    </p>
                    <p className="mt-1 text-xs opacity-50">{item.summary}</p>
                  </div>
                  <strong>₹{(item.unitPrice * item.quantity).toFixed(2)}</strong>
                </div>
              ))
            )}
          </section>
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm dark:bg-white/5">
            <div className="flex items-center gap-2 text-brand-orange">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-wider">Ready for handoff</span>
            </div>
            <h2 className="mt-4 text-2xl font-black uppercase">Summary</h2>
            <div className="mt-6 flex justify-between border-b border-black/10 pb-5 text-lg font-black dark:border-white/10">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <p className="mt-4 text-xs leading-5 opacity-60">
              Payment is intentionally not included here. This step records the order details and
              hands the flow to the separately managed payment integration.
            </p>
            <button
              type="button"
              onClick={submit}
              className="mt-6 w-full rounded-xl bg-brand-orange px-5 py-4 text-xs font-black uppercase tracking-wider text-white"
            >
              Continue to payment handoff
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
