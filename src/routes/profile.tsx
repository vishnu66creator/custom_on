import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, LogOut, Palette, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  if (isLoading) {
    return null;
  }
  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f3ee] p-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black uppercase">Sign in to view your profile</h1>
          <Link
            to="/login"
            className="mt-5 inline-flex rounded-xl bg-brand-orange px-5 py-3 text-xs font-black uppercase tracking-wider text-white"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }
  const displayName = user.name ?? user.username;
  const signOut = () => {
    logout();
    navigate({ to: "/" });
  };
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-brand-black dark:bg-[#0b0b0d] dark:text-white">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brand-orange">
              Customer account
            </p>
            <h1 className="mt-2 font-display text-5xl font-black uppercase">My profile</h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-xs font-black uppercase tracking-wider dark:border-white/15"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
        <section className="mt-8 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="grid place-items-center rounded-3xl bg-brand-black p-8 text-white">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-orange text-3xl font-black">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <p className="mt-4 text-center text-lg font-black">{displayName}</p>
            <p className="text-center text-xs opacity-60">Customer account</p>
          </div>
          <div className="rounded-3xl bg-white p-7 shadow-sm dark:bg-white/5">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-brand-orange" />
              <h2 className="text-xl font-black uppercase">Account information</h2>
            </div>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-black uppercase tracking-wider opacity-50">Name</dt>
                <dd className="mt-1 text-lg font-bold">{displayName}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-black uppercase tracking-wider opacity-50">
                  Phone / login
                </dt>
                <dd className="mt-1 text-lg font-bold">{user.username}</dd>
              </div>
            </dl>
          </div>
        </section>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link
            to="/designs"
            className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 dark:bg-white/5"
          >
            <Palette className="h-6 w-6 text-brand-orange" />
            <h2 className="mt-5 font-black uppercase">My designs</h2>
            <p className="mt-2 text-sm opacity-60">View and edit your saved custom designs.</p>
            <ArrowRight className="mt-5 h-4 w-4" />
          </Link>
          <Link
            to="/orders"
            className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 dark:bg-white/5"
          >
            <ShoppingBag className="h-6 w-6 text-brand-orange" />
            <h2 className="mt-5 font-black uppercase">My orders</h2>
            <p className="mt-2 text-sm opacity-60">Track your order history and view purchase snapshots.</p>
            <ArrowRight className="mt-5 h-4 w-4" />
          </Link>
          <Link
            to="/cart"
            className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 dark:bg-white/5"
          >
            <UserRound className="h-6 w-6 text-brand-orange" />
            <h2 className="mt-5 font-black uppercase">My cart</h2>
            <p className="mt-2 text-sm opacity-60">Review items in your cart.</p>
            <ArrowRight className="mt-5 h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
