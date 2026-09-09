import React from "react";
import { Bell, Search, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function AdminHeader({ title = "Dashboard", onSearch }) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-white/10 bg-[#0e0e11]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20 text-white">
      {/* Title & Path */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-lg font-bold uppercase tracking-tight text-white">
          {title}
        </h1>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center w-80 relative">
        <input
          type="text"
          placeholder="Search products, orders, users..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="w-full rounded-xl bg-zinc-800/80 border border-white/10 px-3.5 py-1.5 pl-9 text-xs text-white placeholder-white/30 outline-none transition focus:border-brand-orange"
        />
        <Search className="h-3.5 w-3.5 absolute left-3 text-white/40 pointer-events-none" />
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Admin notifications"
          className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
          <div className="h-8 w-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-xs font-bold shadow-brand">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>{user?.name || "Admin Manager"}</span>
              <UserCheck className="h-3 w-3 text-brand-orange" />
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">
              {user?.role || "System Admin"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
