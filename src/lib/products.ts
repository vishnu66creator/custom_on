import { SIZE_MEDIA, type SizeMedia } from "./size-media";

export type Category = "T-Shirts" | "Hoodies";

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  colors: string[];
  sizes: string[];
  /** Primary catalog image, kept for compatibility with custom products and existing DB rows. */
  image: string;
  /** Explicit front/back media used by the Design Studio. */
  frontImage?: string;
  backImage?: string;
  /** Transparent alpha masks used only for garment recoloring. */
  frontMaskImage?: string;
  backMaskImage?: string;
  /** Optional exact media pair for each selectable garment size. */
  sizeMedia?: Record<string, SizeMedia> | undefined;
  blurb: string;
};

export const COLOR_NAMES: Record<string, string> = {
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

export const ALL_APPAREL_COLORS = Object.keys(COLOR_NAMES);

export function getColorName(hex: string): string {
  if (!hex) return "Default";
  const upper = hex.toUpperCase();
  if (COLOR_NAMES[upper]) return COLOR_NAMES[upper];
  if (COLOR_NAMES[hex]) return COLOR_NAMES[hex];
  return `Custom (${hex.toUpperCase()})`;
}

export const STANDARD_APPAREL_SIZES = ["S", "M", "L"];

const product = (
  details: Omit<Product, "image"> & { frontImage: string; backImage: string },
): Product => ({
  ...details,
  image: details.frontImage,
});

/**
 * The customer-facing catalog intentionally contains six apparel blanks only.
 * Each default product owns a distinct front and back asset so dashboard cards,
 * picker thumbnails, and the Design Studio all refer to the same product media.
 */
export const PRODUCTS: Product[] = [
  product({
    id: "regular-tee",
    name: "Regular Fit T-Shirt",
    category: "T-Shirts",
    price: 25,
    colors: ALL_APPAREL_COLORS,
    sizes: STANDARD_APPAREL_SIZES,
    frontImage: "/assets/size_catalog/regular-tee/m-front.png",
    backImage: "/assets/size_catalog/regular-tee/m-back.png",
    frontMaskImage: "/assets/size_catalog/regular-tee/m-front-mask.png",
    backMaskImage: "/assets/size_catalog/regular-tee/m-back-mask.png",
    sizeMedia: SIZE_MEDIA["regular-tee"],
    blurb: "Classic everyday wear. 100% combed cotton blank built for custom prints.",
  }),
  product({
    id: "oversized-tee",
    name: "Oversized T-Shirt",
    category: "T-Shirts",
    price: 32,
    colors: ALL_APPAREL_COLORS,
    sizes: STANDARD_APPAREL_SIZES,
    frontImage: "/assets/size_catalog/oversized-tee/m-front.png",
    backImage: "/assets/size_catalog/oversized-tee/m-back.png",
    frontMaskImage: "/assets/size_catalog/oversized-tee/m-front-mask.png",
    backMaskImage: "/assets/size_catalog/oversized-tee/m-back-mask.png",
    sizeMedia: SIZE_MEDIA["oversized-tee"],
    blurb: "Modern streetwear cut with relaxed drop-shoulder drape and premium heavyweight finish.",
  }),
  product({
    id: "polo-tee",
    name: "Polo T-Shirt",
    category: "T-Shirts",
    price: 34,
    colors: ALL_APPAREL_COLORS,
    sizes: STANDARD_APPAREL_SIZES,
    frontImage: "/assets/size_catalog/polo-tee/m-front.png",
    backImage: "/assets/size_catalog/polo-tee/m-back.png",
    frontMaskImage: "/assets/size_catalog/polo-tee/m-front-mask.png",
    backMaskImage: "/assets/size_catalog/polo-tee/m-back-mask.png",
    sizeMedia: SIZE_MEDIA["polo-tee"],
    blurb: "Smart casual piqué knit featuring ribbed collar, button placket, and tailored fit.",
  }),
  product({
    id: "full-sleeve-tee",
    name: "Full-Sleeve T-Shirt",
    category: "T-Shirts",
    price: 30,
    colors: ALL_APPAREL_COLORS,
    sizes: STANDARD_APPAREL_SIZES,
    frontImage: "/assets/size_catalog/full-sleeve-tee/m-front.png",
    backImage: "/assets/size_catalog/full-sleeve-tee/m-back.png",
    frontMaskImage: "/assets/size_catalog/full-sleeve-tee/m-front-mask.png",
    backMaskImage: "/assets/size_catalog/full-sleeve-tee/m-back-mask.png",
    sizeMedia: SIZE_MEDIA["full-sleeve-tee"],
    blurb:
      "Versatile long-sleeve T-shirt with ribbed cuffs, ideal for year-round layering and prints.",
  }),
  product({
    id: "pullover-hoodie",
    name: "Pullover Hoodie",
    category: "Hoodies",
    price: 45,
    colors: ALL_APPAREL_COLORS,
    sizes: STANDARD_APPAREL_SIZES,
    frontImage: "/assets/size_catalog/pullover-hoodie/m-front.png",
    backImage: "/assets/size_catalog/pullover-hoodie/m-back.png",
    frontMaskImage: "/assets/size_catalog/pullover-hoodie/m-front-mask.png",
    backMaskImage: "/assets/size_catalog/pullover-hoodie/m-back-mask.png",
    sizeMedia: SIZE_MEDIA["pullover-hoodie"],
    blurb:
      "Heavyweight 400 GSM brushed fleece with double-lined hood and spacious kangaroo pocket.",
  }),
  product({
    id: "zip-up-hoodie",
    name: "Zip-Up Hoodie",
    category: "Hoodies",
    price: 48,
    colors: ALL_APPAREL_COLORS,
    sizes: STANDARD_APPAREL_SIZES,
    frontImage: "/assets/size_catalog/zip-up-hoodie/m-front.png",
    backImage: "/assets/size_catalog/zip-up-hoodie/m-back.png",
    frontMaskImage: "/assets/size_catalog/zip-up-hoodie/m-front-mask.png",
    backMaskImage: "/assets/size_catalog/zip-up-hoodie/m-back-mask.png",
    sizeMedia: SIZE_MEDIA["zip-up-hoodie"],
    blurb:
      "Casual layering hoodie with full center metal zipper, split kangaroo pockets, and ribbed hem.",
  }),
];

export const CATEGORIES: Category[] = ["T-Shirts", "Hoodies"];

export function getProductMedia(product: Product, side: "front" | "back", size?: string): string {
  const selected = size ? product.sizeMedia?.[size] : undefined;
  if (side === "front") return selected?.frontImage ?? product.frontImage ?? product.image;
  return selected?.backImage ?? product.backImage ?? product.frontImage ?? product.image;
}

export function getDefaultProduct(productId: string): Product | undefined {
  return PRODUCTS.find((item) => item.id === productId);
}
