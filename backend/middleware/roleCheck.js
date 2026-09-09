/**
 * Role Check Middleware
 */
export function roleCheck(allowedRoles = ["admin"]) {
  return (req, res, next) => {
    const userRole = req.admin?.role || req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, error: "403 Forbidden: Insufficient administrative privileges." });
    }
    next();
  };
}
