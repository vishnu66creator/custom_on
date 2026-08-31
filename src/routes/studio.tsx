import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Circle,
  Copy,
  Heart,
  Image as ImageIcon,
  Italic,
  Layers,
  MousePointer2,
  Redo2,
  RotateCw,
  Save,
  Shapes,
  ShoppingCart,
  Square,
  Trash2,
  Triangle,
  Type as TypeIcon,
  Underline,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { ALL_APPAREL_COLORS, PRODUCTS, STANDARD_APPAREL_SIZES, type Product } from "@/lib/products";
import {
  GarmentImage,
  contrastInk,
  fitScaleFor,
  type GarmentSide,
  type TargetGroup,
} from "@/lib/garments";
import {
  addToCart,
  cartCount,
  clearCart,
  getCart,
  removeFromCart,
  setCartQuantity,
  type CartItem,
} from "@/lib/cart-store";
import { placeOrder } from "@/lib/orders-store";
import { saveDesignToWishlist } from "@/lib/wishlist-store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/studio")({
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    productId?: string | undefined;
    color?: string | undefined;
    colorName?: string | undefined;
    text?: string | undefined;
    font?: string | undefined;
    textColor?: string | undefined;
    fontSize?: string | undefined;
    graphic?: string | undefined;
  } => {
    const str = (v: unknown) => (typeof v === "string" && v.length > 0 ? v : undefined);
    const out: Record<string, string> = {};
    for (const key of [
      "productId",
      "color",
      "colorName",
      "text",
      "font",
      "textColor",
      "fontSize",
      "graphic",
    ]) {
      const value = str(search[key]);
      if (value) out[key] = value;
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "Design Studio — Custom On Custom Apparel Builder" },
      {
        name: "description",
        content:
          "Design custom T-shirts, polos and hoodies live: pick a blank, choose a garment colour, add text and artwork, and preview the front and back before you order.",
      },
      { property: "og:title", content: "Design Studio — Custom On" },
      {
        property: "og:description",
        content: "Live custom apparel design canvas with front and back garment preview.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const COLOR_NAMES: Record<string, string> = {
  "#0A0A0A": "Black",
  "#FFFFFF": "White",
  "#1F2A44": "Navy",
  "#9CA3AF": "Heather Gray",
  "#374151": "Charcoal",
  "#FF5F1F": "Brand Orange",
  "#F5EFE0": "Cream",
  "#7F1D1D": "Maroon",
  "#2D4A3E": "Forest Green",
  "#1D4ED8": "Royal Blue",
  "#38BDF8": "Sky Blue",
  "#EAB308": "Mustard",
  "#DC2626": "Red",
  "#EC4899": "Pink",
  "#8B5CF6": "Purple",
};

const FONTS = [
  { label: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Bebas Neue", value: "'Bebas Neue', sans-serif" },
  { label: "Syne", value: "'Syne', sans-serif" },
  { label: "Orbitron", value: "'Orbitron', sans-serif" },
  { label: "Russo One", value: "'Russo One', sans-serif" },
  { label: "Righteous", value: "'Righteous', display" },
  { label: "Bungee", value: "'Bungee', display" },
  { label: "Monoton", value: "'Monoton', display" },
  { label: "Abril Fatface", value: "'Abril Fatface', display" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Cinzel", value: "'Cinzel', serif" },
  { label: "Old English", value: "'UnifrakturMaguntia', serif" },
  { label: "Pirata One", value: "'Pirata One', display" },
  { label: "Great Vibes", value: "'Great Vibes', cursive" },
  { label: "Dancing Script", value: "'Dancing Script', cursive" },
  { label: "Pacifico", value: "'Pacifico', cursive" },
  { label: "Satisfy", value: "'Satisfy', cursive" },
  { label: "Sacramento", value: "'Sacramento', cursive" },
  { label: "Allura", value: "'Allura', cursive" },
  { label: "Alex Brush", value: "'Alex Brush', cursive" },
  { label: "Kaushan Script", value: "'Kaushan Script', cursive" },
  { label: "Caveat", value: "'Caveat', cursive" },
  { label: "Permanent Marker", value: "'Permanent Marker', cursive" },
  { label: "Press Start 2P", value: "'Press Start 2P', monospace" },
];

const INK_COLORS = [
  "#FFFFFF",
  "#0A0A0A",
  "#FF5F1F",
  "#DC2626",
  "#EAB308",
  "#22C55E",
  "#1D4ED8",
  "#38BDF8",
  "#EC4899",
  "#8B5CF6",
];

const SIZE_CHESTS: Record<string, string> = {
  S: 'Chest 38" · Length 26"',
  M: 'Chest 40" · Length 27"',
  L: 'Chest 42" · Length 28"',
};

const FRONT_PRINT_FEE = 10;
const BACK_PRINT_FEE = 8;

/* ------------------------------------------------------------------ */
/* Layer model                                                         */
/* ------------------------------------------------------------------ */

type ShapeKind = "square" | "circle" | "triangle";

type BaseLayer = {
  id: string;
  side: GarmentSide;
  /** Centre position as a percentage of the print area. */
  x: number;
  y: number;
  /** Width as a percentage of the print area width. */
  width: number;
  rotation: number;
  opacity: number;
};

type TextLayer = BaseLayer & {
  type: "text";
  text: string;
  font: string;
  color: string;
  /** Font size expressed in px at a reference print-area height of 400px. */
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: "left" | "center" | "right";
  letterSpacing: number;
};

type ImageLayer = BaseLayer & {
  type: "image";
  src: string;
  name: string;
};

type ShapeLayer = BaseLayer & {
  type: "shape";
  kind: ShapeKind;
  color: string;
};

type Layer = TextLayer | ImageLayer | ShapeLayer;

type Tool = "select" | "text" | "image" | "shapes";

const REFERENCE_HEIGHT = 400;
const uid = () => `L-${Date.now().toString(36)}-${Math.floor(Math.random() * 10000).toString(36)}`;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function StudioPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const products = PRODUCTS;
  const [productId, setProductId] = useState<string>(
    () => products.find((p) => p.id === search.productId)?.id ?? products[0]!.id,
  );
  const product: Product = products.find((p) => p.id === productId) ?? products[0]!;

  const [color, setColor] = useState<string>(() =>
    search.color && ALL_APPAREL_COLORS.includes(search.color) ? search.color : "#FFFFFF",
  );
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("Men");
  const [size, setSize] = useState<string>("M");
  const [side, setSide] = useState<GarmentSide>("front");
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState<Tool>("select");
  const [quantity, setQuantity] = useState(1);

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [past, setPast] = useState<Layer[][]>([]);
  const [future, setFuture] = useState<Layer[][]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);

  const printRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const hydratedRef = useRef(false);

  const colorName = COLOR_NAMES[color] ?? color;
  const ink = contrastInk(color);
  const fit = fitScaleFor(targetGroup);

  const sideLayers = useMemo(() => layers.filter((l) => l.side === side), [layers, side]);
  const selected = useMemo(
    () => layers.find((l) => l.id === selectedId && l.side === side) ?? null,
    [layers, selectedId, side],
  );

  /* ---------------- cart sync ---------------- */
  useEffect(() => {
    let active = true;
    getCart()
      .then((items) => {
        if (active) setCart(items);
      })
      .catch((error) => console.error("Failed to load cart", error));
    return () => {
      active = false;
    };
  }, []);

  /* ---------------- deep link hydration ---------------- */
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (!search.text) return;
    const parsedSize = Number(search.fontSize);
    setLayers([
      {
        id: uid(),
        type: "text",
        side: "front",
        x: 50,
        y: 42,
        width: 84,
        rotation: 0,
        opacity: 1,
        text: search.text,
        font: search.font ?? FONTS[0]!.value,
        color: search.textColor ?? "#0A0A0A",
        fontSize: Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : 40,
        bold: true,
        italic: false,
        underline: false,
        align: "center",
        letterSpacing: 0,
      },
    ]);
  }, [search.text, search.font, search.textColor, search.fontSize]);

  /* ---------------- history ---------------- */
  const commit = useCallback((updater: (current: Layer[]) => Layer[]) => {
    setLayers((current) => {
      const next = updater(current);
      if (next === current) return current;
      setPast((p) => [...p.slice(-49), current]);
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1]!;
      setLayers((current) => {
        setFuture((f) => [current, ...f].slice(0, 50));
        return previous;
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0]!;
      setLayers((current) => {
        setPast((p) => [...p, current]);
        return next;
      });
      return f.slice(1);
    });
  }, []);

  const updateSelected = useCallback(
    (patch: Partial<TextLayer> & Partial<ImageLayer> & Partial<ShapeLayer>) => {
      if (!selectedId) return;
      commit((current) =>
        current.map((l) => (l.id === selectedId ? ({ ...l, ...patch } as Layer) : l)),
      );
    },
    [commit, selectedId],
  );

  const removeLayer = useCallback(
    (id: string) => {
      commit((current) => current.filter((l) => l.id !== id));
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    [commit],
  );

  const duplicateLayer = useCallback(
    (id: string) => {
      commit((current) => {
        const source = current.find((l) => l.id === id);
        if (!source) return current;
        const copy = {
          ...source,
          id: uid(),
          x: clamp(source.x + 6, 0, 100),
          y: clamp(source.y + 6, 0, 100),
        };
        return [...current, copy as Layer];
      });
    },
    [commit],
  );

  /* ---------------- adders ---------------- */
  const addText = useCallback(() => {
    const layer: TextLayer = {
      id: uid(),
      type: "text",
      side,
      x: 50,
      y: 40,
      width: 86,
      rotation: 0,
      opacity: 1,
      text: "YOUR TEXT",
      font: FONTS[0]!.value,
      color: ink,
      fontSize: 44,
      bold: true,
      italic: false,
      underline: false,
      align: "center",
      letterSpacing: 0,
    };
    commit((current) => [...current, layer]);
    setSelectedId(layer.id);
    setTool("text");
  }, [commit, ink, side]);

  const addShape = useCallback(
    (kind: ShapeKind) => {
      const layer: ShapeLayer = {
        id: uid(),
        type: "shape",
        side,
        x: 50,
        y: 50,
        width: 40,
        rotation: 0,
        opacity: 1,
        kind,
        color: "#FF5F1F",
      };
      commit((current) => [...current, layer]);
      setSelectedId(layer.id);
    },
    [commit, side],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a PNG, JPG or SVG image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image is larger than 5 MB. Please upload a smaller file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const src = typeof reader.result === "string" ? reader.result : null;
        if (!src) {
          toast.error("That file could not be read.");
          return;
        }
        const layer: ImageLayer = {
          id: uid(),
          type: "image",
          side,
          x: 50,
          y: 45,
          width: 60,
          rotation: 0,
          opacity: 1,
          src,
          name: file.name,
        };
        commit((current) => [...current, layer]);
        setSelectedId(layer.id);
        toast.success(`${file.name} added to the ${side} print area.`);
      };
      reader.onerror = () => toast.error("That file could not be read.");
      reader.readAsDataURL(file);
    },
    [commit, side],
  );

  /* ---------------- drag / resize / rotate ---------------- */
  const interaction = useRef<null | {
    mode: "move" | "resize" | "rotate";
    id: string;
    startX: number;
    startY: number;
    origin: Layer;
    rect: DOMRect;
  }>(null);

  const beginInteraction = (
    event: ReactPointerEvent,
    mode: "move" | "resize" | "rotate",
    layer: Layer,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const rect = printRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSelectedId(layer.id);
    setPast((p) => [...p.slice(-49), layers]);
    setFuture([]);
    interaction.current = {
      mode,
      id: layer.id,
      startX: event.clientX,
      startY: event.clientY,
      origin: layer,
      rect,
    };
    (event.target as Element).setPointerCapture?.(event.pointerId);
  };

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const state = interaction.current;
      if (!state) return;
      const { rect, origin, mode } = state;
      const dx = event.clientX - state.startX;
      const dy = event.clientY - state.startY;

      setLayers((current) =>
        current.map((l) => {
          if (l.id !== state.id) return l;
          if (mode === "move") {
            return {
              ...l,
              x: clamp(origin.x + (dx / rect.width) * 100, 0, 100),
              y: clamp(origin.y + (dy / rect.height) * 100, 0, 100),
            };
          }
          if (mode === "resize") {
            const scale = 1 + (dx / rect.width) * 2.2;
            const width = clamp(origin.width * scale, 6, 200);
            if (origin.type === "text") {
              return {
                ...(l as TextLayer),
                width,
                fontSize: clamp((origin as TextLayer).fontSize * (width / origin.width), 8, 220),
              };
            }
            return { ...l, width };
          }
          const cx = rect.left + (origin.x / 100) * rect.width;
          const cy = rect.top + (origin.y / 100) * rect.height;
          const angle = (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI + 90;
          return { ...l, rotation: Math.round(angle) };
        }),
      );
    };
    const onUp = () => {
      interaction.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  /* ---------------- keyboard ---------------- */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (!selectedId) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeLayer(selectedId);
        return;
      }
      const step = event.shiftKey ? 5 : 1;
      const nudge: Record<string, [number, number]> = {
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
      };
      const delta = nudge[event.key];
      if (delta) {
        event.preventDefault();
        commit((current) =>
          current.map((l) =>
            l.id === selectedId
              ? { ...l, x: clamp(l.x + delta[0], 0, 100), y: clamp(l.y + delta[1], 0, 100) }
              : l,
          ),
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit, redo, removeLayer, selectedId, undo]);

  /* ---------------- pricing ---------------- */
  const hasFront = layers.some((l) => l.side === "front");
  const hasBack = layers.some((l) => l.side === "back");
  const customization = (hasFront ? FRONT_PRINT_FEE : 0) + (hasBack ? BACK_PRINT_FEE : 0);
  const unitPrice = product.price + customization;
  const total = unitPrice * quantity;

  /* ---------------- actions ---------------- */
  const designSummary = () => {
    const bits: string[] = [];
    const texts = layers.filter((l): l is TextLayer => l.type === "text");
    if (texts.length > 0) bits.push(texts.map((t) => `"${t.text}"`).join(", "));
    const images = layers.filter((l) => l.type === "image").length;
    if (images > 0) bits.push(`${images} graphic${images > 1 ? "s" : ""}`);
    const shapes = layers.filter((l) => l.type === "shape").length;
    if (shapes > 0) bits.push(`${shapes} shape${shapes > 1 ? "s" : ""}`);
    return bits.length > 0 ? bits.join(" · ") : "Blank garment";
  };

  const firstText = layers.find((l): l is TextLayer => l.type === "text");
  const firstImage = layers.find((l): l is ImageLayer => l.type === "image");

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in before adding items to your cart.");
      navigate({ to: "/login" });
      return;
    }
    await addToCart({
      productId: product.id,
      productName: product.name,
      color,
      colorName,
      size,
      targetGroup,
      quantity,
      unitPrice,
      frontPreview: layers.some((l) => l.side === "front" && l.type === "image")
        ? (layers.find((l) => l.side === "front" && l.type === "image") as ImageLayer).src
        : null,
      backPreview: layers.some((l) => l.side === "back" && l.type === "image")
        ? (layers.find((l) => l.side === "back" && l.type === "image") as ImageLayer).src
        : null,
      summary: designSummary(),
    });
    toast.success(`${product.name} (${colorName}, ${size}) added to cart.`);
    navigate({ to: "/cart" });
  };

  const handleSaveDesign = async () => {
    if (!user) {
      toast.error("Please sign in before saving a design.");
      navigate({ to: "/login" });
      return;
    }
    await saveDesignToWishlist(
      {
        productId: product.id,
        productName: product.name,
        shirtColor: color,
        shirtColorName: colorName,
        customText: firstText?.text ?? "",
        customTextColor: firstText?.color ?? ink,
        customTextFont: firstText?.font ?? FONTS[0]!.value,
        customTextSize: Math.round(firstText?.fontSize ?? 40),
        customImage: firstImage?.src ?? null,
        price: unitPrice,
      },
      user?.username,
    );
    toast.success("Design saved to your account.");
  };

  const [checkout, setCheckout] = useState({ name: "", address: "", phone: "" });

  const handlePlaceOrder = async () => {
    const items = await getCart();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!checkout.name.trim() || !checkout.address.trim() || !checkout.phone.trim()) {
      toast.error("Please add a shipping name, address and phone number.");
      return;
    }
    for (const item of items) {
      placeOrder({
        customerName: user?.name ?? user?.username ?? checkout.name.trim(),
        shippingName: checkout.name.trim(),
        shippingAddress: checkout.address.trim(),
        shippingPhone: checkout.phone.trim(),
        productName: item.productName,
        shirtColor: item.color,
        shirtColorName: item.colorName,
        customText: item.summary,
        customTextColor: firstText?.color ?? "#0A0A0A",
        customTextFont: firstText?.font ?? FONTS[0]!.value,
        customTextSize: Math.round(firstText?.fontSize ?? 40),
        customImage: item.frontPreview ?? item.backPreview,
        totalPrice: item.unitPrice * item.quantity,
        size: item.size,
        targetGroup: item.targetGroup,
      });
    }
    await clearCart();
    toast.success("Order placed. Track it from your dashboard.");
    navigate({ to: "/dashboard", search: { tab: "orders" } });
  };

  /* ---------------- render ---------------- */
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-zinc-100">
      <StudioHeader
        cartQty={cartCount(cart)}
        onOpenCart={() => navigate({ to: "/cart" })}
        onSave={handleSaveDesign}
      />

      <div className="mx-auto grid max-w-[1600px] gap-4 p-3 lg:grid-cols-[260px_minmax(0,1fr)_320px] lg:p-5">
        {/* 1. Product chooser */}
        <Panel number={1} title="Choose product">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">
            {products.map((p) => {
              const active = p.id === product.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProductId(p.id)}
                  className={`flex w-52 shrink-0 items-center gap-3 rounded-xl border p-2 text-left transition lg:w-full ${
                    active
                      ? "border-[#FF5F1F] bg-[#FF5F1F]/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25"
                  }`}
                >
                  <span className="grid h-14 w-12 shrink-0 place-items-center rounded-lg bg-white/5">
                    <GarmentImage
                      product={p}
                      side="front"
                      size={size}
                      color="#e9e9ea"
                      className="h-12 w-11"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold leading-tight">
                      {p.name}
                    </span>
                    <span className="text-xs font-bold text-[#FF5F1F]">${p.price}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>

        {/* Canvas */}
        <section className="order-first flex flex-col rounded-2xl border border-white/10 bg-[#131316] lg:order-none">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 p-3 sm:flex sm:justify-between">
            <div className="inline-flex rounded-lg bg-white/5 p-1">
              {(["front", "back"] as GarmentSide[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    side === s ? "bg-[#FF5F1F] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="hidden sm:inline">Zoom</span>
              <button
                type="button"
                onClick={() => setZoom((z) => clamp(z - 10, 60, 180))}
                className="h-7 w-7 rounded-md border border-white/10 hover:border-white/30"
              >
                −
              </button>
              <span className="w-12 text-center font-semibold text-zinc-200">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => clamp(z + 10, 60, 180))}
                className="h-7 w-7 rounded-md border border-white/10 hover:border-white/30"
              >
                +
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
            {/* Tool rail */}
            <div className="absolute left-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-white/10 bg-[#1b1b1f]/95 p-1.5 backdrop-blur">
              <ToolButton
                icon={MousePointer2}
                label="Select"
                active={tool === "select"}
                onClick={() => setTool("select")}
              />
              <ToolButton icon={TypeIcon} label="Text" active={tool === "text"} onClick={addText} />
              <ToolButton
                icon={Upload}
                label="Upload"
                active={tool === "image"}
                onClick={() => fileRef.current?.click()}
              />
              <ToolButton
                icon={Shapes}
                label="Shapes"
                active={tool === "shapes"}
                onClick={() => setTool(tool === "shapes" ? "select" : "shapes")}
              />
              {tool === "shapes" && (
                <div className="flex flex-col gap-1 border-t border-white/10 pt-1">
                  <ToolButton icon={Square} label="Square" onClick={() => addShape("square")} />
                  <ToolButton icon={Circle} label="Circle" onClick={() => addShape("circle")} />
                  <ToolButton
                    icon={Triangle}
                    label="Triangle"
                    onClick={() => addShape("triangle")}
                  />
                </div>
              )}
              <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-1">
                <ToolButton icon={Undo2} label="Undo" onClick={undo} disabled={past.length === 0} />
                <ToolButton
                  icon={Redo2}
                  label="Redo"
                  onClick={redo}
                  disabled={future.length === 0}
                />
              </div>
            </div>

            <div
              className="relative"
              style={{
                width: "100%",
                maxWidth: 460,
                transform: `scale(${fit.scaleX * (zoom / 100)}, ${fit.scaleY * (zoom / 100)})`,
                transformOrigin: "center center",
              }}
              onPointerDown={() => setSelectedId(null)}
            >
              <div className="relative aspect-[4/5] w-full">
                <GarmentImage
                  product={product}
                  side={side}
                  size={size}
                  color={color}
                  className="absolute inset-0 h-full w-full"
                />

                <div
                  ref={printRef}
                  className="absolute inset-0 overflow-visible rounded-[4px] outline-1 outline-dashed outline-white/10"
                  aria-label="Full garment customization canvas"
                >
                  {sideLayers.map((layer) => (
                    <LayerView
                      key={layer.id}
                      layer={layer}
                      selected={layer.id === selectedId}
                      printHeight={
                        printRef.current?.getBoundingClientRect().height ?? REFERENCE_HEIGHT
                      }
                      onPointerDown={(e) => beginInteraction(e, "move", layer)}
                      onResize={(e) => beginInteraction(e, "resize", layer)}
                      onRotate={(e) => beginInteraction(e, "rotate", layer)}
                      onDelete={() => removeLayer(layer.id)}
                      onDuplicate={() => duplicateLayer(layer.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 p-3 text-xs">
            <span className="mr-2 text-zinc-500">
              {selected ? "Selected layer" : "Select a layer to edit"}
            </span>
            <CanvasAction
              icon={Copy}
              label="Duplicate"
              disabled={!selected}
              onClick={() => selected && duplicateLayer(selected.id)}
            />
            <CanvasAction
              icon={RotateCw}
              label="Reset angle"
              disabled={!selected}
              onClick={() => updateSelected({ rotation: 0 })}
            />
            <CanvasAction
              icon={Layers}
              label="Bring to front"
              disabled={!selected}
              onClick={() =>
                selected &&
                commit((current) => [...current.filter((l) => l.id !== selected.id), selected])
              }
            />
            <CanvasAction
              icon={Trash2}
              label="Delete"
              danger
              disabled={!selected}
              onClick={() => selected && removeLayer(selected.id)}
            />
          </div>
        </section>

        {/* Right column */}
        <div className="space-y-4">
          <Panel number={2} title="Garment colour">
            <div className="grid grid-cols-5 gap-2.5">
              {ALL_APPAREL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={COLOR_NAMES[c] ?? c}
                  aria-label={COLOR_NAMES[c] ?? c}
                  onClick={() => setColor(c)}
                  className={`aspect-square rounded-full border-2 transition ${
                    color === c
                      ? "border-[#FF5F1F] ring-2 ring-[#FF5F1F]/30"
                      : "border-white/15 hover:border-white/40"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-400">{colorName}</p>
          </Panel>

          <Panel number={3} title="Target group & size">
            <div className="grid grid-cols-3 rounded-lg bg-white/5 p-1">
              <div className="flex-1 rounded-lg bg-[#FF5F1F] px-3 py-2 text-center text-xs font-bold text-white">
                Men
              </div>
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Men sizing
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {STANDARD_APPAREL_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`rounded-lg border px-2 py-2 text-center transition ${
                    size === s
                      ? "border-[#FF5F1F] bg-[#FF5F1F] text-white"
                      : "border-white/10 bg-white/[0.03] hover:border-white/30"
                  }`}
                >
                  <span className="block text-sm font-bold">{s}</span>
                  <span className="block text-[10px] opacity-70">{SIZE_CHESTS[s] ?? ""}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel number={4} title="Side">
            <div className="grid grid-cols-2 gap-2">
              {(["front", "back"] as GarmentSide[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={`rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition ${
                    side === s
                      ? "bg-[#FF5F1F] text-white"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">
              {layers.filter((l) => l.side === "front").length} front ·{" "}
              {layers.filter((l) => l.side === "back").length} back element(s)
            </p>
          </Panel>

          <Panel number={7} title="Price summary">
            <Row label="Base price" value={`$${product.price.toFixed(2)}`} />
            <Row label={`Colour — ${colorName}`} value="$0.00" />
            <Row
              label="Front print"
              value={hasFront ? `$${FRONT_PRINT_FEE.toFixed(2)}` : "$0.00"}
            />
            <Row label="Back print" value={hasBack ? `$${BACK_PRINT_FEE.toFixed(2)}` : "$0.00"} />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Qty</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => clamp(q - 1, 1, 999))}
                  className="h-7 w-7 rounded-md border border-white/10 hover:border-white/30"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => clamp(q + 1, 1, 999))}
                  className="h-7 w-7 rounded-md border border-white/10 hover:border-white/30"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-sm font-bold uppercase tracking-widest">Total</span>
              <span className="text-xl font-extrabold text-[#FF5F1F]">${total.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF5F1F] py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#ff7a45]"
            >
              <ShoppingCart className="h-4 w-4" /> Add to cart
            </button>
            <button
              type="button"
              onClick={handleSaveDesign}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-300 transition hover:border-white/40"
            >
              <Heart className="h-3.5 w-3.5" /> Save design
            </button>
          </Panel>
        </div>

        {/* Bottom row: text + graphics */}
        <div className="lg:col-span-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Panel number={5} title="Text & properties">
            <TextPanel
              layers={layers.filter((l): l is TextLayer => l.type === "text")}
              selectedId={selectedId}
              onSelect={(l) => {
                setSide(l.side);
                setSelectedId(l.id);
              }}
              onAdd={addText}
              onDelete={removeLayer}
              onChange={(id, patch) =>
                commit((current) =>
                  current.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
                )
              }
            />
          </Panel>

          <Panel number={6} title="Uploaded graphics & shapes">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {layers
                .filter(
                  (l): l is ImageLayer | ShapeLayer => l.type === "image" || l.type === "shape",
                )
                .map((l) => (
                  <div
                    key={l.id}
                    className={`group relative rounded-xl border p-2 ${
                      l.id === selectedId ? "border-[#FF5F1F]" : "border-white/10"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSide(l.side);
                        setSelectedId(l.id);
                      }}
                      className="grid h-20 w-full place-items-center overflow-hidden rounded-lg bg-white/5"
                    >
                      {l.type === "image" ? (
                        <img
                          src={l.src}
                          alt={l.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <ShapeGlyph kind={l.kind} color={l.color} />
                      )}
                    </button>
                    <div className="mt-1.5 flex items-center justify-between gap-1">
                      <span className="truncate text-[10px] uppercase tracking-wider text-zinc-400">
                        {l.side} · {l.type === "image" ? l.name : l.kind}
                      </span>
                      <button
                        type="button"
                        aria-label="Remove"
                        onClick={() => removeLayer(l.id)}
                        className="text-zinc-500 transition hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid h-[118px] place-items-center rounded-xl border-2 border-dashed border-white/15 text-center text-xs text-zinc-400 transition hover:border-[#FF5F1F] hover:text-white"
              >
                <span>
                  <ImageIcon className="mx-auto mb-1 h-5 w-5" />
                  Upload image
                  <span className="mt-0.5 block text-[10px] text-zinc-500">
                    PNG, JPG, SVG · max 5 MB
                  </span>
                </span>
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StudioHeader({
  cartQty,
  onOpenCart,
  onSave,
}: {
  cartQty: number;
  onOpenCart: () => void;
  onSave: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 bg-[#0b0b0d]/95 px-4 py-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <Link to="/" className="shrink-0 text-lg font-extrabold tracking-tight">
          Custom<span className="text-[#FF5F1F]">ON</span>
        </Link>
        <span className="hidden text-zinc-600 sm:inline">/</span>
        <h1 className="truncate text-sm font-semibold text-zinc-300 sm:text-base">Design Studio</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="hidden items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-white/40 sm:flex"
        >
          <Save className="h-4 w-4" /> Save design
        </button>
        <Link
          to="/dashboard"
          search={{ tab: "orders" }}
          className="hidden items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-white/40 sm:flex"
        >
          <Layers className="h-4 w-4" /> My designs
        </Link>
        <button
          type="button"
          onClick={onOpenCart}
          className="relative rounded-lg border border-white/15 p-2 transition hover:border-white/40"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-4 w-4" />
          {cartQty > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#FF5F1F] text-[10px] font-bold">
              {cartQty}
            </span>
          )}
        </button>
        <Link
          to="/"
          className="rounded-lg p-2 text-zinc-400 transition hover:text-white"
          aria-label="Exit studio"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

function Panel({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#131316] p-4">
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">
        <span className="text-[#FF5F1F]">{number}.</span> {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="truncate text-zinc-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: typeof TypeIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`grid h-12 w-12 place-items-center rounded-lg text-[9px] font-semibold uppercase tracking-wide transition ${
        active ? "bg-[#FF5F1F] text-white" : "text-zinc-400 hover:bg-white/10 hover:text-white"
      } ${disabled ? "cursor-not-allowed opacity-35" : ""}`}
    >
      <span className="flex flex-col items-center gap-0.5">
        <Icon className="h-4 w-4" />
        {label}
      </span>
    </button>
  );
}

function CanvasAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: typeof TypeIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-semibold transition ${
        danger ? "text-red-400 hover:border-red-400/60" : "text-zinc-300 hover:border-white/35"
      } ${disabled ? "cursor-not-allowed opacity-35" : ""}`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function ShapeGlyph({ kind, color }: { kind: ShapeKind; color: string }) {
  if (kind === "circle")
    return <span className="h-10 w-10 rounded-full" style={{ backgroundColor: color }} />;
  if (kind === "square")
    return <span className="h-10 w-10 rounded-sm" style={{ backgroundColor: color }} />;
  return (
    <span
      className="h-10 w-10"
      style={{ backgroundColor: color, clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
    />
  );
}

function LayerView({
  layer,
  selected,
  printHeight,
  onPointerDown,
  onResize,
  onRotate,
  onDelete,
  onDuplicate,
}: {
  layer: Layer;
  selected: boolean;
  printHeight: number;
  onPointerDown: (e: ReactPointerEvent) => void;
  onResize: (e: ReactPointerEvent) => void;
  onRotate: (e: ReactPointerEvent) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const wrapperStyle: CSSProperties = {
    left: `${layer.x}%`,
    top: `${layer.y}%`,
    width: `${layer.width}%`,
    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
    opacity: layer.opacity,
  };

  const scale = printHeight > 0 ? printHeight / REFERENCE_HEIGHT : 1;

  return (
    <div
      className={`absolute touch-none select-none ${selected ? "outline-1 outline-dashed outline-[#FF5F1F]" : ""}`}
      style={wrapperStyle}
      onPointerDown={onPointerDown}
    >
      {layer.type === "text" && (
        <div
          style={{
            fontFamily: layer.font,
            color: layer.color,
            fontSize: `${layer.fontSize * scale}px`,
            fontWeight: layer.bold ? 800 : 500,
            fontStyle: layer.italic ? "italic" : "normal",
            textDecoration: layer.underline ? "underline" : "none",
            textAlign: layer.align,
            letterSpacing: `${layer.letterSpacing}px`,
            lineHeight: 1.1,
            wordBreak: "break-word",
          }}
        >
          {layer.text}
        </div>
      )}

      {layer.type === "image" && (
        <img src={layer.src} alt={layer.name} draggable={false} className="w-full object-contain" />
      )}

      {layer.type === "shape" && (
        <div
          className="w-full"
          style={{
            aspectRatio: "1 / 1",
            backgroundColor: layer.color,
            borderRadius: layer.kind === "circle" ? "9999px" : layer.kind === "square" ? "4px" : 0,
            clipPath: layer.kind === "triangle" ? "polygon(50% 0%, 100% 100%, 0% 100%)" : undefined,
          }}
        />
      )}

      {selected && (
        <>
          <button
            type="button"
            aria-label="Resize"
            onPointerDown={onResize}
            className="absolute -bottom-2.5 -right-2.5 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-white bg-[#FF5F1F]"
          />
          <button
            type="button"
            aria-label="Rotate"
            onPointerDown={onRotate}
            className="absolute -top-7 left-1/2 h-5 w-5 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-sky-500"
          />
          <div className="absolute -top-7 right-0 flex gap-1">
            <button
              type="button"
              aria-label="Duplicate layer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onDuplicate}
              className="grid h-5 w-5 place-items-center rounded-full bg-white/90 text-black"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              type="button"
              aria-label="Delete layer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onDelete}
              className="grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function TextPanel({
  layers,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onChange,
}: {
  layers: TextLayer[];
  selectedId: string | null;
  onSelect: (layer: TextLayer) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<TextLayer>) => void;
}) {
  const active = layers.find((l) => l.id === selectedId) ?? layers[0] ?? null;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
      <div className="space-y-2">
        {layers.map((l) => (
          <div
            key={l.id}
            className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border px-3 py-2 ${
              l.id === active?.id ? "border-[#FF5F1F] bg-[#FF5F1F]/10" : "border-white/10"
            }`}
          >
            <button type="button" onClick={() => onSelect(l)} className="min-w-0 text-left">
              <span className="block truncate text-xs font-semibold">{l.text || "(empty)"}</span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">{l.side}</span>
            </button>
            <button
              type="button"
              aria-label="Delete text"
              onClick={() => onDelete(l.id)}
              className="shrink-0 text-zinc-500 transition hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-lg border border-dashed border-white/20 py-2 text-xs font-semibold text-zinc-300 transition hover:border-[#FF5F1F] hover:text-white"
        >
          + Add text layer
        </button>
      </div>

      {active ? (
        <div className="space-y-3">
          <textarea
            value={active.text}
            onChange={(e) => onChange(active.id, { text: e.target.value })}
            rows={2}
            placeholder="Type your text"
            className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-sm outline-none focus:border-[#FF5F1F]"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={active.font}
              onChange={(e) => onChange(active.id, { font: e.target.value })}
              className="min-w-[150px] flex-1 rounded-lg border border-white/10 bg-[#1b1b1f] px-2 py-2 text-sm outline-none focus:border-[#FF5F1F]"
            >
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={String(Math.round(active.fontSize))}
              onChange={(e) => onChange(active.id, { fontSize: Number(e.target.value) })}
              className="w-24 rounded-lg border border-white/10 bg-[#1b1b1f] px-2 py-2 text-sm outline-none focus:border-[#FF5F1F]"
            >
              {Array.from(
                new Set([
                  ...[16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 88, 104],
                  Math.round(active.fontSize),
                ]),
              )
                .sort((a, b) => a - b)
                .map((s) => (
                  <option key={s} value={s}>
                    {s} px
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-lg border border-white/10">
              <Toggle
                active={active.bold}
                onClick={() => onChange(active.id, { bold: !active.bold })}
                label="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                active={active.italic}
                onClick={() => onChange(active.id, { italic: !active.italic })}
                label="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                active={active.underline}
                onClick={() => onChange(active.id, { underline: !active.underline })}
                label="Underline"
              >
                <Underline className="h-3.5 w-3.5" />
              </Toggle>
            </div>
            <div className="inline-flex overflow-hidden rounded-lg border border-white/10">
              <Toggle
                active={active.align === "left"}
                onClick={() => onChange(active.id, { align: "left" })}
                label="Align left"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                active={active.align === "center"}
                onClick={() => onChange(active.id, { align: "center" })}
                label="Align centre"
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                active={active.align === "right"}
                onClick={() => onChange(active.id, { align: "right" })}
                label="Align right"
              >
                <AlignRight className="h-3.5 w-3.5" />
              </Toggle>
            </div>
            <div className="flex items-center gap-1.5">
              {INK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Text colour ${c}`}
                  onClick={() => onChange(active.id, { color: c })}
                  className={`h-6 w-6 rounded-full border-2 ${
                    active.color.toLowerCase() === c.toLowerCase()
                      ? "border-[#FF5F1F]"
                      : "border-white/20"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <SliderRow
            label="Letter spacing"
            value={active.letterSpacing}
            min={-4}
            max={24}
            step={0.5}
            onChange={(v) => onChange(active.id, { letterSpacing: v })}
          />
          <SliderRow
            label="Rotation"
            value={active.rotation}
            min={-180}
            max={180}
            step={1}
            onChange={(v) => onChange(active.id, { rotation: v })}
          />
          <SliderRow
            label="Opacity"
            value={Math.round(active.opacity * 100)}
            min={10}
            max={100}
            step={1}
            onChange={(v) => onChange(active.id, { opacity: v / 100 })}
          />
        </div>
      ) : (
        <p className="self-center text-sm text-zinc-500">
          Add a text layer to edit fonts, colours, spacing and alignment.
        </p>
      )}
    </div>
  );
}

function Toggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`px-3 py-2 transition ${active ? "bg-[#FF5F1F] text-white" : "text-zinc-400 hover:bg-white/10"}`}
    >
      {children}
    </button>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[11px] uppercase tracking-widest text-zinc-400">
        {label}
        <span className="font-semibold text-zinc-200">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-[#FF5F1F]"
      />
    </label>
  );
}

function CartDrawer({
  items,
  checkout,
  onCheckoutChange,
  onClose,
  onRemove,
  onQuantity,
  onPlaceOrder,
}: {
  items: CartItem[];
  checkout: { name: string; address: string; phone: string };
  onCheckoutChange: (value: { name: string; address: string; phone: string }) => void;
  onClose: () => void;
  onRemove: (id: string) => void;
  onQuantity: (id: string, quantity: number) => void;
  onPlaceOrder: () => void;
}) {
  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#131316]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 p-4">
          <h2 className="truncate text-sm font-bold uppercase tracking-widest">Your cart</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 && <p className="text-sm text-zinc-500">Your cart is empty.</p>}
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 p-3">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <span className="grid h-16 w-14 shrink-0 place-items-center rounded-lg bg-white/5">
                  <GarmentImage
                    product={
                      PRODUCTS.find((candidate) => candidate.id === item.productId) ?? PRODUCTS[0]!
                    }
                    side="front"
                    size={item.size}
                    color={item.color}
                    className="h-14 w-12"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.productName}</p>
                  <p className="text-[11px] text-zinc-400">
                    {item.colorName} · {item.targetGroup} · Size {item.size}
                  </p>
                  <p className="truncate text-[11px] text-zinc-500">{item.summary}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onQuantity(item.id, item.quantity - 1)}
                      className="h-6 w-6 rounded border border-white/10"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 rounded border border-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-[#FF5F1F]">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </p>
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => onRemove(item.id)}
                    className="mt-1 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-white/10 p-4">
          <input
            value={checkout.name}
            onChange={(e) => onCheckoutChange({ ...checkout, name: e.target.value })}
            placeholder="Shipping name"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[#FF5F1F]"
          />
          <input
            value={checkout.address}
            onChange={(e) => onCheckoutChange({ ...checkout, address: e.target.value })}
            placeholder="Shipping address"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[#FF5F1F]"
          />
          <input
            value={checkout.phone}
            onChange={(e) => onCheckoutChange({ ...checkout, phone: e.target.value })}
            placeholder="Phone number"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[#FF5F1F]"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Total</span>
            <span className="text-lg font-extrabold text-[#FF5F1F]">${total.toFixed(2)}</span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={onPlaceOrder}
            className="w-full rounded-lg bg-[#FF5F1F] py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#ff7a45] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Place order
          </button>
        </div>
      </aside>
    </div>
  );
}
