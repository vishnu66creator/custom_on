/**
 * Customer Authentication Middleware
 */
export function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.customon_session;
  if (!token) {
    return res.status(401).json({ success: false, error: "Please sign in to proceed." });
  }
  req.user = { id: "cust-1", role: "customer" };
  next();
}
