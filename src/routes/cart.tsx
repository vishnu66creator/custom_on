import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  cartTotal,
  getCart,
  removeFromCart,
  setCartQuantity,
  type CartItem,
} from "@/lib/cart-store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setItems(await getCart());
    } catch (error) {
      console.error("Failed to load cart", error);
      toast.error("Please sign in to view your cart.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    void refresh();
  }, [authLoading, navigate, refresh, user]);

  const changeQuantity = async (item: CartItem, delta: number) => {
    const next = Math.max(1, Math.min(999, item.quantity + delta));
    await setCartQuantity(item.id, next);
    await refresh();
  };

  const remove = async (item: CartItem) => {
    await removeFromCart(item.id);
    await refresh();
    toast.success(`${item.productName} removed from your cart.`);
  };

  const total = cartTotal(items);

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-brand-black dark:bg-[#0b0b0d] dark:text-white">
      <header className="border-b border-black/10 bg-white px-5 py-5 dark:border-white/10 dark:bg-[#121214]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="font-display text-2xl font-black uppercase tracking-tight">
            CustomON
          </Link>
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
            <Link to="/products" className="opacity-60 hover:opacity-100">
              Continue shopping
            </Link>
            {user && (
              <Link to="/profile" className="rounded-full bg-brand-orange px-4 py-2 text-white">
                {user.name ?? user.username}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-orange">
                Shopping bag
              </p>
              <h1 className="mt-1 font-display text-4xl font-black uppercase">Your cart</h1>
            </div>
            <span className="text-sm font-bold opacity-50">
              {items.length} item{items.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center text-sm opacity-60 dark:bg-white/5">
              Loading cart…
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-black/15 bg-white p-12 text-center dark:border-white/15 dark:bg-white/5">
              <ShoppingBag className="mx-auto h-10 w-10 opacity-30" />
              <h2 className="mt-4 text-xl font-black uppercase">Your cart is empty</h2>
              <p className="mt-2 text-sm opacity-60">
                Create a custom garment in the Design Studio and it will appear here.
              </p>
              <Link
                to="/products"
                className="mt-6 inline-flex rounded-xl bg-brand-orange px-5 py-3 text-xs font-black uppercase tracking-wider text-white"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-3xl bg-white p-4 shadow-sm dark:bg-white/5 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-[#eceae5] dark:bg-white/10">
                    {item.frontPreview ? (
                      <img
                        src={item.frontPreview}
                        alt={`${item.productName} custom preview`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs font-bold opacity-40">CustomON</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase">{item.productName}</h2>
                    <p className="mt-1 text-sm opacity-65">
                      {item.colorName} · Size {item.size} · {item.targetGroup}
                    </p>
                    <p className="mt-2 text-xs opacity-55">{item.summary}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-50">
                        Quantity
                      </span>
                      <div className="flex items-center rounded-xl border border-black/10 dark:border-white/15">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => changeQuantity(item, -1)}
                          className="p-2 hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => changeQuantity(item, 1)}
                          className="p-2 hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <p className="text-xl font-black">
                      ₹{(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(item)}
                      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm dark:bg-white/5 lg:sticky lg:top-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-orange">
            Price details
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase">Order summary</h2>
          <div className="mt-6 space-y-3 border-b border-black/10 pb-5 text-sm dark:border-white/10">
            <div className="flex justify-between">
              <span className="opacity-60">Product price</span>
              <strong>₹{total.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Customization</span>
              <strong>Included</strong>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Delivery</span>
              <strong>Calculated next</strong>
            </div>
          </div>
          <div className="mt-5 flex justify-between text-lg font-black">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => navigate({ to: "/order-review" })}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 py-4 text-xs font-black uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Proceed to order <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>
    </main>
  );
}
