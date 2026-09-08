import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";
import { getOrders, type Order, type OrderStatus } from "@/lib/orders-store";
import { PRODUCTS } from "@/lib/products";
import { GarmentImage } from "@/lib/garments";
import { ShoppingBag, ArrowRight, Loader2, PackageCheck, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — CustomON" },
      { name: "description", content: "View and track your previous custom apparel orders." },
    ],
  }),
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  const loadOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getOrders("customer");
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders", err);
      setError("Unable to load your orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadOrders();
    }
  }, [user?.username]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return {
          icon: Clock,
          className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "Processing":
        return {
          icon: PackageCheck,
          className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        };
      case "Shipped":
        return {
          icon: Truck,
          className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        };
      case "Completed":
        return {
          icon: CheckCircle2,
          className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "Cancelled":
        return {
          icon: XCircle,
          className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        };
      default:
        return {
          icon: Clock,
          className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
        };
    }
  };

  if (authLoading || (!user && isLoading)) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF5F1F]" />
          <p className="text-xs font-bold uppercase tracking-wider text-brand-black/60 dark:text-zinc-400">
            Loading your orders...
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
              <ShoppingBag className="h-3.5 w-3.5" /> Purchase History
            </span>
            <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-tight md:text-5xl">
              My Orders
            </h1>
            <p className="mt-1 text-xs text-white/60">
              View and track your previous custom apparel purchases ({orders.length})
            </p>
          </div>

          <Link
            to="/products"
            className="flex items-center gap-2 rounded-xl bg-[#FF5F1F] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#ff7a45]"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-12 bg-brand-gray/30 dark:bg-[#0b0b0d] min-h-[60vh]">
        <div className="mx-auto max-w-4xl space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-xs font-bold text-red-500">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#FF5F1F]" />
              <p className="text-xs font-bold text-brand-black/50 dark:text-zinc-500">
                Fetching your order history...
              </p>
            </div>
          ) : orders.length === 0 ? (
            /* Professional Empty State */
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-brand-black/15 dark:border-white/15 bg-white/80 dark:bg-[#141417]/80 p-12 text-center shadow-xs">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#FF5F1F]/10 text-[#FF5F1F]">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-black uppercase tracking-tight text-brand-black dark:text-white">
                You haven&apos;t placed any orders yet
              </h2>
              <p className="mt-2 max-w-md text-xs font-medium text-brand-black/60 dark:text-zinc-400">
                Start customizing your apparel in our Studio or browse our product collection to place your first custom order.
              </p>
              <Link
                to="/products"
                className="mt-6 flex items-center gap-2 rounded-xl bg-[#FF5F1F] px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white transition hover:bg-[#ff7a45]"
              >
                <span>Shop Catalog Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {orders.map((order) => {
                const product = PRODUCTS.find((p) => p.name === order.productName) ?? PRODUCTS[0]!;
                const statusBadge = getStatusBadge(order.status);
                const StatusIcon = statusBadge.icon;
                const orderNum = order.id.startsWith("ORD-")
                  ? order.id
                  : `ORD-${order.id.slice(-6).toUpperCase()}`;

                const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-3xl border border-brand-black/10 dark:border-white/10 bg-white dark:bg-[#141417] p-6 shadow-xs transition hover:border-brand-black/20 dark:hover:border-white/20"
                  >
                    {/* Header bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-black/5 dark:border-white/5 pb-4">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5F1F]">
                          {orderNum}
                        </span>
                        <p className="mt-0.5 text-xs font-semibold text-brand-black/50 dark:text-zinc-400">
                          Placed on {orderDate}
                        </p>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${statusBadge.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span>{order.status}</span>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="mt-4 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] items-center">
                      {/* Product Mockup */}
                      <div className="h-20 w-20 shrink-0 rounded-2xl bg-zinc-100 dark:bg-[#1c1c20] p-2 border border-brand-black/5 dark:border-white/5 flex items-center justify-center">
                        <GarmentImage
                          product={product}
                          side="front"
                          size={order.size || "M"}
                          color={order.shirtColor || "#FFFFFF"}
                          className="h-full w-full object-contain"
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 space-y-1">
                        <h3 className="font-display text-base font-black uppercase text-brand-black dark:text-white truncate">
                          {order.productName}
                        </h3>
                        <p className="text-xs font-semibold text-brand-black/60 dark:text-zinc-400">
                          Color: {order.shirtColorName || order.shirtColor} · Target: {order.targetGroup || "Men"} · Size: {order.size || "M"}
                        </p>
                        {order.customText && (
                          <p className="truncate text-xs font-medium text-[#FF5F1F]">
                            Design summary: {order.customText}
                          </p>
                        )}
                        <p className="text-[11px] text-brand-black/40 dark:text-zinc-500">
                          Ship to: {order.shippingName} ({order.shippingAddress})
                        </p>
                      </div>

                      {/* Total */}
                      <div className="shrink-0 sm:text-right border-t sm:border-t-0 border-brand-black/5 dark:border-white/5 pt-3 sm:pt-0">
                        <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-black/50 dark:text-zinc-500">
                          Total Amount
                        </span>
                        <span className="text-xl font-black text-[#FF5F1F]">
                          ${order.totalPrice.toFixed(2)}
                        </span>
                      </div>
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
