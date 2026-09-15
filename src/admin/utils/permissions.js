/**
 * Admin role-based permission helpers
 */

export const ROLES = {
  ADMIN: "admin",
  SHOP_OWNER: "shop-owner",
  CUSTOMER: "customer",
};

export function canManageProducts(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SHOP_OWNER;
}

export function canManageUsers(user) {
  return user?.role === ROLES.ADMIN;
}

export function canManageSettings(user) {
  return user?.role === ROLES.ADMIN;
}

export function canRefundOrders(user) {
  return user?.role === ROLES.ADMIN;
}

export function hasAdminAccess(user) {
  return user?.role === ROLES.ADMIN || user?.role === ROLES.SHOP_OWNER;
}
