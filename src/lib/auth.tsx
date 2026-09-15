import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getCurrentCustomer,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  loginWithGoogle as loginWithGoogleFn,
  loginCustomerWithEmail as loginCustomerWithEmailFn,
  registerCustomerWithEmail as registerCustomerWithEmailFn,
  verifyEmailOtp as verifyEmailOtpFn,
  resendEmailOtp as resendEmailOtpFn,
  requestPasswordResetOtp as requestPasswordResetOtpFn,
  verifyPasswordResetOtp as verifyPasswordResetOtpFn,
  resendPasswordResetOtp as resendPasswordResetOtpFn,
  resetPasswordWithToken as resetPasswordWithTokenFn,
  loginAdminWithEmail as loginAdminWithEmailFn,
  requestAdminPasswordResetOtp as requestAdminPasswordResetOtpFn,
  verifyAdminPasswordResetOtp as verifyAdminPasswordResetOtpFn,
  resendAdminPasswordResetOtp as resendAdminPasswordResetOtpFn,
  resetAdminPasswordWithToken as resetAdminPasswordWithTokenFn,
} from "./db/app-service";

export type Role = "customer" | "shop-owner" | "admin";

export interface User {
  id: string;
  username: string;
  role: Role;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  emailVerified?: boolean;
}

export interface RegisterPayload {
  email?: string;
  name: string;
  phone?: string;
  password?: string;
  role?: Role;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    identifierOrEmail: string,
    role: Role,
    password?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    error?: string;
    requireVerification?: boolean;
    unverifiedEmail?: string;
  }>;
  registerWithEmail: (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    phone?: string,
  ) => Promise<{
    success: boolean;
    error?: string;
    email?: string;
    requireVerification?: boolean;
  }>;
  verifyEmailOtp: (
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  resendEmailOtp: (
    email: string,
  ) => Promise<{ success: boolean; error?: string; resendInSeconds?: number }>;
  requestPasswordResetOtp: (
    email: string,
  ) => Promise<{ success: boolean; error?: string; message?: string; resendInSeconds?: number }>;
  verifyPasswordResetOtp: (
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; error?: string; resetToken?: string }>;
  resendPasswordResetOtp: (
    email: string,
  ) => Promise<{ success: boolean; error?: string; resendInSeconds?: number }>;
  resetPasswordWithToken: (
    email: string,
    resetToken: string,
    newPassword: string,
    confirmPassword?: string,
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  loginAdminWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  requestAdminPasswordResetOtp: (
    email: string,
  ) => Promise<{ success: boolean; error?: string; message?: string; resendInSeconds?: number }>;
  verifyAdminPasswordResetOtp: (
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; error?: string; resetToken?: string }>;
  resendAdminPasswordResetOtp: (
    email: string,
  ) => Promise<{ success: boolean; error?: string; resendInSeconds?: number }>;
  resetAdminPasswordWithToken: (
    email: string,
    resetToken: string,
    newPassword: string,
    confirmPassword?: string,
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  loginWithGoogle: (
    credentialOrPayload: string | { credential?: string; accessToken?: string },
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  registerUser: (
    inputOrUsername: RegisterPayload | string,
    roleArg?: Role,
    passwordArg?: string,
    nameArg?: string,
    phoneArg?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<User | null>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const current = await getCurrentCustomer();
      setUser(current);
      return current;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

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

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await loginCustomerWithEmailFn({
        data: { email, password },
      });
      if (result.success && "user" in result && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error("Email login failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    phone?: string,
  ) => {
    try {
      const result = await registerCustomerWithEmailFn({
        data: { name, email, password, confirmPassword, phone },
      });
      return result;
    } catch (error) {
      console.error("Email registration failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const verifyEmailOtp = async (email: string, otp: string) => {
    try {
      const result = await verifyEmailOtpFn({
        data: { email, otp },
      });
      if (result.success && "user" in result && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error("Email OTP verification failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const resendEmailOtp = async (email: string) => {
    try {
      const result = await resendEmailOtpFn({
        data: { email },
      });
      return result;
    } catch (error) {
      console.error("Resend email OTP failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const requestPasswordResetOtp = async (email: string) => {
    try {
      const result = await requestPasswordResetOtpFn({
        data: { email },
      });
      return result;
    } catch (error) {
      console.error("Request password reset failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const verifyPasswordResetOtp = async (email: string, otp: string) => {
    try {
      const result = await verifyPasswordResetOtpFn({
        data: { email, otp },
      });
      return result;
    } catch (error) {
      console.error("Verify password reset OTP failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const resendPasswordResetOtp = async (email: string) => {
    try {
      const result = await resendPasswordResetOtpFn({
        data: { email },
      });
      return result;
    } catch (error) {
      console.error("Resend password reset OTP failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const resetPasswordWithToken = async (
    email: string,
    resetToken: string,
    newPassword: string,
    confirmPassword?: string,
  ) => {
    try {
      const result = await resetPasswordWithTokenFn({
        data: { email, resetToken, newPassword, confirmPassword },
      });
      return result;
    } catch (error) {
      console.error("Reset password with token failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const loginAdminWithEmail = async (email: string, password: string) => {
    try {
      const result = await loginAdminWithEmailFn({
        data: { email, password },
      });
      if (result.success && "user" in result && result.user) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error("Admin login failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const requestAdminPasswordResetOtp = async (email: string) => {
    try {
      const result = await requestAdminPasswordResetOtpFn({
        data: { email },
      });
      return result;
    } catch (error) {
      console.error("Admin password reset request failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const verifyAdminPasswordResetOtp = async (email: string, otp: string) => {
    try {
      const result = await verifyAdminPasswordResetOtpFn({
        data: { email, otp },
      });
      return result;
    } catch (error) {
      console.error("Admin OTP verification failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const resendAdminPasswordResetOtp = async (email: string) => {
    try {
      const result = await resendAdminPasswordResetOtpFn({
        data: { email },
      });
      return result;
    } catch (error) {
      console.error("Admin resend OTP failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const resetAdminPasswordWithToken = async (
    email: string,
    resetToken: string,
    newPassword: string,
    confirmPassword?: string,
  ) => {
    try {
      const result = await resetAdminPasswordWithTokenFn({
        data: { email, resetToken, newPassword, confirmPassword },
      });
      return result;
    } catch (error) {
      console.error("Admin reset password failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return { success: false, error: sanitizeError(msg) };
    }
  };

  const login = async (identifierOrEmail: string, role: Role, password?: string) => {
    try {
      const result = await loginCustomer({
        data: {
          email: identifierOrEmail,
          username: identifierOrEmail,
          role,
          ...(password !== undefined ? { password } : {}),
        },
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

  const loginWithGoogle = async (
    credentialOrPayload: string | { credential?: string; accessToken?: string },
  ) => {
    try {
      const payload =
        typeof credentialOrPayload === "string"
          ? { credential: credentialOrPayload }
          : credentialOrPayload;

      const result = await loginWithGoogleFn({
        data: payload,
      });
      if (!result.success) return result;
      setUser(result.user);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Google sign-in failed", error);
      const msg = error instanceof Error ? error.message : undefined;
      return {
        success: false,
        error: sanitizeError(msg) || "Google sign-in was cancelled or could not be completed.",
      };
    }
  };

  const registerUser = async (
    inputOrUsername: RegisterPayload | string,
    roleArg?: Role,
    passwordArg?: string,
    nameArg?: string,
    phoneArg?: string,
  ) => {
    try {
      let data: {
        email?: string;
        username?: string;
        name: string;
        phone?: string;
        role?: Role;
        password?: string;
      };

      if (typeof inputOrUsername === "object" && inputOrUsername !== null) {
        data = {
          email: inputOrUsername.email,
          username: inputOrUsername.username || inputOrUsername.email,
          name: inputOrUsername.name,
          phone: inputOrUsername.phone,
          role: inputOrUsername.role || "customer",
          password: inputOrUsername.password,
        };
      } else {
        data = {
          username: inputOrUsername,
          email: inputOrUsername,
          role: roleArg || "customer",
          password: passwordArg,
          name: nameArg || "",
          phone: phoneArg,
        };
      }

      const result = await registerCustomer({ data });
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
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithEmail,
        registerWithEmail,
        verifyEmailOtp,
        resendEmailOtp,
        requestPasswordResetOtp,
        verifyPasswordResetOtp,
        resendPasswordResetOtp,
        resetPasswordWithToken,
        loginAdminWithEmail,
        requestAdminPasswordResetOtp,
        verifyAdminPasswordResetOtp,
        resendAdminPasswordResetOtp,
        resetAdminPasswordWithToken,
        loginWithGoogle,
        logout,
        registerUser,
        refreshSession,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

