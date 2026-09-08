import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  ShoppingBag,
  User as UserIcon,
  Sun,
  Moon,
  Store,
  Plus,
  LogOut,
  Palette,
  UserPlus,
  LogIn,
  ChevronDown,
  UserRound,
} from "lucide-react";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mouseLeaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnter = () => {
    if (mouseLeaveTimer.current) {
      clearTimeout(mouseLeaveTimer.current);
      mouseLeaveTimer.current = null;
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    mouseLeaveTimer.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-black/5 dark:border-white/5 bg-white/80 dark:bg-brand-black/85 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight text-brand-black dark:text-white"
          >
            <img src="/logo.png" alt="Custom On Logo" className="h-11 w-11 shrink-0 object-contain drop-shadow-xs" />
            <span>
              CUSTOM<span className="text-brand-orange">ON</span>
            </span>
          </Link>
          <div className="hidden gap-6 text-sm font-medium uppercase tracking-wider md:flex">
            {user?.role !== "shop-owner" &&
              NAV.map((item) => (
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
              <>
                {user.role === "shop-owner" ? (
                  <Link
                    to="/dashboard"
                    activeProps={{ className: "text-brand-orange" }}
                    className="transition-colors hover:text-brand-orange text-brand-black/60 dark:text-white/60 dark:hover:text-white font-bold text-brand-orange"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/designs"
                      activeProps={{ className: "text-brand-orange" }}
                      className="transition-colors hover:text-brand-orange text-brand-black/60 dark:text-white/60 dark:hover:text-white"
                    >
                      My Designs
                    </Link>
                    <Link
                      to="/orders"
                      activeProps={{ className: "text-brand-orange" }}
                      className="transition-colors hover:text-brand-orange text-brand-black/60 dark:text-white/60 dark:hover:text-white"
                    >
                      My Orders
                    </Link>
                  </>
                )}
              </>
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

          {/* Profile / Account Icon & Dropdown */}
          <div
            ref={dropdownRef}
            className="relative hidden md:block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="Account Profile"
              aria-expanded={dropdownOpen}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
                dropdownOpen
                  ? "bg-brand-orange/10 text-brand-orange dark:bg-brand-orange/20"
                  : "text-brand-black/70 dark:text-white/70 hover:bg-brand-gray dark:hover:bg-white/10 hover:text-brand-orange"
              }`}
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-gray dark:bg-white/10 text-brand-black dark:text-white">
                <UserIcon className="h-4 w-4" />
              </div>
              {user && (
                <span className="max-w-[100px] truncate text-xs font-bold text-brand-black dark:text-white">
                  {user.name ?? user.username}
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-brand-orange" : "text-brand-black/40 dark:text-white/40"
                }`}
              />
            </button>

            {/* Account Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full pt-1.5 w-60 z-50">
                <div className="overflow-hidden rounded-2xl border border-brand-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 p-2 shadow-2xl backdrop-blur-md animate-in fade-in-50 zoom-in-95">
                  {/* Header Info */}
                <div className="border-b border-brand-black/5 dark:border-white/5 px-3 py-2.5">
                  {user ? (
                    <div>
                      <p className="text-xs font-extrabold text-brand-black dark:text-white truncate">
                        {user.name ?? user.username}
                      </p>
                      <p className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wider text-brand-orange">
                        {user.role === "shop-owner" ? "Shop Owner Account" : "Customer Account"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-extrabold text-brand-black dark:text-white">Account</p>
                      <p className="mt-0.5 text-[10px] text-brand-black/50 dark:text-white/50">
                        Sign in or create an account
                      </p>
                    </div>
                  )}
                </div>

                {/* Dropdown Options */}
                <div className="mt-1 space-y-0.5">
                  {user ? (
                    <>
                      {user.role === "shop-owner" ? (
                        <>
                          <Link
                            to="/dashboard"
                            search={{ tab: "orders" }}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-black/80 dark:text-white/80 transition-colors hover:bg-brand-orange/10 hover:text-brand-orange"
                          >
                            <Store className="h-4 w-4 shrink-0 text-brand-orange" />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link
                            to="/dashboard"
                            search={{ tab: "blanks" }}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-black/80 dark:text-white/80 transition-colors hover:bg-brand-orange/10 hover:text-brand-orange"
                          >
                            <Plus className="h-4 w-4 shrink-0 text-brand-orange" />
                            <span>Add Product</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-black/80 dark:text-white/80 transition-colors hover:bg-brand-orange/10 hover:text-brand-orange"
                          >
                            <UserRound className="h-4 w-4 shrink-0 text-brand-orange" />
                            <span>Profile</span>
                          </Link>
                          <Link
                            to="/designs"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-black/80 dark:text-white/80 transition-colors hover:bg-brand-orange/10 hover:text-brand-orange"
                          >
                            <Palette className="h-4 w-4 shrink-0 text-brand-orange" />
                            <span>My Designs</span>
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-black/80 dark:text-white/80 transition-colors hover:bg-brand-orange/10 hover:text-brand-orange"
                          >
                            <ShoppingBag className="h-4 w-4 shrink-0 text-brand-orange" />
                            <span>My Orders</span>
                          </Link>
                        </>
                      )}

                      <div className="my-1 border-t border-brand-black/5 dark:border-white/5" />

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        search={{ signup: "true" }}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-black/80 dark:text-white/80 transition-colors hover:bg-brand-orange/10 hover:text-brand-orange"
                      >
                        <UserPlus className="h-4 w-4 shrink-0 text-brand-orange" />
                        <span>Sign Up</span>
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-black/80 dark:text-white/80 transition-colors hover:bg-brand-orange/10 hover:text-brand-orange"
                      >
                        <LogIn className="h-4 w-4 shrink-0 text-brand-orange" />
                        <span>Login</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>

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
          {user?.role !== "shop-owner" &&
            NAV.map((item) => (
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
                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-gray dark:bg-white/10 text-brand-black dark:text-white">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold text-brand-black dark:text-white">
                    {user.name ?? user.username}
                  </span>
                  <span
                    className={`text-[8px] font-extrabold uppercase tracking-wider ${
                      user.role === "shop-owner"
                        ? "text-brand-orange"
                        : "text-brand-black/40 dark:text-white/40"
                    }`}
                  >
                    {user.role === "shop-owner" ? "Shop Owner" : "Customer"}
                  </span>
                </div>
              </div>
              {user.role !== "shop-owner" && (
                <div className="flex flex-col gap-1 mt-1">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2 py-2 text-xs font-bold uppercase text-brand-black/70 dark:text-white/70 hover:text-brand-orange"
                  >
                    <UserRound className="h-4 w-4 text-brand-orange" /> Profile
                  </Link>
                  <Link
                    to="/designs"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2 py-2 text-xs font-bold uppercase text-brand-black/70 dark:text-white/70 hover:text-brand-orange"
                  >
                    <Palette className="h-4 w-4 text-brand-orange" /> My Designs
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2 py-2 text-xs font-bold uppercase text-brand-black/70 dark:text-white/70 hover:text-brand-orange"
                  >
                    <ShoppingBag className="h-4 w-4 text-brand-orange" /> My Orders
                  </Link>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="mt-1 w-full rounded-xl bg-brand-gray dark:bg-white/10 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-brand-black dark:text-white transition-colors hover:bg-brand-orange hover:text-white dark:hover:bg-brand-orange"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-brand-black/5 dark:border-white/5 mt-2 pt-3 px-2 flex flex-col gap-2">
              <Link
                to="/login"
                search={{ signup: "true" }}
                onClick={() => setOpen(false)}
                className="border border-brand-orange bg-brand-orange/10 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-brand-orange hover:bg-brand-orange hover:text-white transition-colors rounded-xl text-center"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="border border-brand-black/10 dark:border-white/10 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-brand-black dark:text-white hover:border-brand-orange rounded-xl text-center"
              >
                Log In
              </Link>
            </div>
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
