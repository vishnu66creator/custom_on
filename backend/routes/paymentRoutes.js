/**
 * Payments & Gateway Routes
 */
import { paymentController } from "../controllers/paymentController.js";

export function setupPaymentRoutes(app) {
  app.get("/api/payments", paymentController.getTransactions);
  app.post("/api/payments/:id/refund", paymentController.refund);
}
