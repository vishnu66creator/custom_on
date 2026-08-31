import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";
import { getOrders, updateOrderStatus, type Order, type OrderStatus } from "@/lib/orders-store";
import { saveCustomDesign } from "@/lib/designs-store";
import { getProducts } from "@/lib/products-store";
import { PRODUCTS, type Category, type Product } from "@/lib/products";
import {
  ClipboardList,
  Palette,
  Shirt,
  Upload,
  CheckCircle2,
  ShieldAlert,
  Heart,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  getWishlistProducts,
  getWishlistDesigns,
  removeDesignFromWishlist,
  toggleProductWishlist,
  type SavedDesign,
} from "@/lib/wishlist-store";

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>): { tab?: "orders" | "blanks" } => {
    return {
      tab: (search["tab"] as "orders" | "blanks") || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Owner Dashboard — Custom On" },
      {
        name: "description",
        content: "Manage customer orders, add catalog blanks, and list reference designs.",
      },
    ],
  }),
  component: DashboardPage,
});

type Tab = "orders" | "blanks";

function DashboardPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const activeTab = search.tab || "orders";

  // Enforce authentication once session loading completes
  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return null;
  }

  // If customer, render the customer portal order history dashboard
  if (user.role === "customer") {
    return <CustomerDashboard user={user} />;
  }

  // Render original Owner Dashboard for shop owners
  return (
    <PageShell>
      <section className="bg-brand-black px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">
              Administration Center
            </span>
            <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight md:text-5xl">
              Owner Dashboard
            </h1>
            <p className="mt-1 text-xs text-white/50">
              Logged in as{" "}
              <span className="font-bold text-white">{user.name ?? user.username}</span>
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 rounded-xl bg-white/5 p-1">
            <TabButton
              active={activeTab === "orders"}
              onClick={() => navigate({ to: "/dashboard", search: { tab: "orders" } })}
              icon={<ClipboardList className="h-4 w-4" />}
              label="Orders"
            />
            <TabButton
              active={activeTab === "blanks"}
              onClick={() => navigate({ to: "/dashboard", search: { tab: "blanks" } })}
              icon={<Shirt className="h-4 w-4" />}
              label="Catalog Blanks"
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-12 bg-brand-gray/30 min-h-[60vh]">
        <div className="mx-auto max-w-7xl">
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "blanks" && <BlanksTab />}
        </div>
      </section>
    </PageShell>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
        active ? "bg-brand-orange text-white" : "text-white/60 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ------------------ ORDERS TAB ------------------ */

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    getOrders("all")
      .then(setOrders)
      .catch((error) => console.error("Failed to load orders", error));
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders(await getOrders("all"));
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const downloadGraphicAsPng = (dataUrl: string, orderId: string) => {
    if (!dataUrl) return;

    // If it's already a PNG data URL, we can download it directly
    if (dataUrl.startsWith("data:image/png")) {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `print-artwork-${orderId}.png`;
      link.click();
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 800;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `print-artwork-${orderId}.png`;
          link.click();
        } catch (e) {
          console.error("Canvas export failed", e);
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `print-artwork-${orderId}.png`;
          link.click();
        }
      }
    };
    img.src = dataUrl;
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-brand-black">
        Manage Orders ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-black/15 bg-white p-12 text-center text-brand-black/50">
          No customer orders found.
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 ${
                expandedOrderId === order.id
                  ? "border-brand-orange shadow-md scale-[1.01]"
                  : "border-brand-black/5 hover:border-brand-black/20"
              }`}
            >
              {/* Header / Clickable Card Body */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="flex flex-col lg:flex-row cursor-pointer"
              >
                {/* Shirt Mockup Design Preview */}
                <div
                  className="flex items-center justify-center p-6 lg:w-64 shrink-0"
                  style={{ background: "#F3F4F6" }}
                >
                  <div className="relative aspect-square w-32 rounded-xl bg-white shadow-md p-3 flex items-center justify-center">
                    <div
                      className="h-full w-full rounded-lg relative flex flex-col items-center justify-center"
                      style={{ background: order.shirtColor }}
                    >
                      {/* SVG graphic overlay */}
                      {order.customImage && (
                        <img
                          src={order.customImage}
                          alt="Applied graphic"
                          className="w-12 h-12 object-contain opacity-90"
                        />
                      )}
                      {/* Custom Text Overlay */}
                      {order.customText && (
                        <span
                          className="mt-1 text-[7px] font-bold text-center leading-none px-1 truncate max-w-full"
                          style={{
                            color: order.customTextColor,
                            fontFamily: order.customTextFont,
                          }}
                        >
                          {order.customText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Summary Info */}
                <div className="flex-1 p-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-base font-bold text-brand-black">
                        #{order.id}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="grid gap-x-6 gap-y-1 text-xs text-brand-black/60 sm:grid-cols-2">
                      <p>
                        <span className="font-bold text-brand-black">Customer:</span>{" "}
                        {order.customerName}
                      </p>
                      <p>
                        <span className="font-bold text-brand-black">Date:</span>{" "}
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-bold text-brand-black">Apparel:</span>{" "}
                        {order.productName} ({order.shirtColorName})
                      </p>
                      <p>
                        <span className="font-bold text-brand-black">Total Price:</span> $
                        {order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-orange hover:underline shrink-0">
                      {expandedOrderId === order.id ? "Hide Details" : "View Details"}
                    </span>

                    {/* Status select (with stopPropagation to prevent toggling expansion) */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex flex-col gap-1.5 shrink-0 w-40"
                    >
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className="w-full rounded-lg border border-brand-black/15 bg-white px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-black outline-none focus:border-brand-orange"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Expanded Details Section */}
              {expandedOrderId === order.id && (
                <div className="border-t border-brand-black/5 bg-brand-gray/10 p-6 md:p-8 animate-fade-in space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Shipping Address */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-black/40">
                        Shipping details
                      </h4>
                      <div className="rounded-2xl border border-brand-black/5 bg-white p-4 text-xs space-y-1">
                        <p className="font-bold text-brand-black">{order.shippingName}</p>
                        <p className="text-brand-black/70">{order.shippingAddress}</p>
                        <p className="font-bold text-brand-black mt-2">
                          Tel: {order.shippingPhone}
                        </p>
                      </div>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-black/40">
                        Design specifications
                      </h4>
                      <div className="rounded-2xl border border-brand-black/5 bg-white p-4 text-xs space-y-2">
                        <div className="grid grid-cols-2 gap-y-1">
                          <span className="text-brand-black/55 font-bold">Apparel base:</span>
                          <span className="text-brand-black/80">{order.productName}</span>
                          <span className="text-brand-black/55 font-bold">Color:</span>
                          <span className="text-brand-black/80">
                            {order.shirtColorName} ({order.shirtColor})
                          </span>
                          <span className="text-brand-black/55 font-bold">Custom text:</span>
                          <span className="text-brand-black/80">
                            {order.customText !== "YOUR TEXT" && order.customText
                              ? order.customText
                              : "None"}
                          </span>
                          {order.customText && (
                            <>
                              <span className="text-brand-black/55 font-bold">Font:</span>
                              <span className="text-brand-black/80">{order.customTextFont}</span>
                              <span className="text-brand-black/55 font-bold">Text Color:</span>
                              <span className="text-brand-black/80">{order.customTextColor}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Print Graphic Download Area */}
                  {order.customImage ? (
                    <div className="rounded-2xl border border-brand-orange/10 bg-brand-orange/5 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="size-16 rounded-xl bg-white border border-brand-black/10 flex items-center justify-center p-2 shrink-0">
                          <img
                            src={order.customImage}
                            alt="Print graphic preview"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-extrabold uppercase tracking-wide text-brand-black">
                            Custom Print Artwork
                          </h4>
                          <p className="text-[10px] text-brand-black/50 uppercase mt-0.5">
                            High-resolution PNG file uploaded by customer
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadGraphicAsPng(order.customImage!, order.id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-black px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-brand-orange transition shadow-sm"
                      >
                        <Upload className="h-3.5 w-3.5 rotate-180" /> Download Print Artwork (PNG)
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-brand-black/10 p-5 text-center text-xs text-brand-black/40">
                      No custom photo/graphic uploaded for this order (text-only design).
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------ DESIGNS TAB ------------------ */

function DesignsTab() {
  const [designName, setDesignName] = useState("");
  const [designSvg, setDesignSvg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSvgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/svg+xml" && !file.name.endsWith(".svg")) {
      setError("Please select a valid SVG file.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setDesignSvg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!designName.trim()) {
      setError("Please enter a design name.");
      return;
    }

    if (!designSvg) {
      setError("Please upload an SVG file.");
      return;
    }

    await saveCustomDesign(designName.trim(), designSvg);
    setSuccess(true);
    setDesignName("");
    setDesignSvg(null);
    if (fileRef.current) fileRef.current.value = "";

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-brand-black/5 bg-white p-8 shadow-sm">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-brand-black">
          Add Reference Design
        </h2>
        <p className="mt-2 text-xs text-brand-black/60 leading-relaxed uppercase tracking-wider">
          Upload custom SVG vector graphics. Customers can apply these designs directly to their
          apparel in the Design Studio.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</p>
          )}

          <label className="block space-y-2 text-sm font-semibold text-brand-black/70">
            <span>Design Name</span>
            <input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="e.g. Vintage California Rose"
              className="w-full rounded-xl border border-brand-black/15 px-4 py-3 text-sm outline-none focus:border-brand-orange"
            />
          </label>

          <div className="space-y-2">
            <span className="block text-sm font-semibold text-brand-black/70">
              Upload SVG Vector File
            </span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-brand-black/20 py-8 text-center transition hover:border-brand-orange hover:bg-brand-orange/5"
            >
              <Upload className="h-6 w-6 text-brand-black/40" />
              <div className="text-xs font-bold uppercase tracking-wider text-brand-black">
                {designSvg ? "Change SVG file" : "Select SVG File"}
              </div>
              <span className="text-[10px] text-brand-black/40">Only SVG formats supported</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleSvgChange}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-brand-orange px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-brand transition hover:bg-brand-black"
            >
              Save Reference Design
            </button>
            {success && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                <CheckCircle2 className="h-4 w-4" /> Design Saved!
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Live Preview Panel */}
      <div className="rounded-3xl border border-brand-black/5 bg-white p-8 shadow-sm">
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-brand-black/70">
          Upload Preview
        </h3>
        <div className="mt-4 aspect-square w-full rounded-2xl bg-brand-gray flex items-center justify-center p-8 border border-dashed border-brand-black/10">
          {designSvg ? (
            <img
              src={designSvg}
              alt="SVG Preview"
              className="h-full w-full object-contain max-h-[160px]"
            />
          ) : (
            <span className="text-center text-[10px] uppercase font-bold tracking-wider text-brand-black/40">
              No SVG Uploaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------ BLANKS TAB ------------------ */

function BlanksTab() {
  return (
    <div className="rounded-3xl border border-brand-black/5 bg-white p-8 shadow-sm">
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-brand-black">
        Catalog Blanks
      </h2>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed uppercase tracking-wider text-brand-black/60">
        The CustomON catalog is locked to the six approved Men&apos;s garments. Product media,
        garment colors, and sizes are maintained in the shared catalog source so the public
        storefront always shows only the final production set.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="rounded-2xl border border-brand-black/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-black">
              {product.name}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-brand-black/50">
              {product.category} · Black / White · S / M / L
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------ CUSTOMER DASHBOARD ------------------ */

function CustomerDashboard({ user }: { user: { username: string; role: string; name?: string } }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"orders" | "wishlist">("orders");
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistDesigns, setWishlistDesigns] = useState<SavedDesign[]>([]);
  const loadData = async () => {
    try {
      const [customerOrders, wishProdIds, savedDesigns] = await Promise.all([
        getOrders("customer"),
        getWishlistProducts(),
        getWishlistDesigns(),
      ]);
      setOrders(customerOrders);
      const catalog = getProducts();
      setWishlistProducts(catalog.filter((p: Product) => wishProdIds.includes(p.id)));
      setWishlistDesigns(savedDesigns);
    } catch (error) {
      console.error("Failed to load customer data", error);
    }
  };

  useEffect(() => {
    void loadData();
  }, [user.username, activeSubTab]);

  const handleRemoveProductWishlist = async (productId: string) => {
    await toggleProductWishlist(productId);
    await loadData();
  };

  const handleRemoveDesignWishlist = async (designId: string) => {
    await removeDesignFromWishlist(designId);
    await loadData();
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  return (
    <PageShell>
      <section className="bg-brand-black px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">
              Customer Portal
            </span>
            <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight md:text-5xl">
              Customer Center
            </h1>
            <p className="mt-1 text-xs text-white/50">
              Welcome back,{" "}
              <span className="font-bold text-white">{user.name ?? user.username}</span>
            </p>
          </div>

          {/* SubTab Navigation */}
          <div className="flex gap-2 rounded-xl bg-white/5 p-1">
            <button
              onClick={() => setActiveSubTab("orders")}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                activeSubTab === "orders"
                  ? "bg-brand-orange text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Order History ({orders.length})
            </button>
            <button
              onClick={() => setActiveSubTab("wishlist")}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                activeSubTab === "wishlist"
                  ? "bg-brand-orange text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Heart className="h-3.5 w-3.5 fill-current" /> My Wishlist
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 bg-brand-gray/30 min-h-[60vh]">
        <div className="mx-auto max-w-4xl space-y-6">
          {activeSubTab === "orders" ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-brand-black">
                  Order History
                </h2>
                <Link
                  to="/products"
                  className="text-xs font-bold uppercase tracking-wider text-brand-orange border-b border-brand-orange pb-0.5"
                >
                  Browse Catalog
                </Link>
              </div>

              {/* Suggestions from Saved Designs */}
              {wishlistDesigns.length > 0 && (
                <div className="rounded-3xl border border-brand-orange/15 bg-brand-orange/5 p-6 space-y-4 animate-fade-in">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-brand-orange">
                      Ready to Order?
                    </span>
                    <h3 className="font-display text-lg font-bold uppercase tracking-tight text-brand-black mt-1">
                      Suggesting Your Saved Designs
                    </h3>
                    <p className="text-xs text-brand-black/60">
                      You have saved custom configurations. Order them directly or customize them
                      further in the Design Studio:
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {wishlistDesigns.map((design) => (
                      <div
                        key={design.id}
                        className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-brand-black/5 shadow-sm transition hover:shadow-md"
                      >
                        {/* Shirt Mockup Design Preview */}
                        <div className="h-16 w-16 rounded-xl bg-neutral-50 p-2 border border-brand-black/5 flex items-center justify-center shrink-0">
                          <div
                            className="h-full w-full rounded-lg relative flex flex-col items-center justify-center"
                            style={{ background: design.shirtColor }}
                          >
                            {design.customImage && (
                              <img
                                src={design.customImage}
                                alt="applied graphic"
                                className="w-7 h-7 object-contain opacity-95"
                              />
                            )}
                            {design.customText && (
                              <span
                                className="mt-0.5 text-[5px] font-bold text-center leading-none px-0.5 truncate max-w-full"
                                style={{
                                  color: design.customTextColor,
                                  fontFamily: design.customTextFont,
                                }}
                              >
                                {design.customText}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-brand-black truncate uppercase">
                            {design.productName}
                          </h4>
                          <p className="text-[9px] text-brand-black/55 uppercase font-bold mt-0.5">
                            Color: {design.shirtColorName}
                          </p>
                          <span className="text-xs font-bold text-brand-orange">
                            ${design.price.toFixed(2)}
                          </span>
                        </div>

                        <Link
                          to="/studio"
                          search={{
                            productId: design.productId,
                            color: design.shirtColor,
                            colorName: design.shirtColorName,
                            text: design.customText,
                            font: design.customTextFont,
                            textColor: design.customTextColor,
                            fontSize: design.customTextSize.toString(),
                            graphic: design.customImage ? "applied" : undefined,
                          }}
                          className="rounded-lg bg-brand-black px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-brand-orange text-center shrink-0"
                        >
                          Order Now
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {orders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-brand-black/15 bg-white p-12 text-center animate-fade-in">
                  <p className="text-sm text-brand-black/50">
                    You haven't ordered any custom apparel yet.
                  </p>
                  <Link
                    to="/studio"
                    className="mt-5 inline-block bg-brand-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-brand-orange shadow-sm"
                  >
                    Create Your First Design
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col overflow-hidden rounded-3xl border border-brand-black/5 bg-white shadow-sm sm:flex-row animate-fade-in"
                    >
                      {/* Shirt Preview */}
                      <div
                        className="flex items-center justify-center p-6 sm:w-48 shrink-0"
                        style={{ background: "#F3F4F6" }}
                      >
                        <div className="relative aspect-square w-32 rounded-xl bg-white shadow-md p-3 flex items-center justify-center">
                          <div
                            className="h-full w-full rounded-lg relative flex flex-col items-center justify-center"
                            style={{ background: order.shirtColor }}
                          >
                            {order.customImage && (
                              <img
                                src={order.customImage}
                                alt="Applied graphic"
                                className="w-10 h-10 object-contain opacity-90"
                              />
                            )}
                            {order.customText && (
                              <span
                                className="mt-1 text-[6px] font-bold text-center leading-none px-1 truncate max-w-full"
                                style={{
                                  color: order.customTextColor,
                                  fontFamily: order.customTextFont,
                                }}
                              >
                                {order.customText}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="font-display text-base font-bold text-brand-black">
                              Order #{order.id}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusColor(
                                order.status,
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="grid gap-x-6 gap-y-1 text-xs text-brand-black/60 sm:grid-cols-2">
                            <p>
                              <span className="font-bold text-brand-black">Date:</span>{" "}
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                            <p>
                              <span className="font-bold text-brand-black">Garment:</span>{" "}
                              {order.productName} ({order.shirtColorName})
                            </p>
                            <p>
                              <span className="font-bold text-brand-black">Total Paid:</span> $
                              {order.totalPrice.toFixed(2)}
                            </p>
                            <p className="sm:col-span-2">
                              <span className="font-bold text-brand-black">Shipping to:</span>{" "}
                              {order.shippingName}, {order.shippingAddress}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-brand-black/5 pt-3">
                          <p className="text-[10px] text-brand-black/40 italic">
                            {order.status === "Pending" &&
                              "Your design has been received. Our printing team will review it shortly."}
                            {order.status === "Processing" &&
                              "We are currently setting up the printing press and prepping your blank apparel."}
                            {order.status === "Shipped" &&
                              "Your package has left the factory! It is on its way to your destination."}
                            {order.status === "Completed" &&
                              "Delivered! Thank you for choosing Custom On."}
                            {order.status === "Cancelled" &&
                              "This order was cancelled. Please reach out to customer support if you have questions."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-10 animate-fade-in">
              {/* Favorited Blanks */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-brand-black border-b border-brand-black/5 pb-2">
                  Favorited Apparel Blanks ({wishlistProducts.length})
                </h3>

                {wishlistProducts.length === 0 ? (
                  <p className="text-xs text-brand-black/40 italic bg-white p-6 rounded-2xl text-center">
                    No favorited blanks. Heart items in our catalog to save them here.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {wishlistProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-brand-black/5 shadow-sm"
                      >
                        <div className="h-16 w-16 overflow-hidden rounded-xl bg-brand-gray p-1 shrink-0 flex items-center justify-center">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-brand-orange uppercase">
                            {prod.category}
                          </span>
                          <h4 className="font-bold text-sm text-brand-black truncate uppercase mt-0.5">
                            {prod.name}
                          </h4>
                          <span className="text-xs font-bold text-brand-black/60">
                            ${prod.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            to="/studio"
                            search={{ productId: prod.id }}
                            className="rounded-lg bg-brand-black px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-brand-orange flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> Customize
                          </Link>
                          <button
                            onClick={() => handleRemoveProductWishlist(prod.id)}
                            className="p-2 rounded-lg text-brand-black/40 hover:text-red-500 hover:bg-red-50 animate-pulse"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Saved Custom Designs */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-brand-black border-b border-brand-black/5 pb-2">
                  Saved Customized Designs ({wishlistDesigns.length})
                </h3>

                {wishlistDesigns.length === 0 ? (
                  <p className="text-xs text-brand-black/40 italic bg-white p-6 rounded-2xl text-center">
                    No custom designs saved. Favorite designs in the Design Studio to save them
                    here.
                  </p>
                ) : (
                  <div className="grid gap-6">
                    {wishlistDesigns.map((design) => (
                      <div
                        key={design.id}
                        className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-3xl border border-brand-black/5 shadow-sm"
                      >
                        {/* Preview */}
                        <div className="h-28 w-28 rounded-2xl bg-neutral-50 p-2 border border-brand-black/5 flex items-center justify-center shrink-0">
                          <div
                            className="h-full w-full rounded-lg relative flex flex-col items-center justify-center"
                            style={{ background: design.shirtColor }}
                          >
                            {design.customImage && (
                              <img
                                src={design.customImage}
                                alt="applied graphic"
                                className="w-8 h-8 object-contain opacity-90"
                              />
                            )}
                            {design.customText && (
                              <span
                                className="mt-1 text-[5px] font-bold text-center leading-none px-1 truncate max-w-full"
                                style={{
                                  color: design.customTextColor,
                                  fontFamily: design.customTextFont,
                                }}
                              >
                                {design.customText}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h4 className="font-bold text-base text-brand-black uppercase">
                            {design.productName}
                          </h4>
                          <p className="text-[10px] text-brand-black/50 uppercase mt-1 font-bold">
                            Color: {design.shirtColorName} | Price: ${design.price.toFixed(2)}
                          </p>
                          <div className="mt-2 text-xs text-brand-black/60 truncate">
                            {design.customText && <span>Text: "{design.customText}"</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            to="/studio"
                            search={{
                              productId: design.productId,
                              color: design.shirtColor,
                              colorName: design.shirtColorName,
                              text: design.customText,
                              font: design.customTextFont,
                              textColor: design.customTextColor,
                              fontSize: design.customTextSize.toString(),
                              graphic: design.customImage ? "applied" : undefined,
                            }}
                            className="rounded-lg bg-brand-black px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-brand-orange flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> Load in Studio
                          </Link>
                          <button
                            onClick={() => handleRemoveDesignWishlist(design.id)}
                            className="p-2.5 rounded-lg text-brand-black/40 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
