/**
 * Admin Custom Design Service
 */

export const designService = {
  async getCustomDesigns() {
    try {
      const stored = localStorage.getItem("customon_saved_designs");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: "des-1", title: "Cyberpunk Neon Tee", customer: "Alex Morgan", garment: "Heavyweight Boxy Tee", color: "Black", status: "Approved", createdAt: "2026-03-05" },
      { id: "des-2", title: "Vintage Club Emblem", customer: "Jordan Lee", garment: "Pullover Hoodie", color: "Vintage Wash", status: "Pending Review", createdAt: "2026-03-07" },
      { id: "des-3", title: "Minimal Typo Badge", customer: "Samantha Cole", garment: "Polo Shirt", color: "Navy", status: "Approved", createdAt: "2026-03-08" },
    ];
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
