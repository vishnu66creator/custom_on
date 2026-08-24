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

export function getWishlistProducts(username?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = username ? `customon:wishlist:products:${username}` : "customon:wishlist:products";
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleProductWishlist(productId: string, username?: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const list = getWishlistProducts(username);
    const index = list.indexOf(productId);
    let added = false;
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(productId);
      added = true;
    }
    const key = username ? `customon:wishlist:products:${username}` : "customon:wishlist:products";
    localStorage.setItem(key, JSON.stringify(list));
    return added;
  } catch {
    return false;
  }
}

export function isProductWishlisted(productId: string, username?: string): boolean {
  return getWishlistProducts(username).includes(productId);
}

export function getWishlistDesigns(username?: string): SavedDesign[] {
  if (typeof window === "undefined") return [];
  try {
    const key = username ? `customon:wishlist:designs:${username}` : "customon:wishlist:designs";
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDesignToWishlist(design: Omit<SavedDesign, "id" | "date">, username?: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getWishlistDesigns(username);
    const newDesign: SavedDesign = {
      ...design,
      id: `DSN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
    };
    list.push(newDesign);
    const key = username ? `customon:wishlist:designs:${username}` : "customon:wishlist:designs";
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // noop
  }
}

export function removeDesignFromWishlist(designId: string, username?: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getWishlistDesigns(username);
    const filtered = list.filter((d) => d.id !== designId);
    const key = username ? `customon:wishlist:designs:${username}` : "customon:wishlist:designs";
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {
    // noop
  }
}
