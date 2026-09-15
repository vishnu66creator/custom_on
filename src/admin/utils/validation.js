/**
 * Admin input validation utilities
 */

export function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password) {
  return typeof password === "string" && password.length >= 6;
}

export function validateProductForm(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = "Product name is required";
  if (data.price === undefined || isNaN(Number(data.price)) || Number(data.price) <= 0) {
    errors.price = "Valid price is required";
  }
  if (!data.category || !data.category.trim()) errors.category = "Category is required";
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCouponForm(data) {
  const errors = {};
  if (!data.code || !data.code.trim()) errors.code = "Coupon code is required";
  if (data.discount === undefined || isNaN(Number(data.discount)) || Number(data.discount) <= 0) {
    errors.discount = "Discount value is required";
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
