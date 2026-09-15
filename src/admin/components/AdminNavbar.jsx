import React from "react";
import { ChevronRight, Home } from "lucide-react";

export function AdminNavbar({ currentTab, onSelectTab }) {
  const formatTabName = (tab) => {
    return tab
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <nav className="flex items-center gap-2 text-xs text-white/50 mb-6 select-none">
      <button
        onClick={() => onSelectTab("dashboard")}
        className="flex items-center gap-1 text-white/60 hover:text-brand-orange transition cursor-pointer"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Admin</span>
      </button>
      <ChevronRight className="h-3 w-3 text-white/30" />
      <span className="text-brand-orange font-semibold">
        {formatTabName(currentTab)}
      </span>
    </nav>
  );
}
