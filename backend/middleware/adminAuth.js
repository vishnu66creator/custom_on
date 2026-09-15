/**
 * Admin Authentication Middleware
 */
export function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.customon_session;
  if (!token) {
    return res.status(401).json({ success: false, error: "Access denied. Authentication token required." });
  }
  // In demo / fallback mode, pass through
  req.admin = { id: "admin-1", role: "admin", email: "admin@customon.in" };
  next();
}
