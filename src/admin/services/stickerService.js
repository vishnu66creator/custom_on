/**
 * Admin Sticker & Clipart Service
 */

export const stickerService = {
  async getStickers() {
    try {
      const stored = localStorage.getItem("admin_stickers_data");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: "stk-1", name: "Retro Skull", category: "Vintage", icon: "💀", downloads: 420 },
      { id: "stk-2", name: "Lightning Bolt", category: "Abstract", icon: "⚡", downloads: 890 },
      { id: "stk-3", name: "Fire Flame", category: "Elements", icon: "🔥", downloads: 1250 },
      { id: "stk-4", name: "Cosmic Star", category: "Space", icon: "⭐", downloads: 610 },
    ];
  },

  async addSticker(sticker) {
    const list = await this.getStickers();
    const item = { ...sticker, id: `stk-${Date.now()}`, downloads: 0 };
    const updated = [item, ...list];
    localStorage.setItem("admin_stickers_data", JSON.stringify(updated));
    return { success: true, stickers: updated };
  },

  async deleteSticker(id) {
    const list = await this.getStickers();
    const updated = list.filter((s) => s.id !== id);
    localStorage.setItem("admin_stickers_data", JSON.stringify(updated));
    return { success: true, stickers: updated };
  },
};
