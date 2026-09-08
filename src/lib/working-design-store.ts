import type { TargetGroup, GarmentSide } from "./garments";

export type BaseLayer = {
  id: string;
  side: GarmentSide;
  x: number;
  y: number;
  width: number;
  rotation: number;
  opacity: number;
};

export type TextLayer = BaseLayer & {
  type: "text";
  text: string;
  font: string;
  color: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: "left" | "center" | "right";
  letterSpacing: number;
};

export type ImageLayer = BaseLayer & {
  type: "image";
  src: string;
  name: string;
};

export type ShapeKind = "square" | "circle" | "triangle";

export type ShapeLayer = BaseLayer & {
  type: "shape";
  kind: ShapeKind;
  color: string;
};

export type Layer = TextLayer | ImageLayer | ShapeLayer;

export type FullDesignState = {
  version: 1;
  productId: string;
  color: string;
  colorName: string;
  size: string;
  targetGroup: TargetGroup;
  side: GarmentSide;
  layers: Layer[];
  quantity: number;
  unitPrice: number;
  updatedAt?: string;
};

const WORKING_DESIGN_KEY = "customon_current_working_design";
const PRODUCT_DRAFTS_KEY_PREFIX = "customon_draft_";

export function saveWorkingDesign(design: FullDesignState): void {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ ...design, updatedAt: new Date().toISOString() });
    window.sessionStorage?.setItem(WORKING_DESIGN_KEY, payload);
    window.localStorage?.setItem(WORKING_DESIGN_KEY, payload);
    if (design.productId) {
      saveProductDraft(design.productId, design);
    }
  } catch (err) {
    console.error("Failed to save working design to local storage", err);
  }
}

export function getWorkingDesign(): FullDesignState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.sessionStorage?.getItem(WORKING_DESIGN_KEY) ||
      window.localStorage?.getItem(WORKING_DESIGN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FullDesignState;
    if (parsed && Array.isArray(parsed.layers) && parsed.productId) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to read working design from local storage", err);
  }
  return null;
}

export function clearWorkingDesign(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage?.removeItem(WORKING_DESIGN_KEY);
    window.localStorage?.removeItem(WORKING_DESIGN_KEY);
  } catch (err) {
    console.error("Failed to clear working design from local storage", err);
  }
}

export function saveProductDraft(productId: string, draft: FullDesignState): void {
  if (typeof window === "undefined" || !productId) return;
  try {
    const key = `${PRODUCT_DRAFTS_KEY_PREFIX}${productId}`;
    const payload = JSON.stringify({ ...draft, productId, updatedAt: new Date().toISOString() });
    window.sessionStorage?.setItem(key, payload);
    window.localStorage?.setItem(key, payload);
  } catch (err) {
    console.error(`Failed to save product draft for ${productId}`, err);
  }
}

export function getProductDraft(productId: string): FullDesignState | null {
  if (typeof window === "undefined" || !productId) return null;
  try {
    const key = `${PRODUCT_DRAFTS_KEY_PREFIX}${productId}`;
    const raw = window.sessionStorage?.getItem(key) || window.localStorage?.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FullDesignState;
    if (parsed && Array.isArray(parsed.layers)) {
      return parsed;
    }
  } catch (err) {
    console.error(`Failed to read product draft for ${productId}`, err);
  }
  return null;
}

export function getAllProductDrafts(): Record<string, FullDesignState> {
  if (typeof window === "undefined") return {};
  const drafts: Record<string, FullDesignState> = {};
  try {
    const storage = window.sessionStorage || window.localStorage;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(PRODUCT_DRAFTS_KEY_PREFIX)) {
        const productId = key.replace(PRODUCT_DRAFTS_KEY_PREFIX, "");
        const draft = getProductDraft(productId);
        if (draft) {
          drafts[productId] = draft;
        }
      }
    }
  } catch (err) {
    console.error("Failed to retrieve all product drafts", err);
  }
  return drafts;
}

export function clearProductDraft(productId: string): void {
  if (typeof window === "undefined" || !productId) return;
  try {
    const key = `${PRODUCT_DRAFTS_KEY_PREFIX}${productId}`;
    window.sessionStorage?.removeItem(key);
    window.localStorage?.removeItem(key);
  } catch (err) {
    console.error(`Failed to clear product draft for ${productId}`, err);
  }
}

export function clearAllProductDrafts(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    const storage = window.sessionStorage || window.localStorage;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(PRODUCT_DRAFTS_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => {
      window.sessionStorage?.removeItem(key);
      window.localStorage?.removeItem(key);
    });
  } catch (err) {
    console.error("Failed to clear all product drafts", err);
  }
}

