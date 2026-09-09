import React, { createContext, useContext } from "react";
import { useAuth } from "@/lib/auth";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const auth = useAuth();
  const isAdmin = auth.user && (auth.user.role === "admin" || auth.user.role === "shop-owner");

  return (
    <AdminAuthContext.Provider value={{ ...auth, isAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an AdminAuthProvider");
  }
  return context;
}
