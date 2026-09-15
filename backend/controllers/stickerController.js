/**
 * Clipart & Sticker Controller
 */
export const stickerController = {
  async getStickers(req, res) {
    return res.json({
      success: true,
      stickers: [
        { id: "stk-1", name: "Retro Skull", icon: "💀", category: "Vintage" },
        { id: "stk-2", name: "Lightning Bolt", icon: "⚡", category: "Abstract" },
      ],
    });
  },

  async addSticker(req, res) {
    const item = { id: `stk-${Date.now()}`, ...req.body };
    return res.status(201).json({ success: true, sticker: item });
  },
};
