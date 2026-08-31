import { PRODUCTS, type Product } from "./products";
import { getDbProducts, resolveProductImage } from "./products-service";

const APPROVED_PRODUCT_IDS = new Set(PRODUCTS.map((product) => product.id));

// In-memory cache for the fixed six-product catalog.
let cachedDbProducts: Product[] | null = null;

function normalizeProductImages(product: Product): Product {
  return {
    ...product,
    image: resolveProductImage(product.image),
    frontImage: product.frontImage
      ? resolveProductImage(product.frontImage)
      : resolveProductImage(product.image),
    backImage: product.backImage
      ? resolveProductImage(product.backImage)
      : resolveProductImage(product.image),
  };
}

function fixedCatalog(products: Product[] = PRODUCTS): Product[] {
  const approved = new Map(
    products
      .filter((product) => APPROVED_PRODUCT_IDS.has(product.id))
      .map((product) => [product.id, product] as const),
  );
  return PRODUCTS.map((product) => normalizeProductImages(approved.get(product.id) ?? product));
}

/**
 * Legacy custom-product storage is intentionally ignored: the customer-facing
 * catalog is permanently limited to the six approved apparel blanks.
 */
export function getCustomProducts(): Product[] {
  return [];
}

/**
 * Retained for compatibility with existing dashboard callers. The fixed catalog
 * does not permit arbitrary new product IDs, so this function deliberately does
 * not persist a seventh product.
 */
export async function saveCustomProduct(_product: Product): Promise<void> {
  console.warn("CustomON catalog is locked to the six approved products.");
}

/** Primary async data access function. */
export async function getProductsAsync(): Promise<Product[]> {
  try {
    const dbItems = await getDbProducts();
    if (dbItems && dbItems.length > 0) {
      cachedDbProducts = fixedCatalog(dbItems);
      return cachedDbProducts;
    }
  } catch (e) {
    console.error("Error fetching products from PostgreSQL database:", e);
  }

  cachedDbProducts = fixedCatalog();
  return cachedDbProducts;
}

/** Synchronous product getter for initial renders and local-only consumers. */
export function getProducts(): Product[] {
  if (cachedDbProducts && cachedDbProducts.length === PRODUCTS.length) {
    return cachedDbProducts;
  }
  cachedDbProducts = fixedCatalog();
  return cachedDbProducts;
}

/** Retained cache helper, constrained to the same six-product boundary. */
export function setCachedProducts(_productsList: Product[]) {
  cachedDbProducts = fixedCatalog();
}
