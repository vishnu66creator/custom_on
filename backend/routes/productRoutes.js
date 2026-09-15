/**
 * Product API Routes
 */
import { productController } from "../controllers/productController.js";

export function setupProductRoutes(app) {
  app.get("/api/products", productController.getAllProducts);
  app.post("/api/products", productController.createProduct);
  app.put("/api/products/:id", productController.updateProduct);
  app.delete("/api/products/:id", productController.deleteProduct);
}
