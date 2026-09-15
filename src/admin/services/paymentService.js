/**
 * Admin Payments & Transactions Service
 */

export const paymentService = {
  async getPayments() {
    return [
      { id: "tx-1001", orderId: "ORD-948271", customer: "Alex Morgan", amount: 64.99, method: "Credit Card (Stripe)", status: "Captured", date: "2026-03-08 14:23" },
      { id: "tx-1002", orderId: "ORD-948272", customer: "Jordan Lee", amount: 129.50, method: "PayPal", status: "Captured", date: "2026-03-08 12:45" },
      { id: "tx-1003", orderId: "ORD-948273", customer: "Samantha Cole", amount: 48.00, method: "Google Pay", status: "Captured", date: "2026-03-07 19:10" },
      { id: "tx-1004", orderId: "ORD-948274", customer: "David Chen", amount: 85.20, method: "Credit Card", status: "Refunded", date: "2026-03-06 09:30" },
    ];
  },

  async refundPayment(transactionId) {
    return { success: true, message: `Transaction ${transactionId} refunded successfully.` };
  },
};
