import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Custom On" },
      {
        name: "description",
        content: "Private Administration Portal for Custom On.",
      },
    ],
  }),
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRootAdmin = location.pathname === "/admin" || location.pathname === "/admin/";

  useEffect(() => {
    if (isRootAdmin && !isLoading) {
      if (user && (user.role === "admin" || user.role === "shop-owner")) {
        navigate({ to: "/admin/dashboard" });
      } else {
        navigate({ to: "/admin/login" });
      }
    }
  }, [isRootAdmin, user, isLoading, navigate]);

  if (isRootAdmin && isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0b0d] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange/10 border border-brand-orange/30">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 animate-pulse">
            Connecting to Admin Portal...
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
