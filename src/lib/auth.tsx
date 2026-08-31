import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentCustomer,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from "./db/app-service";

export type Role = "customer" | "shop-owner";

export interface User {
  id: string;
  username: string;
  role: Role;
  name?: string;
  email?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    username: string,
    role: Role,
    password?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  registerUser: (
    username: string,
    role: Role,
    password?: string,
    name?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCurrentCustomer()
      .then((current) => {
        if (active) setUser(current);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function sanitizeError(msg?: string): string {
    if (!msg) return "Unable to connect to the account service.";
    const lower = msg.toLowerCase();
    if (
      lower.includes("failed query") ||
      lower.includes("select ") ||
      lower.includes("insert ") ||
      lower.includes("update ") ||
      lower.includes("delete ") ||
      lower.includes("postgres") ||
      lower.includes("relation ") ||
      lower.includes("table ")
    ) {
      return "Unable to connect to the account service.";
    }
    return msg;
  }

  const login = async (username: string, role: Role, password?: string) => {
    try {
      const result = await loginCustomer({
        data: { username, role, ...(password !== undefined ? { password } : {}) },
      });
      if (!result.success) return result;
      setUser(result.user);
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const registerUser = async (username: string, role: Role, password?: string, name?: string) => {
    try {
      const result = await registerCustomer({
        data: {
          username,
          role,
          name: name?.trim() ?? "",
          ...(password !== undefined ? { password } : {}),
        },
      });
      if (!result.success) return result;
      setUser(result.user);
      return { success: true };
    } catch (error) {
      console.error("Registration failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      await logoutCustomer();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
