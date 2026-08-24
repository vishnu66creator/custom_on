import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShoppingBag, User as UserIcon, Sun, Moon, Store, Plus } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";

const NAV = [
  { to: "/studio", label: "Design" },
  { to: "/products", label: "Products" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-black/5 dark:border-white/5 bg-white/80 dark:bg-brand-black/85 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tight text-brand-black dark:text-white">
            CUSTOM<span className="text-brand-orange">ON</span>
          </Link>
          <div className="hidden gap-6 text-sm font-medium uppercase tracking-wider md:flex">
            {user?.role !== "shop-owner" && NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-brand-orange" }}
                className="transition-colors hover:text-brand-orange text-brand-black/60 dark:text-white/60 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/dashboard"
                activeProps={{ className: "text-brand-orange" }}
                className={`transition-colors hover:text-brand-orange text-brand-black/60 dark:text-white/60 dark:hover:text-white ${
                  user.role === "shop-owner" ? "font-bold text-brand-orange" : ""
                }`}
              >
                {user.role === "shop-owner" ? "Dashboard" : "My Orders"}
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle Theme"
            className="rounded-full p-2 text-brand-black/60 dark:text-white/60 hover:bg-brand-gray dark:hover:bg-white/5 hover:text-brand-orange dark:hover:text-brand-orange transition-colors"
          >
            {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Auth Section */}
          {user ? (
            <div className="hidden items-center gap-4 md:flex">
              <div className="flex items-center gap-2 border-r border-brand-black/10 dark:border-white/10 pr-4">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-gray dark:bg-white/10 text-brand-black dark:text-white">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xs font-bold text-brand-black dark:text-white">{user.username}</span>
                  <span className={`mt-0.5 text-[8px] font-extrabold uppercase tracking-wider ${
                    user.role === "shop-owner" ? "text-brand-orange" : "text-brand-black/40 dark:text-white/40"
                  }`}>
                    {user.role === "shop-owner" ? "Shop Owner" : "Customer"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-[10px] font-bold uppercase tracking-widest text-brand-black/60 dark:text-white/60 transition-colors hover:text-brand-orange"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden text-[10px] font-bold uppercase tracking-widest text-brand-black dark:text-white transition-colors hover:text-brand-orange md:inline-block"
            >
              Log In
            </Link>
          )}

          {user?.role === "shop-owner" ? (
            <div className="hidden gap-2 md:flex">
              <Link
                to="/dashboard"
                search={{ tab: "orders" }}
                className="bg-brand-black dark:bg-zinc-800 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-orange"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Store className="h-4 w-4" /> Dashboard
                </span>
              </Link>
              <Link
                to="/dashboard"
                search={{ tab: "blanks" }}
                className="bg-brand-orange px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-black dark:hover:bg-zinc-900"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Add Product
                </span>
              </Link>
            </div>
          ) : (
            <Link
              to="/studio"
              className="hidden bg-brand-black dark:bg-brand-orange px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-orange dark:hover:bg-white dark:hover:text-brand-black md:inline-block"
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Start Designing
              </span>
            </Link>
          )}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center md:hidden text-brand-black dark:text-white"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-4 flex flex-col gap-1 border-t border-brand-black/5 dark:border-white/5 pt-4 md:hidden">
          {user?.role !== "shop-owner" && NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="px-2 py-3 text-sm font-medium uppercase tracking-wider text-brand-black/70 dark:text-white/70 hover:text-brand-orange"
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className={`px-2 py-3 text-sm uppercase tracking-wider text-brand-black/70 dark:text-white/70 hover:text-brand-orange ${
                user.role === "shop-owner" ? "font-bold text-brand-orange" : "font-medium"
              }`}
            >
              {user.role === "shop-owner" ? "Dashboard" : "My Orders"}
            </Link>
          )}
          
          {user ? (
            <div className="border-t border-brand-black/5 dark:border-white/5 mt-2 pt-3 px-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-gray dark:bg-white/10 text-brand-black dark:text-white">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold text-brand-black dark:text-white">{user.username}</span>
                  <span className={`text-[8px] font-extrabold uppercase tracking-wider ${
                    user.role === "shop-owner" ? "text-brand-orange" : "text-brand-black/40 dark:text-white/40"
                  }`}>
                    {user.role === "shop-owner" ? "Shop Owner" : "Customer"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="mt-1 w-full bg-brand-gray dark:bg-white/10 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-brand-black dark:text-white transition-colors hover:bg-brand-orange hover:text-white dark:hover:bg-brand-orange"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-2 border border-brand-black/10 dark:border-white/10 py-3 text-center text-xs font-bold uppercase tracking-widest text-brand-black dark:text-white hover:border-brand-orange"
            >
              Log In
            </Link>
          )}

          {user?.role === "shop-owner" ? (
            <>
              <Link
                to="/dashboard"
                search={{ tab: "orders" }}
                onClick={() => setOpen(false)}
                className="mt-2 bg-brand-black dark:bg-zinc-800 px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-white"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/dashboard"
                search={{ tab: "blanks" }}
                onClick={() => setOpen(false)}
                className="mt-2 bg-brand-orange px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-white"
              >
                Add Product
              </Link>
            </>
          ) : (
            <Link
              to="/studio"
              onClick={() => setOpen(false)}
              className="mt-2 bg-brand-black dark:bg-brand-orange px-5 py-3 text-center text-xs font-bold uppercase tracking-widest text-white"
            >
              Start Designing
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
