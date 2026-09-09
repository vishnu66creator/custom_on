/**
 * Payment Controller
 */
export const paymentController = {
  async getTransactions(req, res) {
    return res.json({
      success: true,
      transactions: [
        { id: "tx-1001", orderId: "ORD-948271", amount: 64.99, status: "Captured" },
      ],
    });
  },

  async refund(req, res) {
    const { id } = req.params;
    return res.json({ success: true, message: `Refund initiated for transaction ${id}` });
  },
};
