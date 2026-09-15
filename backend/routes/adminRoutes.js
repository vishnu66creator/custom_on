/**
 * Admin API Routes
 */
import { adminController } from "../controllers/adminController.js";

export function setupAdminRoutes(app) {
  app.post("/api/admin/login", adminController.login);
  app.get("/api/admin/stats", adminController.getDashboardStats);
}
