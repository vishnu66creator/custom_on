import {
  getCustomerSavedDesigns,
  getCustomerWishlist,
  removeCustomerDesign,
  saveCustomerDesign,
  toggleCustomerWishlist,
} from "./db/app-service";

export interface SavedDesign {
  id: string;
  date: string;
  productId: string;
  productName: string;
  shirtColor: string;
  shirtColorName: string;
  customText: string;
  customTextColor: string;
  customTextFont: string;
  customTextSize: number;
  customImage: string | null;
  price: number;
}

export function getWishlistProducts(_username?: string): Promise<string[]> {
  return getCustomerWishlist();
}

export async function toggleProductWishlist(
  productId: string,
  _username?: string,
): Promise<boolean> {
  const result = await toggleCustomerWishlist({ data: { productId } });
  return result.added;
}

export async function isProductWishlisted(productId: string, _username?: string): Promise<boolean> {
  const ids = await getWishlistProducts();
  return ids.includes(productId);
}

export async function getWishlistDesigns(_username?: string): Promise<SavedDesign[]> {
  const rows = await getCustomerSavedDesigns();
  return rows.map((row) => ({ ...row, date: row.createdAt }));
}

export async function saveDesignToWishlist(
  design: Omit<SavedDesign, "id" | "date">,
  _username?: string,
): Promise<SavedDesign> {
  const saved = await saveCustomerDesign({ data: design });
  return { ...saved, date: saved.createdAt };
}

export function removeDesignFromWishlist(
  designId: string,
  _username?: string,
): Promise<{ success: boolean }> {
  return removeCustomerDesign({ data: { id: designId } });
}
