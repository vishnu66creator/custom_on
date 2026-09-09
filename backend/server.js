/**
 * Standalone Custom On API Server
 */
import http from "node:http";
import { config } from "./config/environment.js";
import { setupAdminRoutes } from "./routes/adminRoutes.js";
import { setupUserRoutes } from "./routes/userRoutes.js";
import { setupProductRoutes } from "./routes/productRoutes.js";
import { setupOrderRoutes } from "./routes/orderRoutes.js";
import { setupDesignRoutes } from "./routes/designRoutes.js";
import { setupPaymentRoutes } from "./routes/paymentRoutes.js";

const routes = [];

const app = {
  get(path, handler) {
    routes.push({ method: "GET", path, handler });
  },
  post(path, handler) {
    routes.push({ method: "POST", path, handler });
  },
  put(path, handler) {
    routes.push({ method: "PUT", path, handler });
  },
  delete(path, handler) {
    routes.push({ method: "DELETE", path, handler });
  },
};

// Register all modular API routes
setupAdminRoutes(app);
setupUserRoutes(app);
setupProductRoutes(app);
setupOrderRoutes(app);
setupDesignRoutes(app);
setupPaymentRoutes(app);

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = routes.find((r) => r.method === req.method && r.path === url.pathname);

  // Helper response methods
  res.json = (data) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  if (match) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch {
        req.body = {};
      }
      req.params = {};
      try {
        await match.handler(req, res);
      } catch (err) {
        console.error("Handler error:", err);
        res.status(500).json({ success: false, error: err.message });
      }
    });
  } else {
    res.status(404).json({ success: false, error: "API endpoint not found." });
  }
});

const PORT = config.port || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Custom On Backend API listening on port ${PORT}`);
});

export default server;
