/**
 * Customer Cart & Checkout Service
 */
import { getCart, addToCart, removeFromCart, updateCartQuantity, clearCart } from "@/lib/cart-store";

export const customerCartService = {
  getCart() {
    return getCart();
  },

  addItem(item) {
    return addToCart(item);
  },

  removeItem(id) {
    return removeFromCart(id);
  },

  updateQuantity(id, qty) {
    return updateCartQuantity(id, qty);
  },

  clear() {
    return clearCart();
  },
};
