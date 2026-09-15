/**
 * Studio Custom Design Routes
 */
import { designController } from "../controllers/designController.js";

export function setupDesignRoutes(app) {
  app.get("/api/designs", designController.getDesigns);
  app.put("/api/designs/:id/status", designController.updateDesignStatus);
}
