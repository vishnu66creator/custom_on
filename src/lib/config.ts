/**
 * Utility functions for resolving Customer (port 5173) and Admin (port 5174) URLs.
 */

export const CUSTOMER_PORT = 5173;
export const ADMIN_PORT = 5174;

export function getCustomerUrl(path: string = "/"): string {
  const envUrl = process.env["VITE_CUSTOMER_URL"];
  if (envUrl) {
    const cleanBase = envUrl.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${protocol}//${hostname}:${CUSTOMER_PORT}${cleanPath}`;
  }

  return `http://localhost:${CUSTOMER_PORT}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getAdminUrl(path: string = "/admin/login"): string {
  const envUrl = process.env["VITE_ADMIN_URL"];
  if (envUrl) {
    const cleanBase = envUrl.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${protocol}//${hostname}:${ADMIN_PORT}${cleanPath}`;
  }

  return `http://localhost:${ADMIN_PORT}${path.startsWith("/") ? path : `/${path}`}`;
}
