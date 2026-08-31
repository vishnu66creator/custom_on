import { createServerFn } from "@tanstack/react-start";
import {
  ALL_APPAREL_COLORS,
  getDefaultProduct,
  getProductMedia,
  PRODUCTS,
  STANDARD_APPAREL_SIZES,
  type Product,
} from "./products";

import hoodie from "@/assets/product-hoodie.jpg";
import tee from "@/assets/product-tee.jpg";
import polo from "@/assets/product-polo.jpg";
import oversized from "@/assets/product-oversized.jpg";
import heroTee from "@/assets/hero-tee.jpg";

const ASSET_IMAGE_MAP: Record<string, string> = {
  "product-tee.jpg": tee,
  "product-hoodie.jpg": hoodie,
  "product-polo.jpg": polo,
  "product-oversized.jpg": oversized,
  "hero-tee.jpg": heroTee,
  tee,
  hoodie,
  polo,
  oversized,
};

for (const item of PRODUCTS) {
  ASSET_IMAGE_MAP[item.id] = item.frontImage ?? item.image;
  ASSET_IMAGE_MAP[`${item.id}-front`] = item.frontImage ?? item.image;
  ASSET_IMAGE_MAP[`${item.id}-back`] = item.backImage ?? item.frontImage ?? item.image;
}

/**
 * Centralized, deterministic image adapter for stored catalog references.
 * Unknown custom-product URLs are preserved; unknown asset ids safely fall back
 * to the regular tee rather than rendering a broken image.
 */
export function resolveProductImage(image: string | null | undefined): string {
  if (!image || typeof image !== "string") {
    console.warn(
      "[ProductImageAdapter] Missing or invalid product image reference. Using fallback tee image.",
    );
    return PRODUCTS[0]!.image;
  }

  const trimmed = image.trim();
  if (ASSET_IMAGE_MAP[trimmed]) {
    return ASSET_IMAGE_MAP[trimmed];
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  console.warn(
    `[ProductImageAdapter] Could not resolve image asset: "${trimmed}". Using fallback tee image.`,
  );
  return PRODUCTS[0]!.image;
}

type ProductRow = {
  id: string;
  name?: string | null;
  category?: string | null;
  price?: number | string | null;
  colors?: unknown;
  sizes?: unknown;
  image?: string | null;
  frontImage?: string | null;
  backImage?: string | null;
  blurb?: string | null;
};

function mediaForRow(row: ProductRow, side: "front" | "back"): string {
  const known = getDefaultProduct(row?.id);
  if (known) return getProductMedia(known, side);
  const stored = side === "front" ? row?.frontImage : row?.backImage;
  return resolveProductImage(stored || row?.image);
}

/** Converts a database row into the clean application Product model. */
export function mapDbProductToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name || "Untitled Product",
    category: (row.category as Product["category"]) || "T-Shirts",
    price: typeof row.price === "number" ? row.price : Number(row.price) || 0,
    colors: Array.isArray(row.colors)
      ? row.colors.filter((value): value is string => ALL_APPAREL_COLORS.includes(value))
      : ALL_APPAREL_COLORS,
    sizes: Array.isArray(row.sizes)
      ? row.sizes.filter((value): value is string => STANDARD_APPAREL_SIZES.includes(value))
      : STANDARD_APPAREL_SIZES,
    image: mediaForRow(row, "front"),
    frontImage: mediaForRow(row, "front"),
    backImage: mediaForRow(row, "back"),
    blurb: row.blurb || "Custom apparel blank.",
  };
}

/** Server function: fetch all products from PostgreSQL. */
export const getDbProducts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { db } = await import("./db/db");
    if (!db) return [];
    const { products } = await import("./db/schema");
    const rows = await db.select().from(products);
    const byId = new Map(
      rows
        .filter((row) => PRODUCTS.some((product) => product.id === row.id))
        .map((row) => [row.id, mapDbProductToProduct(row)] as const),
    );
    return PRODUCTS.map((product) => byId.get(product.id) ?? product);
  } catch (error) {
    console.error("Failed to fetch products from PostgreSQL database:", error);
    throw error;
  }
});

/** Server function: insert or update a product in PostgreSQL. */
export const saveDbProduct = createServerFn({ method: "POST" })
  .validator((data: Product) => data)
  .handler(async ({ data }) => {
    if (!PRODUCTS.some((product) => product.id === data.id)) {
      return { success: false, reason: "fixed-catalog" as const };
    }
    try {
      const { db } = await import("./db/db");
      if (!db) return { success: false, reason: "no-database" as const };
      const { products } = await import("./db/schema");
      await db
        .insert(products)
        .values({
          id: data.id,
          name: data.name,
          category: data.category,
          price: Math.round(data.price),
          colors: data.colors,
          sizes: data.sizes,
          image: data.image,
          blurb: data.blurb,
        })
        .onConflictDoUpdate({
          target: products.id,
          set: {
            name: data.name,
            category: data.category,
            price: Math.round(data.price),
            colors: data.colors,
            sizes: data.sizes,
            image: data.image,
            blurb: data.blurb,
          },
        });

      return { success: true, product: data };
    } catch (error) {
      console.error("Failed to save product to PostgreSQL database:", error);
      throw error;
    }
  });
