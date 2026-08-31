import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";
import { Store as StoreIcon, ShieldAlert, Lock } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — Custom On" },
      {
        name: "description",
        content: "Private Shop Owner & Administration Portal for Custom On.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, login, registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Redirect to dashboard if logged in as shop-owner once session loading completes
  useEffect(() => {
    if (!isLoading && user?.role === "shop-owner") {
      navigate({ to: "/dashboard" });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Admin Username / ID is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    // Try logging in as shop-owner
    let res = await login(trimmedUsername, "shop-owner", password);
    if (!res.success) {
      // If user does not exist yet, allow initializing default admin account
      if (trimmedUsername === "admin" && password.length >= 4) {
        const regRes = await registerUser(trimmedUsername, "shop-owner", password, "System Admin");
        if (regRes.success) {
          res = regRes;
        }
      }
    }

    if (!res.success) {
      setError(res.error || "Invalid Shop Owner credentials.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, 600);
  };

  return (
    <PageShell>
      <div className="flex min-h-[85vh] items-center justify-center bg-brand-black px-4 py-16 text-white">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-brand">
              <Lock className="h-7 w-7" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">
              Restricted Access
            </span>
            <h1 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight">
              Admin Portal
            </h1>
            <p className="mt-2 text-xs text-white/50">
              Sign in to manage catalog products, custom orders, and store configuration.
            </p>
          </div>

          {success ? (
            <div className="space-y-4 py-8 text-center animate-fade-in">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange text-white">
                ✓
              </div>
              <h2 className="text-xl font-bold uppercase">Authorized</h2>
              <p className="text-sm text-white/60">Opening Administration Dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-800/50 p-3 text-xs font-medium text-red-300">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="admin-username"
                  className="block text-xs font-bold uppercase tracking-wider text-white/60"
                >
                  Admin Username / ID
                </label>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-orange"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold uppercase tracking-wider text-white/60"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/80 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-orange"
                />
              </div>

              <button
                type="submit"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-brand transition hover:-translate-y-0.5"
              >
                <StoreIcon className="h-4 w-4" />
                Sign In to Owner Dashboard
              </button>

              <p className="mt-4 text-center text-[10px] uppercase tracking-wider text-white/30">
                Connected to Shared PostgreSQL Instance
              </p>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
