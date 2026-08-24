import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "customer" | "shop-owner";

export interface User {
  username: string;
  role: Role;
  name?: string;
}

export interface RegisteredUser {
  username: string;
  password?: string;
  role: Role;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, role: Role, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  registerUser: (username: string, role: Role, password?: string, name?: string) => { success: boolean; error?: string };
  isLoading: boolean;
}

const DEFAULT_USERS: RegisteredUser[] = [
  { username: "7090637746", password: "password", role: "customer", name: "Demo Customer" },
  { username: "owner_jdoe", password: "password", role: "shop-owner", name: "John Doe" }
];

const getRegisteredUsers = (): RegisteredUser[] => {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const stored = localStorage.getItem("customon:users");
    if (!stored) {
      localStorage.setItem("customon:users", JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load users", e);
    return DEFAULT_USERS;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Initialize users if they don't exist yet
        if (!localStorage.getItem("customon:users")) {
          localStorage.setItem("customon:users", JSON.stringify(DEFAULT_USERS));
        }

        const storedUser = localStorage.getItem("customon:auth");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load auth state from localStorage", e);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (username: string, role: Role, password?: string): { success: boolean; error?: string } => {
    const users = getRegisteredUsers();
    const userMatch = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.role === role
    );

    if (!userMatch) {
      return { success: false, error: "User not registered. Please register first." };
    }

    if (password && userMatch.password && userMatch.password !== password) {
      return { success: false, error: "Incorrect password." };
    }

    const newUser = { username: userMatch.username, role: userMatch.role, name: userMatch.name };
    setUser(newUser);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("customon:auth", JSON.stringify(newUser));
      } catch (e) {
        console.error("Failed to save auth state to localStorage", e);
      }
    }
    return { success: true };
  };

  const registerUser = (
    username: string,
    role: Role,
    password?: string,
    name?: string
  ): { success: boolean; error?: string } => {
    const users = getRegisteredUsers();
    
    // Check if user already exists (globally or within role, checking globally is safer)
    const exists = users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
      return { success: false, error: "This username or phone number is already registered." };
    }

    const newUser: RegisteredUser = { username, role, password, name };
    const updatedUsers = [...users, newUser];
    
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("customon:users", JSON.stringify(updatedUsers));
      } catch (e) {
        console.error("Failed to save users to localStorage", e);
        return { success: false, error: "Failed to save user registration." };
      }
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("customon:auth");
      } catch (e) {
        console.error("Failed to remove auth state from localStorage", e);
      }
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
