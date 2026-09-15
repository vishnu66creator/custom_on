import { useState, useEffect, useCallback } from "react";
import { productService } from "../services/productService";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const prods = await productService.getProducts();
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (e) {
      console.warn("fetchProducts hook error:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (data) => {
    const res = await productService.createProduct(data);
    await fetchProducts();
    return res;
  };

  const updateProduct = async (id, data) => {
    const res = await productService.updateProduct(id, data);
    await fetchProducts();
    return res;
  };

  const deleteProduct = async (id) => {
    const res = await productService.deleteProduct(id);
    await fetchProducts();
    return res;
  };

  return {
    products,
    loading,
    refresh: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
