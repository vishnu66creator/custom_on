/**
 * Admin Custom Design Service
 */

export const designService = {
  async getCustomDesigns() {
    try {
      const stored = localStorage.getItem("customon_saved_designs");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },

  async approveDesign(id) {
    const designs = await this.getCustomDesigns();
    const updated = designs.map((d) => (d.id === id ? { ...d, status: "Approved" } : d));
    localStorage.setItem("customon_saved_designs", JSON.stringify(updated));
    return { success: true, designs: updated };
  },

  async rejectDesign(id, reason = "Resolution too low") {
    const designs = await this.getCustomDesigns();
    const updated = designs.map((d) => (d.id === id ? { ...d, status: "Rejected", reason } : d));
    localStorage.setItem("customon_saved_designs", JSON.stringify(updated));
    return { success: true, designs: updated };
  },
};
