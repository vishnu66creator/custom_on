/**
 * Admin data formatting utilities
 */

export function formatCurrency(amount, currency = "USD") {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(num);
}

export function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatOrderId(id) {
  if (!id) return "#ORD-0000";
  const clean = String(id).toUpperCase();
  if (clean.startsWith("ORD-")) return `#${clean}`;
  return `#ORD-${clean.slice(0, 8)}`;
}

export function formatStatus(status) {
  if (!status) return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
