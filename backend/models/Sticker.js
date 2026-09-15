/**
 * Sticker & Clipart Model
 */
export const StickerModel = {
  tableName: "stickers",
  schema: {
    id: "string",
    name: "string",
    category: "string",
    icon: "string",
    svgUrl: "string",
    downloads: "number",
    createdAt: "timestamp",
  },
};
