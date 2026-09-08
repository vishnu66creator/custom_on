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
  Crosshair,
  Grid,
  Heart,
  Image as ImageIcon,
  Italic,
  Layers,
  Magnet,
  MousePointer2,
  Move,
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
import { FONTS, FONT_CATEGORIES, getFontLabel, type FontCategory } from "@/lib/fonts";
import {
  GarmentImage,
  contrastInk,
  fitScaleFor,
  getPrintArea,
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
import { SiteHeader } from "@/components/site-header";
import {
  saveWorkingDesign,
  getWorkingDesign,
  clearWorkingDesign,
  saveProductDraft,
  getProductDraft,
  getAllProductDrafts,
  clearProductDraft,
  type FullDesignState,
} from "@/lib/working-design-store";
import { getSavedDesignById } from "@/lib/db/app-service";

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
    designId?: string | undefined;
    cartItemId?: string | undefined;
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
      "designId",
      "cartItemId",
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

const GRADIENT_MIXTURES = [
  { name: "Sunset Glow", value: "linear-gradient(135deg, #FF5F1F 0%, #FFB03A 100%)" },
  { name: "Cyberpunk", value: "linear-gradient(135deg, #FF007F 0%, #7928CA 50%, #00DFD8 100%)" },
  { name: "Neon Aurora", value: "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)" },
  { name: "Tie-Dye Prism", value: "linear-gradient(135deg, #FF0055 0%, #7A00FF 50%, #00E5FF 100%)" },
  { name: "Cosmic Violet", value: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" },
  { name: "Emerald Forest", value: "linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)" },
  { name: "Oceanic Wave", value: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #06B6D4 100%)" },
  { name: "Crimson Blaze", value: "linear-gradient(135deg, #DC2626 0%, #9333EA 100%)" },
  { name: "Gold Luxury", value: "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #78350F 100%)" },
  { name: "Midnight Stealth", value: "linear-gradient(135deg, #1F2937 0%, #111827 100%)" },
  { name: "Cotton Candy", value: "linear-gradient(135deg, #F472B6 0%, #38BDF8 100%)" },
  { name: "Center Spotlight", value: "radial-gradient(circle at center, #FF5F1F 0%, #111827 100%)" },
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
  const [productDrafts, setProductDrafts] = useState<Record<string, FullDesignState>>(() => {
    return getAllProductDrafts();
  });

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
  const [previewFont, setPreviewFont] = useState<string | null>(null);
  const [previewFontSize, setPreviewFontSize] = useState<number | null>(null);
  const [past, setPast] = useState<Layer[][]>([]);
  const [future, setFuture] = useState<Layer[][]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [colorTab, setColorTab] = useState<"solid" | "gradients" | "custom">("solid");
  const [mixColor1, setMixColor1] = useState<string>("#FF5F1F");
  const [mixColor2, setMixColor2] = useState<string>("#8B5CF6");
  const [mixType, setMixType] = useState<"135deg" | "180deg" | "90deg" | "radial">("135deg");

  const [snappingEnabled, setSnappingEnabled] = useState(true);
  const snappingRef = useRef(snappingEnabled);
  useEffect(() => {
    snappingRef.current = snappingEnabled;
  }, [snappingEnabled]);

  const [activeGuides, setActiveGuides] = useState<ActiveGuidesState | null>(null);

  const printRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const hydratedRef = useRef(false);

  const gradientMatch = GRADIENT_MIXTURES.find((g) => g.value === color);
  const colorName = gradientMatch
    ? gradientMatch.name
    : color.includes("gradient")
      ? "Custom Colour Mixture"
      : COLOR_NAMES[color.toUpperCase()] ?? COLOR_NAMES[color] ?? color;
  const printArea = useMemo(() => getPrintArea(product.id, side), [product.id, side]);
  const ink = contrastInk(color);
  const fit = fitScaleFor(targetGroup);

  const sideLayers = useMemo(() => layers.filter((l) => l.side === side), [layers, side]);
  const selected = useMemo(
    () => layers.find((l) => l.id === selectedId && l.side === side) ?? null,
    [layers, selectedId, side],
  );

  /* ---------------- pricing ---------------- */
  const hasFront = layers.some((l) => l.side === "front");
  const hasBack = layers.some((l) => l.side === "back");
  const customization = (hasFront ? FRONT_PRINT_FEE : 0) + (hasBack ? BACK_PRINT_FEE : 0);
  const unitPrice = product.price + customization;
  const total = unitPrice * quantity;

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

  /* ---------------- working design auto-sync ---------------- */
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveWorkingDesign({
      version: 1,
      productId,
      color,
      colorName,
      size,
      targetGroup,
      side,
      layers,
      quantity,
      unitPrice,
    });
  }, [productId, color, colorName, size, targetGroup, side, layers, quantity, unitPrice]);

  /* ---------------- design restoration & hydration ---------------- */
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    async function hydrate() {
      // 1. Explicit saved design ID
      if (search.designId) {
        try {
          const saved = await getSavedDesignById({ data: { id: search.designId! } });
          if (saved) {
            const ds = saved.designState as FullDesignState | null;
            if (ds && Array.isArray(ds.layers)) {
              if (ds.productId) {
                setProductId(ds.productId);
                saveProductDraft(ds.productId, ds);
                setProductDrafts((prev) => ({ ...prev, [ds.productId]: ds }));
              }
              if (ds.color) setColor(ds.color);
              if (ds.size) setSize(ds.size);
              if (ds.targetGroup) setTargetGroup(ds.targetGroup);
              if (ds.side) setSide(ds.side);
              setLayers(ds.layers);
              toast.success(`Loaded saved design: "${saved.productName}"`);
              return;
            } else {
              if (saved.productId) setProductId(saved.productId);
              if (saved.shirtColor) setColor(saved.shirtColor);
              const restoredLayers: Layer[] = [];
              if (saved.customText) {
                restoredLayers.push({
                  id: uid(),
                  type: "text",
                  side: "front",
                  x: 50,
                  y: 42,
                  width: 84,
                  rotation: 0,
                  opacity: 1,
                  text: saved.customText,
                  font: saved.customTextFont || FONTS[0]!.value,
                  color: saved.customTextColor || "#0A0A0A",
                  fontSize: saved.customTextSize || 40,
                  bold: true,
                  italic: false,
                  underline: false,
                  align: "center",
                  letterSpacing: 0,
                });
              }
              if (saved.customImage) {
                restoredLayers.push({
                  id: uid(),
                  type: "image",
                  side: "front",
                  x: 50,
                  y: 50,
                  width: 60,
                  rotation: 0,
                  opacity: 1,
                  src: saved.customImage,
                  name: "Custom Graphic",
                });
              }
              setLayers(restoredLayers);
              toast.success(`Loaded saved design: "${saved.productName}"`);
              return;
            }
          }
        } catch (err) {
          console.error("Failed to load saved design", err);
          toast.error("Unable to load the requested saved design.");
        }
      }

      // 2. Explicit cart item ID
      if (search.cartItemId) {
        try {
          const cartItems = await getCart();
          const item = cartItems.find((c) => c.id === search.cartItemId);
          if (item) {
            const ds = item.designState as FullDesignState | null;
            if (ds && Array.isArray(ds.layers)) {
              if (ds.productId) {
                setProductId(ds.productId);
                saveProductDraft(ds.productId, ds);
                setProductDrafts((prev) => ({ ...prev, [ds.productId]: ds }));
              }
              if (ds.color) setColor(ds.color);
              if (ds.size) setSize(ds.size);
              if (ds.targetGroup) setTargetGroup(ds.targetGroup);
              if (ds.side) setSide(ds.side);
              setLayers(ds.layers);
              toast.info(`Editing cart item: "${item.productName}"`);
              return;
            }
          }
        } catch (err) {
          console.error("Failed to load cart item for editing", err);
        }
      }

      // 3. Legacy deep link search params
      if (search.text) {
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
        return;
      }

      // 4. Saved working design from browser storage (Navigation persistence)
      const working = getWorkingDesign();
      if (working && Array.isArray(working.layers) && working.layers.length > 0) {
        if (working.productId) setProductId(working.productId);
        if (working.color) setColor(working.color);
        if (working.size) setSize(working.size);
        if (working.targetGroup) setTargetGroup(working.targetGroup);
        if (working.side) setSide(working.side);
        setLayers(working.layers);
      }
    }

    void hydrate();
  }, [
    search.designId,
    search.cartItemId,
    search.text,
    search.font,
    search.textColor,
    search.fontSize,
  ]);

  /* ---------------- product switching (draft isolation) ---------------- */
  const handleSelectProduct = (targetId: string) => {
    if (targetId === productId) return;

    // 1. Save current product's active draft before switching
    const currentDraft: FullDesignState = {
      version: 1,
      productId,
      color,
      colorName,
      size,
      targetGroup,
      side,
      layers,
      quantity,
      unitPrice,
    };

    saveProductDraft(productId, currentDraft);
    const updatedDrafts = {
      ...productDrafts,
      [productId]: currentDraft,
    };
    setProductDrafts(updatedDrafts);

    // 2. Set new active product ID
    setProductId(targetId);

    // 3. Load target product's draft (from state or session storage)
    const targetDraft = updatedDrafts[targetId] ?? getProductDraft(targetId);
    if (targetDraft && Array.isArray(targetDraft.layers)) {
      setLayers(targetDraft.layers);
      if (targetDraft.color) setColor(targetDraft.color);
      if (targetDraft.size) setSize(targetDraft.size);
      if (targetDraft.targetGroup) setTargetGroup(targetDraft.targetGroup);
      if (targetDraft.side) setSide(targetDraft.side);
    } else {
      // Clean default state for new product!
      setLayers([]);
    }

    // 4. Reset selection, preview states & undo/redo history for clean context
    setSelectedId(null);
    setPreviewFont(null);
    setPreviewFontSize(null);
    setPast([]);
    setFuture([]);
  };

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
    mode: "move" | "resize" | "resize-tl" | "resize-tr" | "resize-bl" | "resize-br" | "rotate";
    id: string;
    startX: number;
    startY: number;
    origin: Layer;
    rect: DOMRect;
  }>(null);

  const beginInteraction = (
    event: ReactPointerEvent,
    mode: "move" | "resize" | "resize-tl" | "resize-tr" | "resize-bl" | "resize-br" | "rotate",
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
    const checkGuides = (
      rawX: number,
      rawY: number,
      layerId: string,
      allLayers: Layer[],
      garmentSide: GarmentSide,
      snapEnabled: boolean,
    ) => {
      const SNAP_THRESHOLD = 2.2;

      // Alignment candidates for Full T-Shirt Canvas
      const vertCandidates: GuideLine[] = [
        { id: "v-center", orientation: "vertical", position: 50, label: "CENTER (X)", isCenter: true },
        { id: "v-left", orientation: "vertical", position: 0, label: "GARMENT LEFT" },
        { id: "v-right", orientation: "vertical", position: 100, label: "GARMENT RIGHT" },
      ];

      const horizCandidates: GuideLine[] = [
        { id: "h-center", orientation: "horizontal", position: 50, label: "CENTER (Y)", isCenter: true },
        { id: "h-chest", orientation: "horizontal", position: 32, label: "CHEST LINE" },
        { id: "h-top", orientation: "horizontal", position: 0, label: "GARMENT TOP" },
        { id: "h-bottom", orientation: "horizontal", position: 100, label: "GARMENT BOTTOM" },
      ];

      // Include other design elements on same side
      allLayers.forEach((other) => {
        if (other.id === layerId || other.side !== garmentSide) return;
        const labelName = other.type === "text" ? `"${other.text.slice(0, 10)}"` : other.type;
        vertCandidates.push({
          id: `v-${other.id}`,
          orientation: "vertical",
          position: other.x,
          label: `ALIGN ${labelName.toUpperCase()}`,
        });
        horizCandidates.push({
          id: `h-${other.id}`,
          orientation: "horizontal",
          position: other.y,
          label: `ALIGN ${labelName.toUpperCase()}`,
        });
      });

      let finalX = rawX;
      let finalY = rawY;
      let activeVert: GuideLine | null = null;
      let activeHoriz: GuideLine | null = null;

      let minVDiff = SNAP_THRESHOLD;
      for (const cand of vertCandidates) {
        const diff = Math.abs(rawX - cand.position);
        if (diff < minVDiff) {
          minVDiff = diff;
          activeVert = cand;
          if (snapEnabled) {
            finalX = cand.position;
          }
        }
      }

      let minHDiff = SNAP_THRESHOLD;
      for (const cand of horizCandidates) {
        const diff = Math.abs(rawY - cand.position);
        if (diff < minHDiff) {
          minHDiff = diff;
          activeHoriz = cand;
          if (snapEnabled) {
            finalY = cand.position;
          }
        }
      }

      const isCrosshair = Boolean(activeVert?.isCenter && activeHoriz?.isCenter);
      return { finalX, finalY, activeVert, activeHoriz, isCrosshair };
    };

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
            const rawX = clamp(origin.x + (dx / rect.width) * 100, 0, 100);
            const rawY = clamp(origin.y + (dy / rect.height) * 100, 0, 100);

            const result = checkGuides(rawX, rawY, l.id, current, side, snappingRef.current);
            setActiveGuides({
              vertical: result.activeVert,
              horizontal: result.activeHoriz,
              isCrosshair: result.isCrosshair,
            });

            return {
              ...l,
              x: result.finalX,
              y: result.finalY,
            };
          }

          if (mode === "resize" || mode.startsWith("resize-")) {
            const isLeft = mode === "resize-tl" || mode === "resize-bl";
            const factor = isLeft ? -dx : dx;
            const scale = 1 + (factor / rect.width) * 2.2;
            const width = clamp(origin.width * scale, 6, 200);

            const result = checkGuides(l.x, l.y, l.id, current, side, snappingRef.current);
            setActiveGuides({
              vertical: result.activeVert,
              horizontal: result.activeHoriz,
              isCrosshair: result.isCrosshair,
            });

            if (origin.type === "text") {
              return {
                ...(l as TextLayer),
                width,
                fontSize: clamp((origin as TextLayer).fontSize * (width / origin.width), 8, 220),
              };
            }
            return { ...l, width };
          }

          // Mode === "rotate"
          const cx = rect.left + (origin.x / 100) * rect.width;
          const cy = rect.top + (origin.y / 100) * rect.height;
          const angle = (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI + 90;
          let roundedAngle = Math.round(angle);

          // Angle snapping to 0, 45, 90, 135, 180, 225, 270, 315
          const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 360];
          for (const sa of SNAP_ANGLES) {
            if (Math.abs(roundedAngle - sa) <= 3.5) {
              if (snappingRef.current) {
                roundedAngle = (sa + 360) % 360;
              }
              break;
            }
          }

          const result = checkGuides(l.x, l.y, l.id, current, side, snappingRef.current);
          setActiveGuides({
            vertical: result.activeVert,
            horizontal: result.activeHoriz,
            isCrosshair: result.isCrosshair,
          });

          return { ...l, rotation: roundedAngle };
        }),
      );
    };

    const onUp = () => {
      interaction.current = null;
      setActiveGuides(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [side]);

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
    const fullState: FullDesignState = {
      version: 1,
      productId: product.id,
      color,
      colorName,
      size,
      targetGroup,
      side,
      layers,
      quantity,
      unitPrice,
    };
    try {
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
        designState: fullState,
      });
      saveWorkingDesign(fullState);
      toast.success(`${product.name} (${colorName}, ${size}) added to cart.`);
      navigate({ to: "/cart" });
    } catch (err) {
      console.error("Failed to add to cart", err);
      const msg = err instanceof Error ? err.message : "Unable to add design to cart.";
      toast.error(msg);
    }
  };

  const handleSaveDesign = async () => {
    if (!user) {
      toast.error("Please sign in before saving a design.");
      navigate({ to: "/login" });
      return;
    }
    const fullState: FullDesignState = {
      version: 1,
      productId: product.id,
      color,
      colorName,
      size,
      targetGroup,
      side,
      layers,
      quantity,
      unitPrice,
    };
    try {
      await saveDesignToWishlist(
        {
          productId: product.id,
          productName: product.name,
          shirtColor: color,
          shirtColorName: colorName,
          customText: firstText?.text ?? (layers.length ? "Custom Design" : ""),
          customTextColor: firstText?.color ?? ink,
          customTextFont: firstText?.font ?? FONTS[0]!.value,
          customTextSize: Math.round(firstText?.fontSize ?? 40),
          customImage: firstImage?.src ?? null,
          price: unitPrice,
          designState: fullState,
        },
        user?.username,
      );

      // RESET ACTIVE PREVIEW ONLY AFTER SUCCESSFUL SAVE
      setLayers([]);
      setSelectedId(null);
      setPreviewFont(null);
      setPreviewFontSize(null);
      setPast([]);
      setFuture([]);

      clearProductDraft(product.id);
      setProductDrafts((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });

      toast.success(`Design saved to your account. Studio preview reset to clean ${product.name}.`);
    } catch (err) {
      console.error("Failed to save design", err);
      const msg = err instanceof Error ? err.message : "Unable to save design. Please try again.";
      // DO NOT CLEAR ACTIVE DESIGN IF SAVE FAILS!
      toast.error(`Unable to save design. Your current design has not been cleared. (${msg})`);
    }
  };

  const handleClearDesign = () => {
    setLayers([]);
    setSelectedId(null);
    setPreviewFont(null);
    setPreviewFontSize(null);
    setPast([]);
    setFuture([]);
    clearProductDraft(product.id);
    setProductDrafts((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
    toast.info(`Design reset to clean ${product.name}.`);
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
    <div className="min-h-screen bg-brand-gray/40 dark:bg-[#0b0b0d] text-brand-black dark:text-zinc-100 transition-colors duration-300">
      <SiteHeader />
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
                  onClick={() => handleSelectProduct(p.id)}
                  className={`flex w-52 shrink-0 items-center gap-3 rounded-xl border p-2 text-left transition lg:w-full ${active
                    ? "border-[#FF5F1F] bg-[#FF5F1F]/10"
                    : "border-brand-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] hover:border-brand-black/25 dark:hover:border-white/25"
                    }`}
                >
                  <span className="grid h-14 w-12 shrink-0 place-items-center rounded-lg bg-brand-black/5 dark:bg-white/5">
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

        {/* Canvas & Text Section */}
        <div className="order-first space-y-4 lg:order-none">
          {/* Top Panel: Text & Font Properties */}
          <Panel number={2} title="Text & font properties">
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
              onPreviewFont={setPreviewFont}
              previewFont={previewFont}
              onPreviewFontSize={setPreviewFontSize}
              previewFontSize={previewFontSize}
            />
          </Panel>

          {/* Canvas */}
          <section className="flex flex-col rounded-2xl border border-brand-black/5 dark:border-white/10 bg-white dark:bg-[#131316] shadow-sm dark:shadow-none transition-colors">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-brand-black/5 dark:border-white/10 p-3 sm:flex sm:justify-between">
              <div className="inline-flex rounded-lg bg-brand-black/5 dark:bg-white/5 p-1">
                {(["front", "back"] as GarmentSide[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${side === s ? "bg-[#FF5F1F] text-white" : "text-brand-black/60 dark:text-zinc-400 hover:text-brand-black dark:hover:text-white"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-brand-black/60 dark:text-zinc-400">
                <button
                  type="button"
                  onClick={() => setSnappingEnabled((s) => !s)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-bold transition ${snappingEnabled
                    ? "border-[#FF5F1F] bg-[#FF5F1F]/15 text-[#FF5F1F] ring-1 ring-[#FF5F1F]/30"
                    : "border-brand-black/10 dark:border-white/10 text-brand-black/60 dark:text-zinc-400 hover:text-brand-black dark:hover:text-white"
                    }`}
                  title={snappingEnabled ? "Smart Alignment Snapping Active" : "Snapping Disabled"}
                >
                  <Magnet className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Snap: {snappingEnabled ? "ON" : "OFF"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <span className="hidden sm:inline">Zoom</span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => clamp(z - 10, 60, 180))}
                    className="h-7 w-7 rounded-md border border-brand-black/10 dark:border-white/10 hover:border-brand-black/30 dark:hover:border-white/30 text-brand-black dark:text-white"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-semibold text-brand-black dark:text-zinc-200">{zoom}%</span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => clamp(z + 10, 60, 180))}
                    className="h-7 w-7 rounded-md border border-brand-black/10 dark:border-white/10 hover:border-brand-black/30 dark:hover:border-white/30 text-brand-black dark:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>



            {/* Quick Shape Color Editor Bar */}
            {selected && selected.type === "shape" && (
              <div className="flex flex-wrap items-center gap-2.5 border-b border-brand-black/10 dark:border-white/10 bg-brand-orange/10 dark:bg-[#FF5F1F]/15 px-4 py-2.5 transition-all">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF5F1F] flex items-center gap-1.5 shrink-0">
                  <Shapes className="h-4 w-4" /> Shape Color:
                </span>
                <div className="flex items-center gap-1.5">
                  {INK_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Shape color ${c}`}
                      onClick={() => updateSelected({ color: c })}
                      className={`h-6 w-6 rounded-full border-2 transition ${selected.color.toLowerCase() === c.toLowerCase()
                        ? "border-[#FF5F1F] scale-110 ring-2 ring-[#FF5F1F]/40"
                        : "border-brand-black/20 dark:border-white/20 hover:scale-105"
                        }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 rounded-b-2xl bg-env-spotlight min-h-[500px]">
              {/* Tool rail */}
              <div className="absolute left-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-brand-black/10 dark:border-white/10 bg-white/95 dark:bg-[#1b1b1f]/95 p-1.5 backdrop-blur shadow-md dark:shadow-none">
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
                  <div className="flex flex-col gap-1 border-t border-brand-black/10 dark:border-white/10 pt-1">
                    <ToolButton icon={Square} label="Square" onClick={() => addShape("square")} />
                    <ToolButton icon={Circle} label="Circle" onClick={() => addShape("circle")} />
                    <ToolButton
                      icon={Triangle}
                      label="Triangle"
                      onClick={() => addShape("triangle")}
                    />
                  </div>
                )}
                <div className="mt-1 flex flex-col gap-1 border-t border-brand-black/10 dark:border-white/10 pt-1">
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
                key={`${product.id}-${side}`}
                className="relative z-10"
                style={{
                  width: "100%",
                  maxWidth: 460,
                  transform: `scale(${fit.scaleX * (zoom / 100)}, ${fit.scaleY * (zoom / 100)})`,
                  transformOrigin: "center center",
                }}
                onPointerDown={() => setSelectedId(null)}
              >
                <div className="relative aspect-[4/5] w-full">
                  {/* Ground Drop Shadow under Garment */}
                  <div
                    className="pointer-events-none absolute bottom-1 left-1/2 h-8 w-[68%] -translate-x-1/2 rounded-[100%] bg-black/65 blur-md"
                    style={{ transform: "translateX(-50%) scaleY(0.4)" }}
                  />

                  <GarmentImage
                    product={product}
                    side={side}
                    size={size}
                    color={color}
                    className="absolute inset-0 h-full w-full pointer-events-none z-0"
                  />

                  <div
                    ref={printRef}
                    className="absolute inset-0 z-20 overflow-visible rounded-lg outline-1 outline-dashed outline-white/10"
                    aria-label="Full garment customization canvas"
                  >
                    <SmartGuidesOverlay activeGuides={activeGuides} />
                    {sideLayers.map((layer) => {
                      const currentSideTextLayers = sideLayers.filter(
                        (l): l is TextLayer => l.type === "text",
                      );
                      const activeTextLayer =
                        currentSideTextLayers.find((l) => l.id === selectedId) ??
                        currentSideTextLayers[0];

                      const isPreviewTarget =
                        previewFont !== null &&
                        layer.type === "text" &&
                        activeTextLayer !== undefined &&
                        layer.id === activeTextLayer.id;

                      const isSizePreviewTarget =
                        previewFontSize !== null &&
                        layer.type === "text" &&
                        activeTextLayer !== undefined &&
                        layer.id === activeTextLayer.id;

                      const effectiveLayer = {
                        ...layer,
                        ...(isPreviewTarget ? { font: previewFont! } : {}),
                        ...(isSizePreviewTarget ? { fontSize: previewFontSize! } : {}),
                      } as Layer;

                      return (
                        <LayerView
                          key={layer.id}
                          layer={effectiveLayer}
                          selected={layer.id === selectedId}
                          printHeight={
                            printRef.current?.getBoundingClientRect().height ?? REFERENCE_HEIGHT
                          }
                          onPointerDown={(e) => beginInteraction(e, "move", layer)}
                          onResize={(e, mode) => beginInteraction(e, mode ?? "resize-br", layer)}
                          onRotate={(e) => beginInteraction(e, "rotate", layer)}
                          onDelete={() => removeLayer(layer.id)}
                          onDuplicate={() => duplicateLayer(layer.id)}
                          onUpdateText={(text) => updateSelected({ text })}
                        />
                      );
                    })}
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

            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-brand-black/5 dark:border-white/10 p-3 text-xs">
              <span className="mr-2 text-brand-black/50 dark:text-zinc-500">
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
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Panel number={3} title="Garment colour & mixture">
            {/* Color mode tabs */}
            <div className="mb-3 flex rounded-lg bg-brand-black/5 dark:bg-white/5 p-1 text-xs">
              <button
                type="button"
                onClick={() => setColorTab("solid")}
                className={`flex-1 rounded-md py-1.5 font-bold transition ${colorTab === "solid"
                  ? "bg-[#FF5F1F] text-white shadow-xs"
                  : "text-brand-black/60 dark:text-zinc-400 hover:text-brand-black dark:hover:text-white"
                  }`}
              >
                Solid
              </button>
              <button
                type="button"
                onClick={() => setColorTab("gradients")}
                className={`flex-1 rounded-md py-1.5 font-bold transition ${colorTab === "gradients"
                  ? "bg-[#FF5F1F] text-white shadow-xs"
                  : "text-brand-black/60 dark:text-zinc-400 hover:text-brand-black dark:hover:text-white"
                  }`}
              >
                Mixtures
              </button>
              <button
                type="button"
                onClick={() => setColorTab("custom")}
                className={`flex-1 rounded-md py-1.5 font-bold transition ${colorTab === "custom"
                  ? "bg-[#FF5F1F] text-white shadow-xs"
                  : "text-brand-black/60 dark:text-zinc-400 hover:text-brand-black dark:hover:text-white"
                  }`}
              >
                Mixer
              </button>
            </div>

            {/* TAB 1: SOLID PALETTE */}
            {colorTab === "solid" && (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2.5">
                  {ALL_APPAREL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={COLOR_NAMES[c] ?? c}
                      aria-label={COLOR_NAMES[c] ?? c}
                      onClick={() => setColor(c)}
                      className={`aspect-square rounded-full border-2 transition ${color === c
                        ? "border-[#FF5F1F] scale-110 ring-2 ring-[#FF5F1F]/30"
                        : "border-brand-black/15 dark:border-white/15 hover:scale-105"
                        }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                {/* Custom Solid Picker */}
                <div className="flex items-center gap-2 rounded-lg border border-brand-black/10 dark:border-white/10 p-1.5 bg-brand-black/[0.02] dark:bg-white/[0.02]">
                  <input
                    type="color"
                    value={color.startsWith("#") ? color : "#FF5F1F"}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent"
                    title="Pick custom solid shade"
                  />
                  <input
                    type="text"
                    value={color.startsWith("#") ? color : ""}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Custom #HEX"
                    className="flex-1 bg-transparent text-xs font-semibold uppercase outline-none text-brand-black dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: PRESET GRADIENT MIXTURES */}
            {colorTab === "gradients" && (
              <div className="grid grid-cols-3 gap-2">
                {GRADIENT_MIXTURES.map((g) => (
                  <button
                    key={g.name}
                    type="button"
                    title={g.name}
                    onClick={() => setColor(g.value)}
                    className={`group flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition ${color === g.value
                      ? "border-[#FF5F1F] bg-[#FF5F1F]/10 ring-2 ring-[#FF5F1F]/30"
                      : "border-brand-black/10 dark:border-white/10 hover:border-[#FF5F1F]/50"
                      }`}
                  >
                    <div
                      className="h-8 w-8 rounded-full border border-white/20 shadow-xs transition group-hover:scale-105"
                      style={{ background: g.value }}
                    />
                    <span className="truncate text-[10px] font-bold text-brand-black dark:text-zinc-300">
                      {g.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* TAB 3: DUAL COLOR MIXER */}
            {colorTab === "custom" && (
              <div className="space-y-3 rounded-xl border border-brand-black/10 dark:border-white/10 p-3 bg-brand-black/[0.02] dark:bg-white/[0.02]">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-black/60 dark:text-zinc-400">
                      Color 1
                    </label>
                    <div className="flex items-center gap-1.5 rounded-lg border border-brand-black/15 dark:border-white/15 p-1.5 bg-white dark:bg-[#1b1b1f]">
                      <input
                        type="color"
                        value={mixColor1}
                        onChange={(e) => setMixColor1(e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono font-bold uppercase text-brand-black dark:text-white truncate">
                        {mixColor1}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-black/60 dark:text-zinc-400">
                      Color 2
                    </label>
                    <div className="flex items-center gap-1.5 rounded-lg border border-brand-black/15 dark:border-white/15 p-1.5 bg-white dark:bg-[#1b1b1f]">
                      <input
                        type="color"
                        value={mixColor2}
                        onChange={(e) => setMixColor2(e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono font-bold uppercase text-brand-black dark:text-white truncate">
                        {mixColor2}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-black/60 dark:text-zinc-400">
                    Blend Direction
                  </label>
                  <select
                    value={mixType}
                    onChange={(e) => setMixType(e.target.value as any)}
                    className="w-full rounded-lg border border-brand-black/15 dark:border-white/15 bg-white dark:bg-[#1b1b1f] px-2.5 py-1.5 text-xs font-semibold text-brand-black dark:text-white outline-none focus:border-[#FF5F1F]"
                  >
                    <option value="135deg">Diagonal (135°)</option>
                    <option value="180deg">Vertical (Top to Bottom)</option>
                    <option value="90deg">Horizontal (Left to Right)</option>
                    <option value="radial">Center Glow (Radial)</option>
                  </select>
                </div>

                {/* Apply Custom Mixture */}
                {(() => {
                  const generatedMix =
                    mixType === "radial"
                      ? `radial-gradient(circle at center, ${mixColor1} 0%, ${mixColor2} 100%)`
                      : `linear-gradient(${mixType}, ${mixColor1} 0%, ${mixColor2} 100%)`;
                  return (
                    <button
                      type="button"
                      onClick={() => setColor(generatedMix)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF5F1F] py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#ff7a45] shadow-xs"
                    >
                      <div
                        className="h-4 w-4 rounded-full border border-white/40"
                        style={{ background: generatedMix }}
                      />
                      Apply Custom Mixture
                    </button>
                  );
                })()}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-brand-black/5 dark:border-white/10 pt-2 text-xs text-brand-black/60 dark:text-zinc-400">
              <span>Active color:</span>
              <span className="font-semibold text-brand-black dark:text-zinc-200 truncate max-w-[180px]">
                {colorName}
              </span>
            </div>
          </Panel>

          <Panel number={3} title="Target group & size">
            <div className="grid grid-cols-3 rounded-lg bg-brand-black/5 dark:bg-white/5 p-1">
              <div className="flex-1 rounded-lg bg-[#FF5F1F] px-3 py-2 text-center text-xs font-bold text-white">
                Men
              </div>
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-brand-black/50 dark:text-zinc-500">
              Men sizing
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {STANDARD_APPAREL_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`rounded-lg border px-2 py-2 text-center transition ${size === s
                    ? "border-[#FF5F1F] bg-[#FF5F1F] text-white"
                    : "border-brand-black/10 dark:border-white/10 bg-brand-black/[0.03] dark:bg-white/[0.03] hover:border-brand-black/30 dark:hover:border-white/30 text-brand-black dark:text-white"
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
                  className={`rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition ${side === s
                    ? "bg-[#FF5F1F] text-white"
                    : "bg-brand-black/5 dark:bg-white/5 text-brand-black/80 dark:text-zinc-300 hover:bg-brand-black/10 dark:hover:bg-white/10"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-brand-black/50 dark:text-zinc-500">
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
              <span className="text-xs font-bold uppercase tracking-widest text-brand-black/50 dark:text-zinc-400">Qty</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => clamp(q - 1, 1, 999))}
                  className="h-7 w-7 rounded-md border border-brand-black/10 dark:border-white/10 hover:border-brand-black/30 dark:hover:border-white/30 text-brand-black dark:text-white"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-brand-black dark:text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => clamp(q + 1, 1, 999))}
                  className="h-7 w-7 rounded-md border border-brand-black/10 dark:border-white/10 hover:border-brand-black/30 dark:hover:border-white/30 text-brand-black dark:text-white"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-brand-black/5 dark:border-white/10 pt-3">
              <span className="text-sm font-bold uppercase tracking-widest text-brand-black dark:text-white">Total</span>
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
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-brand-black/10 dark:border-white/15 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-black/80 dark:text-zinc-300 transition hover:border-brand-black/30 dark:hover:border-white/40"
            >
              <Heart className="h-3.5 w-3.5" /> Save design
            </button>
            <button
              type="button"
              onClick={handleClearDesign}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 dark:border-red-500/30 py-2 text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <RotateCw className="h-3.5 w-3.5" /> Clear design
            </button>
          </Panel>
        </div>

        {/* Bottom row: uploaded graphics & shapes */}
        <div className="lg:col-span-3">
          <Panel number={7} title="Uploaded graphics & shapes">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {layers
                .filter(
                  (l): l is ImageLayer | ShapeLayer => l.type === "image" || l.type === "shape",
                )
                .map((l) => (
                  <div
                    key={l.id}
                    className={`group relative rounded-xl border p-2 ${l.id === selectedId ? "border-[#FF5F1F]" : "border-white/10"
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
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-brand-black/5 dark:border-white/5 bg-white/90 dark:bg-[#0b0b0d]/90 px-6 py-2.5 backdrop-blur-md text-brand-black dark:text-white transition-colors">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 font-display text-sm font-extrabold tracking-tight text-brand-black dark:text-white hover:opacity-80 transition mr-1">
          <img src="/logo.png" alt="Custom On Logo" className="h-7 w-7 shrink-0 object-contain drop-shadow-xs" />
          <span>CUSTOM<span className="text-brand-orange">ON</span></span>
        </Link>
        <span className="text-brand-black/30 dark:text-white/20">/</span>
        <span className="text-xs font-extrabold uppercase tracking-widest text-brand-orange">Canvas</span>
        <span className="text-brand-black/30 dark:text-white/20">/</span>
        <h1 className="truncate text-xs font-bold uppercase tracking-widest text-brand-black/70 dark:text-white/70">Interactive Builder</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 rounded-lg border border-brand-black/10 dark:border-white/15 px-3 py-1.5 text-xs font-semibold text-brand-black dark:text-white hover:bg-brand-black/5 dark:hover:bg-white/10 transition"
        >
          <Save className="h-3.5 w-3.5" /> Save design
        </button>
        <Link
          to="/dashboard"
          search={{ tab: "orders" }}
          className="hidden items-center gap-1.5 rounded-lg border border-brand-black/10 dark:border-white/15 px-3 py-1.5 text-xs font-semibold text-brand-black dark:text-white hover:bg-brand-black/5 dark:hover:bg-white/10 transition sm:flex"
        >
          <Layers className="h-3.5 w-3.5" /> My designs
        </Link>
        <button
          type="button"
          onClick={onOpenCart}
          className="relative rounded-lg border border-brand-black/10 dark:border-white/15 p-1.5 text-brand-black dark:text-white hover:bg-brand-black/5 dark:hover:bg-white/10 transition"
          aria-label="Open cart"
        >
          <ShoppingCart className="h-4 w-4" />
          {cartQty > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[#FF5F1F] text-[9px] font-bold text-white">
              {cartQty}
            </span>
          )}
        </button>
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
    <section className="rounded-2xl border border-brand-black/5 dark:border-white/10 bg-white dark:bg-[#131316] p-4 shadow-sm dark:shadow-none transition-colors">
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-black/70 dark:text-zinc-300">
        <span className="text-[#FF5F1F]">{number}.</span> {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="truncate text-brand-black/60 dark:text-zinc-400">{label}</span>
      <span className="font-semibold text-brand-black dark:text-white">{value}</span>
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
      className={`grid h-12 w-12 place-items-center rounded-lg text-[9px] font-semibold uppercase tracking-wide transition ${active ? "bg-[#FF5F1F] text-white" : "text-brand-black/60 dark:text-zinc-400 hover:bg-brand-black/5 dark:hover:bg-white/10 hover:text-brand-black dark:hover:text-white"
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
      className={`inline-flex items-center gap-1.5 rounded-lg border border-brand-black/10 dark:border-white/10 px-3 py-1.5 font-semibold transition ${danger ? "text-red-500 dark:text-red-400 hover:border-red-400/60" : "text-brand-black/70 dark:text-zinc-300 hover:border-brand-black/30 dark:hover:border-white/35"
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
  onUpdateText?: (text: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

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
      onDoubleClick={() => {
        if (layer.type === "text") setIsEditing(true);
      }}
    >
      {layer.type === "text" && (
        isEditing ? (
          <textarea
            autoFocus
            value={layer.text}
            onChange={(e) => onUpdateText?.(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                setIsEditing(false);
              }
            }}
            className="w-full resize-none border border-dashed border-[#FF5F1F] bg-transparent outline-none"
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
            }}
          />
        ) : (
          <div
            className="cursor-pointer"
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
        )
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
          {/* Bounding Box Outline */}
          <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-[#FF5F1F] rounded-xs z-20" />

          {/* 4 Corner Resize Handles */}
          <button
            type="button"
            aria-label="Resize Top Left"
            onPointerDown={(e) => onResize(e, "resize-tl")}
            className="absolute -top-2.5 -left-2.5 h-5.5 w-5.5 cursor-nwse-resize rounded-full border-2 border-white bg-[#FF5F1F] shadow-md transition hover:scale-125 z-40"
            title="Resize from top left"
          />
          <button
            type="button"
            aria-label="Resize Top Right"
            onPointerDown={(e) => onResize(e, "resize-tr")}
            className="absolute -top-2.5 -right-2.5 h-5.5 w-5.5 cursor-nesw-resize rounded-full border-2 border-white bg-[#FF5F1F] shadow-md transition hover:scale-125 z-40"
            title="Resize from top right"
          />
          <button
            type="button"
            aria-label="Resize Bottom Left"
            onPointerDown={(e) => onResize(e, "resize-bl")}
            className="absolute -bottom-2.5 -left-2.5 h-5.5 w-5.5 cursor-nesw-resize rounded-full border-2 border-white bg-[#FF5F1F] shadow-md transition hover:scale-125 z-40"
            title="Resize from bottom left"
          />
          <button
            type="button"
            aria-label="Resize Bottom Right"
            onPointerDown={(e) => onResize(e, "resize-br")}
            className="absolute -bottom-2.5 -right-2.5 h-5.5 w-5.5 cursor-nwse-resize rounded-full border-2 border-white bg-[#FF5F1F] shadow-md transition hover:scale-125 z-40"
            title="Resize from bottom right"
          />
          <button
            type="button"
            aria-label="Rotate"
            onPointerDown={onRotate}
            className="absolute -top-7 left-1/2 h-5.5 w-5.5 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-sky-500 shadow-md z-40"
            title="Rotate layer"
          />
          <div className="absolute -top-7 right-0 flex gap-1 z-30">
            <button
              type="button"
              aria-label="Duplicate layer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onDuplicate}
              className="grid h-5.5 w-5.5 place-items-center rounded-full bg-white/90 text-black shadow-md hover:bg-white transition"
              title="Duplicate"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              type="button"
              aria-label="Delete layer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onDelete}
              className="grid h-5.5 w-5.5 place-items-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition"
              title="Delete"
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
  onPreviewFont,
  previewFont,
  onPreviewFontSize,
  previewFontSize,
}: {
  layers: TextLayer[];
  selectedId: string | null;
  onSelect: (layer: TextLayer) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onChange: (id: string, patch: Partial<TextLayer>) => void;
  onPreviewFont: (fontValue: string | null) => void;
  previewFont: string | null;
  onPreviewFontSize: (size: number | null) => void;
  previewFontSize: number | null;
}) {
  const active = layers.find((l) => l.id === selectedId) ?? layers[0] ?? null;
  const [selectedCategory, setSelectedCategory] = useState<FontCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredFonts = useMemo(() => {
    return FONTS.filter((f) => {
      const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="relative">
      {/* Primary Toolbar Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Layer Selector / Add Button */}
        {layers.length > 0 ? (
          <div className="flex items-center gap-1">
            <select
              value={active?.id ?? ""}
              onChange={(e) => {
                const target = layers.find((l) => l.id === e.target.value);
                if (target) onSelect(target);
              }}
              className="rounded-lg border border-brand-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.04] px-2 py-1.5 text-xs font-bold text-brand-black dark:text-white outline-none focus:border-[#FF5F1F]"
            >
              {layers.map((l, i) => (
                <option key={l.id} value={l.id}>
                  Text #{i + 1}: {l.text.slice(0, 12) || "(empty)"} ({l.side})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onAdd}
              className="rounded-lg border border-dashed border-brand-black/20 dark:border-white/20 px-2 py-1.5 text-xs font-bold text-[#FF5F1F] hover:bg-[#FF5F1F]/10 transition"
              title="Add another text layer"
            >
              + Text
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-lg bg-[#FF5F1F] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#ff7a45] transition"
          >
            <TypeIcon className="h-3.5 w-3.5" /> + Add Text Layer
          </button>
        )}

        {active && (
          <>
            {/* Quick Text Input */}
            <input
              type="text"
              value={active.text}
              onChange={(e) => onChange(active.id, { text: e.target.value })}
              placeholder="Type your text..."
              className="min-w-[130px] flex-1 rounded-lg border border-brand-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-[#FF5F1F] text-brand-black dark:text-white"
            />

            {/* Font Family Popover Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsFontPickerOpen((prev) => !prev);
                  setIsFontSizeOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  isFontPickerOpen
                    ? "border-[#FF5F1F] bg-[#FF5F1F]/10 text-[#FF5F1F]"
                    : "border-brand-black/10 dark:border-white/10 bg-white dark:bg-[#1b1b1f] text-brand-black dark:text-white hover:border-[#FF5F1F]/50"
                }`}
              >
                <span className="truncate max-w-[120px]" style={{ fontFamily: active.font }}>
                  {getFontLabel(active.font)}
                </span>
                <span className="text-[10px] opacity-60">▾</span>
              </button>

              {/* Floating Resizable & Draggable Font Picker Window */}
              <ResizableFontLibraryModal
                isOpen={isFontPickerOpen}
                onClose={() => setIsFontPickerOpen(false)}
                filteredFonts={filteredFonts}
                activeFont={active.font}
                previewFont={previewFont}
                activeText={active.text}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onSelectFont={(fontValue) => onChange(active.id, { font: fontValue })}
                onPreviewFont={onPreviewFont}
              />
            </div>

            {/* Font Size Selector with Live Hover Preview */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsFontSizeOpen((prev) => !prev);
                  setIsFontPickerOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                  isFontSizeOpen || previewFontSize !== null
                    ? "border-[#FF5F1F] bg-[#FF5F1F]/10 text-[#FF5F1F]"
                    : "border-brand-black/10 dark:border-white/10 bg-white dark:bg-[#1b1b1f] text-brand-black dark:text-white hover:border-[#FF5F1F]/50"
                }`}
              >
                <span>{Math.round(previewFontSize ?? active.fontSize)} px</span>
                <span className="text-[10px] opacity-60">▾</span>
              </button>

              {isFontSizeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                      setIsFontSizeOpen(false);
                      onPreviewFontSize(null);
                    }}
                  />
                  <div
                    className="absolute top-full left-0 mt-1.5 z-50 w-48 rounded-xl border border-brand-black/10 dark:border-white/15 bg-white/95 dark:bg-[#18181b]/95 p-2 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in"
                    onMouseLeave={() => onPreviewFontSize(null)}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-brand-black/60 dark:text-zinc-400 px-2 py-1 border-b border-brand-black/5 dark:border-white/5 mb-1">
                      Select Font Size (px)
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-1 pr-0.5">
                      {[14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 88, 104, 120].map((size) => {
                        const isSelected = Math.round(active.fontSize) === size;
                        const isHovering = previewFontSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onMouseEnter={() => onPreviewFontSize(size)}
                            onClick={() => {
                              onChange(active.id, { fontSize: size });
                              onPreviewFontSize(null);
                              setIsFontSizeOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-left transition ${
                              isSelected
                                ? "bg-[#FF5F1F] text-white font-bold"
                                : isHovering
                                ? "bg-[#FF5F1F]/15 text-[#FF5F1F] font-bold"
                                : "text-brand-black dark:text-zinc-200 hover:bg-brand-black/5 dark:hover:bg-white/10"
                            }`}
                          >
                            <span>{size} px</span>
                            {isSelected && <span className="text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* B / I / U Formatting Toggles */}
            <div className="inline-flex overflow-hidden rounded-lg border border-brand-black/10 dark:border-white/15">
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

            {/* Alignment Toggles */}
            <div className="inline-flex overflow-hidden rounded-lg border border-brand-black/10 dark:border-white/15">
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

            {/* Color Swatches */}
            <div className="flex items-center gap-1">
              {INK_COLORS.slice(0, 6).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Text colour ${c}`}
                  onClick={() => onChange(active.id, { color: c })}
                  className={`h-5 w-5 rounded-full border-2 transition ${
                    active.color.toLowerCase() === c.toLowerCase()
                      ? "border-[#FF5F1F] scale-110"
                      : "border-brand-black/15 dark:border-white/15"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Advanced Controls Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className={`rounded-lg border px-2 py-1.5 text-xs font-bold transition ${
                showAdvanced
                  ? "border-[#FF5F1F] bg-[#FF5F1F]/10 text-[#FF5F1F]"
                  : "border-brand-black/10 dark:border-white/10 text-brand-black/60 dark:text-zinc-400 hover:text-brand-black dark:hover:text-white"
              }`}
              title="More text effects"
            >
              Spacing ▾
            </button>

            {/* Delete Active Text Layer Button */}
            <button
              type="button"
              onClick={() => onDelete(active.id)}
              className="p-1.5 text-brand-black/40 dark:text-zinc-500 hover:text-red-500 transition"
              title="Delete text layer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Expandable Advanced Sliders */}
      {active && showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-brand-black/10 dark:border-white/10 p-3 bg-brand-black/[0.02] dark:bg-white/[0.02] mt-2 animate-in fade-in">
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
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Resizable & Draggable Font Library Window Component                 */
/* ------------------------------------------------------------------ */

function ResizableFontLibraryModal({
  isOpen,
  onClose,
  filteredFonts,
  activeFont,
  previewFont,
  activeText,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSelectFont,
  onPreviewFont,
}: {
  isOpen: boolean;
  onClose: () => void;
  filteredFonts: typeof FONTS;
  activeFont: string;
  previewFont: string | null;
  activeText: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: FontCategory;
  setSelectedCategory: (cat: FontCategory) => void;
  onSelectFont: (fontValue: string) => void;
  onPreviewFont: (fontValue: string | null) => void;
}) {
  const [modalSize, setModalSize] = useState({ width: 460, height: 400 });
  const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<null | {
    type: "move" | "resize-se" | "resize-sw" | "resize-ne" | "resize-nw" | "resize-e" | "resize-s" | "resize-w" | "resize-n";
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    startPosX: number;
    startPosY: number;
  }>(null);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { type, startX, startY, startW, startH, startPosX, startPosY } = dragRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (type === "move") {
        setModalPos({ x: startPosX + dx, y: startPosY + dy });
      } else {
        let newW = startW;
        let newH = startH;
        let newX = startPosX;
        let newY = startPosY;

        if (type.includes("e")) newW = Math.max(300, startW + dx);
        if (type.includes("s")) newH = Math.max(240, startH + dy);
        if (type.includes("w")) {
          const w = Math.max(300, startW - dx);
          newX = startPosX + (startW - w);
          newW = w;
        }
        if (type.includes("n")) {
          const h = Math.max(240, startH - dy);
          newY = startPosY + (startH - h);
          newH = h;
        }

        setModalSize({ width: newW, height: newH });
        setModalPos({ x: newX, y: newY });
      }
    };

    const onPointerUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  if (!isOpen) return null;

  const startDrag = (e: React.PointerEvent, type: NonNullable<typeof dragRef.current>["type"]) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startW: modalSize.width,
      startH: modalSize.height,
      startPosX: modalPos.x,
      startPosY: modalPos.y,
    };
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => {
          onClose();
          onPreviewFont(null);
        }}
      />
      <div
        className="fixed z-50 rounded-2xl border-2 border-[#FF5F1F]/40 bg-white/95 dark:bg-[#141417]/95 p-3.5 shadow-2xl backdrop-blur-2xl transition-shadow select-none flex flex-col"
        style={{
          top: "96px",
          right: "24px",
          transform: `translate(${modalPos.x}px, ${modalPos.y}px)`,
          width: `${modalSize.width}px`,
          height: `${modalSize.height}px`,
          maxWidth: "calc(100vw - 2rem)",
          maxHeight: "calc(100vh - 7rem)",
        }}
        onMouseLeave={() => onPreviewFont(null)}
      >
        {/* Draggable Window Header */}
        <div
          className="flex items-center justify-between mb-2 pb-2 border-b border-brand-black/10 dark:border-white/10 cursor-move shrink-0"
          onPointerDown={(e) => startDrag(e, "move")}
          title="Drag header to move Font Library window"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-black dark:text-white flex items-center gap-1.5">
              <Move className="h-3.5 w-3.5 text-[#FF5F1F]" /> Font Library
            </span>
            <span className="rounded-full bg-[#FF5F1F]/15 px-2 py-0.5 text-[10px] font-extrabold text-[#FF5F1F]">
              {filteredFonts.length} styles
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPreviewFont(null);
            }}
            className="rounded-lg p-1 text-brand-black/40 dark:text-zinc-400 hover:bg-brand-black/5 dark:hover:bg-white/10 hover:text-brand-black dark:hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search font styles (e.g. Script, Bold)..."
          className="w-full mb-2 rounded-xl border border-brand-black/10 dark:border-white/15 bg-zinc-50 dark:bg-[#1c1c20] px-3 py-1.5 text-xs font-medium text-brand-black dark:text-white outline-none focus:border-[#FF5F1F] shrink-0"
        />

        {/* Category Filter Pills */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-2 shrink-0">
          {FONT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                selectedCategory === cat.id
                  ? "bg-[#FF5F1F] text-white shadow-sm"
                  : "bg-brand-black/5 dark:bg-white/5 text-brand-black/60 dark:text-zinc-400 hover:bg-brand-black/10 dark:hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Rectangular Font Cards Grid (2 Columns) */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1 min-h-0">
          {filteredFonts.map((f) => {
            const isSelected = activeFont === f.value;
            const isPreviewing = previewFont === f.value;
            const displayText = activeText.trim() ? activeText : (f.sample ?? f.label);

            return (
              <button
                key={f.id}
                type="button"
                onMouseEnter={() => onPreviewFont(f.value)}
                onClick={() => {
                  onSelectFont(f.value);
                  onPreviewFont(null);
                  onClose();
                }}
                className={`group relative flex flex-col justify-between rounded-xl border-2 p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-[#FF5F1F] bg-[#FF5F1F]/15 ring-2 ring-[#FF5F1F]/40 shadow-md"
                    : isPreviewing
                    ? "border-[#FF5F1F] bg-[#FF5F1F]/10 scale-[1.02]"
                    : "border-brand-black/5 dark:border-white/10 bg-white dark:bg-[#1a1a1e] hover:border-[#FF5F1F]/60 hover:bg-[#FF5F1F]/5"
                }`}
              >
                <div
                  className="truncate text-base leading-snug text-brand-black dark:text-white"
                  style={{ fontFamily: f.value }}
                >
                  {displayText}
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-brand-black/5 dark:border-white/5 pt-1.5">
                  <span className="truncate text-[11px] font-bold text-brand-black/70 dark:text-zinc-300">
                    {f.label}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#FF5F1F]">
                    {f.category}
                  </span>
                </div>

                {isSelected && (
                  <span className="absolute top-2 right-2 grid h-4.5 w-4.5 place-items-center rounded-full bg-[#FF5F1F] text-[9px] font-bold text-white shadow-xs">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
          {filteredFonts.length === 0 && (
            <p className="col-span-2 py-4 text-center text-xs text-brand-black/40 dark:text-zinc-500">
              No matching fonts found.
            </p>
          )}
        </div>

        {/* Window Corner Resize Handles (All 4 Corners) */}
        <div
          onPointerDown={(e) => startDrag(e, "resize-nw")}
          className="absolute -top-1.5 -left-1.5 h-4 w-4 cursor-nwse-resize rounded-full bg-[#FF5F1F] border-2 border-white opacity-80 hover:opacity-100 hover:scale-125 transition z-50"
          title="Resize window top left"
        />
        <div
          onPointerDown={(e) => startDrag(e, "resize-ne")}
          className="absolute -top-1.5 -right-1.5 h-4 w-4 cursor-nesw-resize rounded-full bg-[#FF5F1F] border-2 border-white opacity-80 hover:opacity-100 hover:scale-125 transition z-50"
          title="Resize window top right"
        />
        <div
          onPointerDown={(e) => startDrag(e, "resize-sw")}
          className="absolute -bottom-1.5 -left-1.5 h-4 w-4 cursor-nesw-resize rounded-full bg-[#FF5F1F] border-2 border-white opacity-80 hover:opacity-100 hover:scale-125 transition z-50"
          title="Resize window bottom left"
        />
        <div
          onPointerDown={(e) => startDrag(e, "resize-se")}
          className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-nwse-resize rounded-full bg-[#FF5F1F] border-2 border-white opacity-80 hover:opacity-100 hover:scale-125 transition z-50"
          title="Resize window bottom right"
        />

        {/* Window Edge Resize Handles (4 Sides) */}
        <div
          onPointerDown={(e) => startDrag(e, "resize-n")}
          className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-12 cursor-ns-resize rounded bg-[#FF5F1F]/60 hover:bg-[#FF5F1F] transition z-50"
          title="Resize window height"
        />
        <div
          onPointerDown={(e) => startDrag(e, "resize-s")}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-12 cursor-ns-resize rounded bg-[#FF5F1F]/60 hover:bg-[#FF5F1F] transition z-50"
          title="Resize window height"
        />
        <div
          onPointerDown={(e) => startDrag(e, "resize-w")}
          className="absolute top-1/2 -left-1 -translate-y-1/2 h-12 w-2 cursor-ew-resize rounded bg-[#FF5F1F]/60 hover:bg-[#FF5F1F] transition z-50"
          title="Resize window width"
        />
        <div
          onPointerDown={(e) => startDrag(e, "resize-e")}
          className="absolute top-1/2 -right-1 -translate-y-1/2 h-12 w-2 cursor-ew-resize rounded bg-[#FF5F1F]/60 hover:bg-[#FF5F1F] transition z-50"
          title="Resize window width"
        />
      </div>
    </>
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
      className={`px-3 py-2 transition ${active ? "bg-[#FF5F1F] text-white" : "text-brand-black/60 dark:text-zinc-400 hover:bg-brand-black/5 dark:hover:bg-white/10"}`}
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
      <span className="flex items-center justify-between text-[11px] uppercase tracking-widest text-brand-black/60 dark:text-zinc-400">
        {label}
        <span className="font-semibold text-brand-black dark:text-zinc-200">{value}</span>
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-md flex-col border-l border-brand-black/10 dark:border-white/10 bg-white dark:bg-[#131316] text-brand-black dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-brand-black/10 dark:border-white/10 p-4">
          <h2 className="truncate text-sm font-bold uppercase tracking-widest text-brand-black dark:text-white">Your cart</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="text-brand-black/60 dark:text-zinc-400 hover:text-brand-black dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 && <p className="text-sm text-brand-black/50 dark:text-zinc-500">Your cart is empty.</p>}
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-brand-black/10 dark:border-white/10 p-3">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <span className="grid h-16 w-14 shrink-0 place-items-center rounded-lg bg-brand-black/5 dark:bg-white/5">
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
                  <p className="text-[11px] text-brand-black/60 dark:text-zinc-400">
                    {item.colorName} · {item.targetGroup} · Size {item.size}
                  </p>
                  <p className="truncate text-[11px] text-brand-black/50 dark:text-zinc-500">{item.summary}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onQuantity(item.id, item.quantity - 1)}
                      className="h-6 w-6 rounded border border-brand-black/15 dark:border-white/10"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-xs">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 rounded border border-brand-black/15 dark:border-white/10"
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
                    className="mt-1 text-brand-black/40 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-brand-black/10 dark:border-white/10 p-4">
          <input
            value={checkout.name}
            onChange={(e) => onCheckoutChange({ ...checkout, name: e.target.value })}
            placeholder="Shipping name"
            className="w-full rounded-lg border border-brand-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[#FF5F1F] text-brand-black dark:text-white"
          />
          <input
            value={checkout.address}
            onChange={(e) => onCheckoutChange({ ...checkout, address: e.target.value })}
            placeholder="Shipping address"
            className="w-full rounded-lg border border-brand-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[#FF5F1F] text-brand-black dark:text-white"
          />
          <input
            value={checkout.phone}
            onChange={(e) => onCheckoutChange({ ...checkout, phone: e.target.value })}
            placeholder="Phone number"
            className="w-full rounded-lg border border-brand-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[#FF5F1F] text-brand-black dark:text-white"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-black/60 dark:text-zinc-400">Total</span>
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

/* ------------------------------------------------------------------ */
/* Smart Alignment Guides & Center Crosshair System Overlay          */
/* ------------------------------------------------------------------ */

export type GuideLine = {
  id: string;
  orientation: "vertical" | "horizontal";
  position: number; // percentage 0..100
  label: string;
  isCenter?: boolean;
};

export type ActiveGuidesState = {
  vertical: GuideLine | null;
  horizontal: GuideLine | null;
  isCrosshair: boolean;
};

function SmartGuidesOverlay({
  activeGuides,
}: {
  activeGuides: ActiveGuidesState | null;
}) {
  if (!activeGuides) return null;
  const { vertical, horizontal, isCrosshair } = activeGuides;
  if (!vertical && !horizontal && !isCrosshair) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible">
      {/* Vertical Guide Line */}
      {vertical && (
        <div
          className="absolute bottom-0 top-0 w-[1.5px] -translate-x-1/2 bg-[#FF5F1F] dark:bg-[#00E5FF] shadow-[0_0_10px_rgba(255,95,31,0.9)] dark:shadow-[0_0_10px_rgba(0,229,255,0.9)] transition-opacity duration-75"
          style={{ left: `${vertical.position}%` }}
        >
          <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded bg-[#FF5F1F] dark:bg-[#00E5FF] px-2 py-0.5 text-[9px] font-black uppercase text-white dark:text-black shadow-md tracking-wider whitespace-nowrap">
            {vertical.label}
          </div>
        </div>
      )}

      {/* Horizontal Guide Line */}
      {horizontal && (
        <div
          className="absolute left-0 right-0 h-[1.5px] -translate-y-1/2 bg-[#FF5F1F] dark:bg-[#00E5FF] shadow-[0_0_10px_rgba(255,95,31,0.9)] dark:shadow-[0_0_10px_rgba(0,229,255,0.9)] transition-opacity duration-75"
          style={{ top: `${horizontal.position}%` }}
        >
          <div className="absolute left-2 top-1/2 -translate-y-1/2 rounded bg-[#FF5F1F] dark:bg-[#00E5FF] px-2 py-0.5 text-[9px] font-black uppercase text-white dark:text-black shadow-md tracking-wider whitespace-nowrap">
            {horizontal.label}
          </div>
        </div>
      )}

      {/* Exact Center Crosshair (+) System */}
      {isCrosshair && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          <div className="relative grid h-12 w-12 place-items-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#FF5F1F] dark:border-[#00E5FF] animate-ping opacity-80" />
            <div className="absolute inset-1 rounded-full border-2 border-[#FF5F1F] dark:border-[#00E5FF] bg-[#FF5F1F]/25 dark:bg-[#00E5FF]/25 backdrop-blur-xs" />
            <span className="relative text-2xl font-black text-[#FF5F1F] dark:text-[#00E5FF]">+</span>
          </div>
          <span className="mt-1.5 rounded-md bg-[#FF5F1F] dark:bg-[#00E5FF] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white dark:text-black shadow-xl">
            EXACT CENTER (50%, 50%)
          </span>
        </div>
      )}
    </div>
  );
}
