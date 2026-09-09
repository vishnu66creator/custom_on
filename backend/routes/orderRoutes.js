/**
 * Order API Routes
 */
import { orderController } from "../controllers/orderController.js";

export function setupOrderRoutes(app) {
  app.get("/api/orders", orderController.getAllOrders);
  app.put("/api/orders/:id/status", orderController.updateOrderStatus);
}
