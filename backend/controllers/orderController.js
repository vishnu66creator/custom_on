/**
 * Order Fulfillment Controller
 */
export const orderController = {
  async getAllOrders(req, res) {
    return res.json({
      success: true,
      orders: [
        { id: "ORD-948271", total: 64.99, status: "paid", createdAt: "2026-03-08" },
        { id: "ORD-948272", total: 129.50, status: "processing", createdAt: "2026-03-08" },
      ],
    });
  },

  async updateOrderStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    return res.json({ success: true, message: `Order ${id} updated to ${status}` });
  },
};
