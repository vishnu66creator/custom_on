import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { getCustomerUrl } from "@/lib/config";
import { ShieldAlert, Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user && (user.role === "admin" || user.role === "shop-owner");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/admin/login" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0b0d] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange/10 border border-brand-orange/30">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 animate-pulse">
            Verifying Admin Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0d] px-4 py-16 text-white">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-red-500/20 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/80 border border-red-800/50 text-red-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400">
            403 Forbidden
          </span>
          <h1 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight text-white">
            Access Denied
          </h1>
          <p className="mt-3 text-xs leading-relaxed text-white/60">
            Your account does not have administrative privileges. Only authorized store managers and system administrators can view this portal.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = getCustomerUrl("/");
                } else {
                  navigate({ to: "/" });
                }
              }}
              className="w-full rounded-xl bg-brand-orange py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-orange-600 cursor-pointer"
            >
              Return to Store (Port 5173)
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/admin/login" })}
              className="w-full rounded-xl border border-white/10 py-3 text-xs font-bold uppercase tracking-widest text-white/70 hover:bg-white/5 transition cursor-pointer"
            >
              Sign In as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
