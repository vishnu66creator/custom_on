/**
 * Promo Coupon Data Model
 */
export const CouponModel = {
  tableName: "coupons",
  schema: {
    id: "string",
    code: "string",
    discount: "number",
    type: "percentage", // percentage | fixed
    active: "boolean",
    usesCount: "number",
    expiresAt: "timestamp",
  },
};
