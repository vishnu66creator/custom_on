/**
 * User API Routes
 */
import { userController } from "../controllers/userController.js";

export function setupUserRoutes(app) {
  app.get("/api/users", userController.getAllUsers);
  app.put("/api/users/:id/role", userController.updateUserRole);
}
