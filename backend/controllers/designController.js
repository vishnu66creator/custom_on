/**
 * Custom Studio Designs Controller
 */
export const designController = {
  async getDesigns(req, res) {
    return res.json({
      success: true,
      designs: [
        { id: "des-1", title: "Cyberpunk Neon Tee", garment: "Boxy Tee", status: "Approved" },
      ],
    });
  },

  async updateDesignStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    return res.json({ success: true, message: `Design ${id} status set to ${status}` });
  },
};
