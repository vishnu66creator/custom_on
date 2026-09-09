/**
 * Customer Catalog & Product Browsing Service
 */
import { getProducts, getProductsAsync } from "@/lib/products-store";

export const customerCatalogService = {
  async getAllProducts() {
    return await getProductsAsync();
  },

  getFeaturedProducts() {
    return getProducts().slice(0, 4);
  },

  getProductById(id) {
    return getProducts().find((p) => p.id === id) || null;
  },
};
