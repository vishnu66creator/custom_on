/**
 * Admin Product Catalog Service
 */
import { getProducts, getProductsAsync, saveCustomProduct } from "@/lib/products-store";
import { PRODUCTS } from "@/lib/products";

// Local storage key for admin-managed product additions/modifications
const ADMIN_PRODUCTS_KEY = "custom_on_admin_products_override";

function getLocalOverrides() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalOverrides(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save product overrides to localStorage", e);
  }
}

export const productService = {
  async getProducts() {
    const base = await getProductsAsync();
    const overrides = getLocalOverrides();
    // Merge base products with any newly added or updated items
    const merged = [...base];
    for (const item of overrides) {
      const idx = merged.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...item };
      } else {
        merged.push(item);
      }
    }
    return merged.filter((p) => !p._deleted);
  },

  async createProduct(productData) {
    const newProduct = {
      id: productData.id || `custom-${Date.now()}`,
      name: productData.name || "New Custom Blank",
      price: Number(productData.price) || 29.99,
      category: productData.category || "Apparel",
      description: productData.description || "",
      image: productData.image || "/products/tshirt-front.png",
      ...productData,
      createdAt: new Date().toISOString(),
    };
    
    await saveCustomProduct(newProduct);
    const overrides = getLocalOverrides();
    overrides.push(newProduct);
    saveLocalOverrides(overrides);
    return newProduct;
  },

  async updateProduct(id, updates) {
    const overrides = getLocalOverrides();
    const idx = overrides.findIndex((p) => p.id === id);
    if (idx >= 0) {
      overrides[idx] = { ...overrides[idx], ...updates, updatedAt: new Date().toISOString() };
    } else {
      overrides.push({ id, ...updates, updatedAt: new Date().toISOString() });
    }
    saveLocalOverrides(overrides);
    return { id, ...updates };
  },

  async deleteProduct(id) {
    const overrides = getLocalOverrides();
    const idx = overrides.findIndex((p) => p.id === id);
    if (idx >= 0) {
      overrides[idx]._deleted = true;
    } else {
      overrides.push({ id, _deleted: true });
    }
    saveLocalOverrides(overrides);
    return { success: true, id };
  },
};

