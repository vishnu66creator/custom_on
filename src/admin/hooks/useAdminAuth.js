import { useAuth } from "@/lib/auth";

export function useAdminAuth() {
  const auth = useAuth();
  const isAdmin = auth.user && (auth.user.role === "admin" || auth.user.role === "shop-owner");

  return {
    user: auth.user,
    isAdmin,
    isLoading: auth.isLoading,
    loginAdmin: auth.loginAdminWithEmail,
    logout: auth.logout,
  };
}
