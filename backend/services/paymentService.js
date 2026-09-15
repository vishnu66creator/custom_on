/**
 * Payment Gateway Processing Service
 */
export const paymentService = {
  async processPayment({ orderId, amount, paymentMethod }) {
    return {
      success: true,
      transactionId: `tx-${Date.now()}`,
      status: "Captured",
      amount,
      orderId,
      paidAt: new Date().toISOString(),
    };
  },

  async refundPayment(transactionId) {
    return {
      success: true,
      transactionId,
      status: "Refunded",
      refundedAt: new Date().toISOString(),
    };
  },
};
