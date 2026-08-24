import { PRODUCTS, type Product } from "./products";

const STORAGE_KEY = "customon:custom-products";

export function getCustomProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load custom products from localStorage", e);
    return [];
  }
}

export function saveCustomProduct(product: Product) {
  if (typeof window === "undefined") return;
  try {
    const current = getCustomProducts();
    const updated = [product, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save custom product to localStorage", e);
  }
}

export function getProducts(): Product[] {
  const custom = getCustomProducts();
  // Filter out any custom products that have the same ID as default ones to prevent duplicates
  const defaultIds = new Set(PRODUCTS.map((p) => p.id));
  const filteredCustom = custom.filter((p) => !defaultIds.has(p.id));
  return [...filteredCustom, ...PRODUCTS];
}
