import {
  addCustomerCartItem,
  clearCustomerCart,
  getCustomerCart,
  removeCustomerCartItem,
  setCustomerCartQuantity,
} from "./db/app-service";

import type { FullDesignState } from "./working-design-store";

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  color: string;
  colorName: string;
  size: string;
  targetGroup: "Men";
  quantity: number;
  unitPrice: number;
  frontPreview: string | null;
  backPreview: string | null;
  summary: string;
  designState?: FullDesignState | Record<string, unknown> | null;
};

export function getCart(): Promise<CartItem[]> {
  return getCustomerCart();
}

export function addToCart(item: Omit<CartItem, "id">): Promise<CartItem> {
  return addCustomerCartItem({ data: item });
}

export function removeFromCart(id: string): Promise<{ success: boolean }> {
  return removeCustomerCartItem({ data: { id } });
}

export function setCartQuantity(id: string, quantity: number): Promise<{ success: boolean }> {
  return setCustomerCartQuantity({ data: { id, quantity } });
}

export function clearCart(): Promise<{ success: boolean }> {
  return clearCustomerCart();
}

export function cartCount(items: CartItem[] = []): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(items: CartItem[] = []): number {
  return items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
}
